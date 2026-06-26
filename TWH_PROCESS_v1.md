# The Witching Hour — Process & Build Governance
### TWH_PROCESS_v1.md
### Created: June 2026

This document governs how every build session is run. It exists alongside the Brief as a required read at the start of every Claude Code session. These rules are not suggestions — they are the standards that keep builds clean, efficient, and error-free.

They are inherited and refined from Wizard Mansion's build experience (13 build parts, 100+ migrations). Every rule here was either learned the hard way on WM or is a direct preventive measure against a WM failure mode.

---

## 1. Session Starter Block

Every Claude Code prompt must open with this block verbatim.
No exceptions. Do not begin any build work until this is confirmed.

```
Before writing any code or SQL, read these two files in full
and confirm you have read them before proceeding:
1. TWH_BRIEF_v1.md — the complete authoritative record of the
   tech stack, design system, all database schemas, and all
   confirmed design decisions.
2. TWH_PROCESS_v1.md — the build governance rules you must
   follow throughout this session.
Once you have read both, confirm you are ready and I will
provide the build instructions.
```

**CRITICAL:** Always use the exact versioned filenames. If you cannot find the versioned file, stop and flag it — never fall back to an unversioned or prior-version file.

This single step prevents the majority of "built something that doesn't match the spec" errors.

---

## 2. Schema Verification Rule

Before writing any SQL or any server action that touches a database table, verify the actual schema first. **Never assume column names from memory or from a previous session.**

**Required query before touching any table:**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```

Run this for every table a prompt will touch. Paste results back before writing any code that references those columns.

**This rule is non-negotiable.** Two confirmed WM failures caused by schema assumptions:
- WM Phase 12: SQL errors from assumed column names
- WM Migration 068: `hasPermission()` used `is_granted` (does not exist) instead of `is_enabled` — silently broke Staff Lounge nav for all users

**The TWH equivalent:** permission column is `is_enabled`. NEVER `is_granted`. If you write `is_granted` anywhere in this codebase it is a bug.

---

## 3. Scope Lock

Every prompt has a defined scope. Do not build anything outside that scope, even if it seems obviously related or helpful.

If during a build you notice something adjacent that needs doing, record it as a follow-up question (Q-item) in the post-build summary. Do not build it. Do not "just fix it while you're here."

**Why:** Scope creep is the primary source of unexpected breakage. WM had multiple incidents where "just fixing it while here" introduced regressions in untouched features.

**Follow-up Q pattern:** At the end of every build, list outstanding questions as:
```
Q1. [Question about something noticed but not acted on]
Q2. [Another question]
```
These carry forward to the next prompt.

---

## 4. Migration Discipline

### Naming Convention
Migrations are numbered sequentially: `001`, `002`, `003`, etc.
Filename format: `{number}_{descriptive_snake_case}.sql`
Example: `001_core_tables.sql`, `002_roles_permissions.sql`

### Migration Rules
- One migration per logical unit of change
- Migrations are applied via Supabase MCP directly — this is the canonical workflow
- Every migration that creates a table with FK columns MUST add explicit indexes on those FK columns
- PostgreSQL does NOT automatically index FK columns
- Composite index column order: most selective / most-filtered column first

### REPLICA IDENTITY FULL
Tables that use Supabase Realtime UPDATE events MUST have:
1. `ALTER TABLE table_name REPLICA IDENTITY FULL;` in the migration
2. The table added to the `supabase_realtime` publication: `ALTER PUBLICATION supabase_realtime ADD TABLE table_name;`

**Both are required. Neither alone is sufficient.** WM discovered this mid-build after UPDATE events silently failed.

Required for TWH at launch: `chat_messages`, `mail_messages`

---

## 5. The Phase A / Phase B Structure

Any prompt that involves debugging, investigating an unexpected behavior, or fixing something that "should work but doesn't" MUST use Phase A / Phase B structure.

**Phase A (Investigation — read-only):**
- Verify live state, not intended state
- Run actual queries against the live database
- Check pg_policies, information_schema, actual row counts
- Check deployed code behavior (Vercel deploy may lag commits)
- Do NOT write any fixes in Phase A
- Report findings and wait for authorization to proceed

**Phase B (Targeted fix):**
- Only after Phase A findings are confirmed
- Addresses the root cause identified in Phase A
- Does not address anything else

**Why:** WM DELETE-CASCADE-MAIL-GIFTS Phase A initially assumed 1:1 cardinality from reading the schema. Live query revealed 1:many — some mail_messages had 3+ gift rows. The Phase A fix based on assumed cardinality would have destroyed sibling gifts. Phase B was correct only because Phase A ran live queries.

**The rule:** Phase A must verify against live state, not against what the code intends.

---

## 6. RLS Pre-Prompt Verification

Before writing any prompt that touches Row Level Security (RLS) policies, query `pg_policies` first:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'your_table_name';
```

This is mandatory because:
- Missing UPDATE policies cause 503 errors in Server Actions that write then read (WM CHAT-3b root cause)
- Missing INSERT policies cause silent failures
- RLS must cover all operations your code performs (SELECT, INSERT, UPDATE, DELETE)

---

## 7. Authentication & Permissions Rules

### The Two-Cookie-Aware-Client Rule
**A Server Action MUST NOT contain two cookie-aware Supabase clients.** This causes a `setAll()` conflict that results in a 503 error during response finalization.

A cookie-aware client is created by `createServerClient(url, key, { cookies: { ... } })`.

**The conflict pattern (WM CHAT-3b root cause):**
```ts
// WRONG — two cookie-aware clients in one Server Action
export async function myAction() {
  const supabase = createServerClient(...) // client 1, cookie-aware
  const user = await supabase.auth.getUser()
  const hasPerm = await hasPermission(userId, 'delete_posts') // creates client 2 inside
  // 503 on response finalization
}
```

**The fix — inline permission checks using the admin client:**
```ts
// CORRECT
export async function myAction() {
  const supabase = createServerClient(...) // one cookie-aware client
  const admin = createAdminClient()        // admin client, no cookies
  const { data: perm } = await admin
    .from('role_permissions')
    .select('is_enabled')
    .eq('role_id', roleId)
    .eq('permission_id', permId)
    .single()
  // proceed with supabase for user operations
}
```

### Admin Client Write Pattern
When a Server Action needs to write data that a user's RLS policies would block (e.g. soft-deleting another user's message as a moderator), use the admin client for that specific write. Do NOT use the admin client for reads that should be RLS-filtered.

### Pre-Prompt RLS UPDATE Verification
Before writing any prompt that involves a Server Action which performs an UPDATE on a table, verify that an UPDATE RLS policy exists for that table. Missing UPDATE policies cause 503s even when the DB write succeeds.

```sql
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'your_table' AND cmd = 'UPDATE';
```

---

## 8. Supabase & Database Rules

### Realtime Requirements (Two-Layer)
For Realtime UPDATE events to work, BOTH of these must be true:
1. `ALTER TABLE t REPLICA IDENTITY FULL;`
2. `ALTER PUBLICATION supabase_realtime ADD TABLE t;`

Check both before assuming Realtime is configured. WM confirmed this the hard way with chat_messages.

### The browserSupabase Singleton
All client-side Realtime subscriptions use the singleton in `lib/supabase/browserClient.ts`. Never call `createClient()` directly in a component. Multiple `createClient()` calls create duplicate connections.

### Cached Settings — Never Bypass
Before writing any new query against a cached table (see §17 of the Brief), check `lib/cached-settings.ts`. If a cached version exists, use it. Admin mutations that modify cached data MUST call `revalidateTag(tag)`.

### jsonb Columns
When querying a jsonb column with PostgREST, note: a many-to-one FK relationship returns an object, not an array. Verify the actual shape of returned data before accessing it in code.

### mail_gifts Constraint Pattern (inherited from WM)
If the database has a CHECK constraint requiring at least one content column to be non-null on a row (like WM's mail_gifts_has_content), deleting a referenced item requires application-level cleanup of those rows BEFORE the parent DELETE. Verify this pattern applies to any similar table.

---

## 9. Vercel Platform Constraints

### 4.5MB Serverless Function Body Limit (Hobby Plan)
This limit applies to the entire request body of a Serverless Function. It is enforced at the platform layer before application code runs.

**Consequence:** File uploads larger than ~4.5MB CANNOT go through Server Actions on Vercel Hobby.

**The P-DC Pattern (Direct Browser Upload):**
- Client uploads directly to Supabase Storage via the browser Supabase client
- Storage bucket requires appropriate RLS policies on `storage.objects`
- Server Action only receives the resulting URL, not the file data
- Use `lib/uploadAdminImage.ts` as the shared helper for admin uploads

**Pre-build check:** Any prompt involving file uploads must confirm the upload path. If the file could exceed 4.5MB, P-DC is required.

---

## 10. Verification Discipline

### Hard Refresh After Deploy
After pushing a fix and waiting for Vercel to deploy, always do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) before testing. Cached browser state is a common source of "my fix didn't work" false negatives.

### Source-Level Grep Verification
When verifying that a function, import, or pattern is used correctly throughout the codebase, use grep:
```bash
grep -r "functionName" --include="*.ts" --include="*.tsx" .
```
Do not rely on "the code looks right" — verify with evidence.

### No Self-Audit Reformulation
When asked to audit whether something works, do not reformulate the question to answer a version that's easier to confirm. If the question is "does delete-with-pending-gifts work end-to-end?", the answer requires live execution evidence, not "the code calls the cleanup function."

**Audit answer pattern:**
```
Q. Does [feature] work end-to-end?
Evidence:
- Pre-state: [DB query result before action]
- Action: [action performed]
- Post-state: [DB query result after action]
Verdict: YES/NO — [one sentence]
```

### Design Tokens Are Not Suggestions
When a design token (color, font, spacing, border radius) is specified in the Brief, use exactly that value. Do not substitute a "similar" value. The Blood Moon design system has specific hex values — use them precisely.

### STOP and Report
If a build produces an unexpected result (error, wrong behavior, missing element), STOP and report it immediately. Do not attempt a speculative fix. The correct path is Phase A investigation.

### Smoke Test Before Push
The build chat should perform a smoke test of the primary user flow before pushing to Vercel. For Claude Code sessions: explicitly test the feature in the browser, not just verify that the code compiled.

### Grep Evidence, Not YES/NO
When audit questions ask about code presence, provide grep evidence:
```bash
grep -r "revalidateTag" --include="*.ts" . | grep "site-settings"
```
A YES answer without evidence is unacceptable.

### inline-style Overrides Tailwind
When both `className` Tailwind utilities and inline `style` attributes are present on the same element, the inline `style` always wins regardless of specificity. If a Tailwind class isn't applying, check for a conflicting inline style.

### matchMedia Avoidance
Do not use `window.matchMedia` for responsive layout breakpoints. Tailwind responsive utilities (`sm:`, `md:`, `lg:`) are the correct approach. `matchMedia` creates hydration mismatches.

### Server Action 503 Diagnostic Flow
If a Server Action returns 503 but the DB write succeeds:
1. Check for two cookie-aware Supabase clients in the same action (§7)
2. Check for missing RLS UPDATE policy (§6)
3. Check for Vercel body limit exceeded (§9)
Do not attempt other fixes until these three are ruled out in order.

### Investigation-First After a Fix Didn't Land
If a deployed fix doesn't produce the expected result, do NOT write another fix. Run Phase A first: verify that the deployed code matches the local code, verify live DB state, verify the fix addressed the actual root cause.

### Architectural Fix Path
When a fix targets a symptom, ask: is there a structural rewrite that eliminates the entire bug class? WM CHAT-3c-fix → CHAT-3c-fix-2 example: the first fix added a runtime lookup function; the second restructured data flow so the lookup was never needed. The structural fix was the correct answer.

### Realtime Needs Parallel Enrichment
When a Realtime subscription receives an INSERT event, it must apply the same data enrichment as the initial page fetch. If the page fetch enriches rows with related data (author info, character info, etc.), the Realtime handler must do the same enrichment for new rows. WM: the initial fetch and realtime handler for chat_messages both called `resolveChatMentions()`.

### Audit Questions Must Verify Outcome
Audit questions must verify that behavior works, not just that the code calls the right function. Code presence is necessary but not sufficient. Evidence of correct behavior is required.

---

## 11. npx next lint

Run `npx next lint 2>/dev/null` before pushing any code changes. Do not push if lint errors exist. Warnings are acceptable; errors are not.

---

## 12. Migration Application Protocol

1. Write migration SQL
2. Apply via Supabase MCP (canonical workflow — confirmed in WM Build Part 11)
3. Run `npx supabase gen types typescript --project-id [id] > types/database.ts` to regenerate types
4. Verify the migration applied by querying `information_schema.columns`
5. Confirm in Brief that the migration is recorded

Never apply migrations by copy-pasting into the Supabase UI SQL editor for anything beyond exploration. The MCP application workflow is the source of truth.

---

## 13. Production Push Protocol

**Visual changes (no schema):**
1. `git add -A && git commit -m "descriptive message"`
2. `git push origin main`
3. Wait for Vercel deploy (watch dashboard)
4. Hard refresh browser
5. Smoke test primary user flow

**Schema changes:**
1. Apply migration via Supabase MCP
2. Verify migration applied (`information_schema` query)
3. Regenerate TypeScript types
4. Run `npx next lint`
5. `git add -A && git commit -m "migration NNN: descriptive message"`
6. `git push origin main`
7. Wait for Vercel deploy
8. Hard refresh + smoke test

**Claude Code commits without pushing:** Claude Code may commit without pushing. Always verify the commit happened (`git log --oneline -3`) before the session ends. Never assume a commit was made — verify.

---

## 14. Design System Compliance

Every UI element must use the Blood Moon design tokens from §4 of the Brief. When building a new page or component:

1. Check the Brief for the relevant color tokens
2. Use CSS custom properties (`var(--ember)`, `var(--gold)`, etc.) — never hardcode hex values in component code
3. Typography: Cormorant Upright for display, Playfair Display for headings, Cinzel for UI labels, EB Garamond for body — no other fonts
4. Border radius: small and elegant — 2px, 4px, 7px, 11px. No pill shapes unless explicitly specified
5. The faction color system must be consistent throughout: Covenant = gold, Cabal = ember, Unbound = moonstone — everywhere, always

**Filigree vocabulary (canonical):**
- Dividers: gradient lines (ember → gold) with `◆` diamond pips or `✦` star glyphs
- Panel headers: Cinzel font, small uppercase, muted color (`var(--faded)`)
- Corner accents: 2px L-shaped brackets in accent/faction color
- Avatar rings: dashed border circles, rotating, in ember + gold

---

## 15. Canon Source System

The `canon_source` field appears on: `board_threads`, `board_posts`, `characters`, `grimoire_entries`, `rewatch_events`, and potentially more tables.

**Canonical values:**
```
'charmed' | 'buffy' | 'angel' | 'secret_circle' | 'the_craft' |
'witches_of_east_end' | 'practical_magic' | 'original' | 'all'
```

These values are exact strings — no variations, no capitalisation, no spaces. When adding a new feature that needs canon tagging, use these exact strings as a CHECK constraint or enum.

**Color mapping for canon badges (use CSS variables):**
- `charmed` → `var(--gold)` / `var(--gold-dim)` border
- `buffy` → `var(--moonstone)` / `var(--moon-dim)` border
- `angel` → `var(--ember)` / `var(--ember-dim)` border
- Supporting shows → `var(--mist)` / muted treatment

---

## 16. Character System Rules

### Two Tables — Never Conflate Them
- `users` — the account-level profile. One row per registered user. Display name, avatar, bio, theme preference, watching status, active_character_id. Maps 1:1 with `auth.users`.
- `characters` — RP character sub-profiles. Up to 3 per user. Name, faction, powers, XP, level, status. FK to `users.id`.

**`users` = the person. `characters` = the personas they play.**

When a feature refers to "the user's profile", it queries `users`. When it refers to "the user's character", it queries `characters`. Never use `users` to mean an RP character and never use `characters` to mean the account profile.

### Active Character
The currently-selected RP character for IC posting is stored as `active_character_id` on the `users` table. This is a nullable FK to `characters.id`. It is set when the user selects a character from their My Characters page or the character selector.

### Approval Gate
Only characters with `status = 'active'` can be selected for IC posting. Characters in `status = 'pending'` or `status = 'suspended'` must not appear in the IC character selector.

### XP Deduction Pattern
Always atomic:
```sql
UPDATE characters
SET xp = xp - $cost
WHERE id = $character_id AND xp >= $cost
RETURNING id
```
If no row returned: reject with "Insufficient XP" error. Never read XP then subtract — always conditional UPDATE.

---

## 17. Faction System Rules

Factions are fixed at three: Covenant (gold), Cabal (ember), Unbound (moonstone). They are seeded in Migration 005 and not admin-editable (the names and colors are part of the site's identity).

Faction boards use `scope = 'faction'` and `scope_id = faction.id`. RLS enforces that only users with an active character in that faction can read/write.

The faction color must appear consistently: as a diamond pip in post headers, as a left-border accent on faction-scoped panels, as the `data-faction` CSS attribute for theming.

---

## 18. Outstanding Rules Queue

*This section accumulates rules discovered during builds that don't yet fit a category. Promoted to a numbered section on next document update.*

*(Empty — all TWH-0.1 discoveries promoted to §19)*

---

## 19. Tailwind v4 / Turbopack Platform Rules

Discovered: TWH-0.1 (June 2026). These rules apply for the lifetime of this project.

### Google Fonts — Use `<link>` tags, not CSS `@import`

Tailwind v4 + Turbopack inline CSS at build time. This means a CSS `@import url(...)` for Google Fonts is **invalid** — it lands after real CSS rules and is silently ignored by some renderers.

**Correct pattern** (implemented in `app/layout.tsx`):
```tsx
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Cormorant+Upright:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cinzel:wght@400;500;600&display=swap"
  />
</head>
```

**Wrong pattern** (do not use):
```css
/* app/globals.css — INVALID in Tailwind v4 + Turbopack */
@import url('https://fonts.googleapis.com/css2?...');
```

This is functionally equivalent to the CSS import and fully supported by all browsers. Do not change it to a CSS import in any future session.

### Next.js Version

This project runs **Next.js 16.2.9** (installed by `create-next-app@latest`). The Brief targets Next.js 14 patterns — all are compatible with 16. Do not downgrade. If a Next.js API behaves unexpectedly, check the v16 changelog before assuming a Brief error.

---

*Last updated: June 2026 — v1.2 (table rename: characters→users, characters_rp→characters; email confirmation enabled)*
*Version history: v1 (Phase 0 inception) → v1.1 (TWH-0.1: §19 added) → v1.2 (TWH-0.1 Q-items: table rename + email confirmation)*
*This document must be updated whenever a new standing rule is agreed upon.*
*Cross-reference: TWH_BRIEF_v1.md*
