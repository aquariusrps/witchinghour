# The Witching Hour — Master Project Brief
### Comprehensive Build Document v1 — Complete & Authoritative
### Created: June 2026

---

## 1. What This Is

**The Witching Hour** is a fan community and roleplay hub for the tradition of late-90s and early-2000s supernatural television — built with Charmed as its soul and heart, extending to Buffy the Vampire Slayer, Angel, and supporting canons including The Secret Circle, The Craft, Witches of East End, and Practical Magic.

The site recreates and modernises the early-2000s fansite experience of communities like Charmed Boards and Charmed: The Prophecy — specifically their deeply customised forum + roleplay hybrid format — rebuilt from scratch on a modern stack.

**Primary pillars:**
- Community forums with multi-show discussion, organised by canon
- Post-by-post collaborative roleplay with in-character (IC) posting
- Character sub-profiles linked to user accounts, with faction affiliation, powers, XP, and levelling
- A rewatch club with live watch party events
- A lore compendium (The Grimoire) covering powers, demons, locations, and mythology

This is a fully custom build. No CMS. No game engine. Built from scratch.

**Domain:** `atwitchinghour.com` (primary) + `atwitchinghour.net` (redirect to .com)
Vercel preview URL: `https://the-witching-hour.vercel.app`

**Landing page copy (confirmed):**
- Hero line: *"The Witching Hour is upon us."* — "The Witching Hour" in Cormorant Upright weight 600 gold, "is upon us." in weight 300 roseash — one continuous line
- Tagline: *"For those who never stopped believing in magic."* — EB Garamond italic
- Primary CTA: "Enter the Circle" → /register
- Secondary CTA: "I already belong" → /login

---

## 2. Tech Stack

- **Framework:** Next.js 16.2.9 (App Router, TypeScript throughout)
  Installed via `create-next-app@latest` — v16 not v14. All App Router patterns
  in this Brief (`unstable_cache`, `cookies()`, Server Actions, Realtime) work
  identically on v16. Do not pin to 14.
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password, sessions, email confirmation required)
  Confirmation email sent via Resend. User lands on "Check your email" page after
  registration. Welcome Council Notice fires after confirmation, not on sign-up.
- **Realtime:** Supabase Realtime (live chat, notifications, online presence)
- **File Storage:** Supabase Storage (avatars, character portraits, theme assets)
- **Image Processing:** sharp (server-side, lossless PNG processing for all image uploads)
- **Styling:** Tailwind CSS v4 (CSS-first configuration — no tailwind.config.ts)
  Tailwind v4 uses an `@theme` block in `globals.css` instead of `tailwind.config.ts`.
  Color tokens and font families are defined there, not in a JS config file.
  Do NOT create or reference `tailwind.config.ts` — it is not used in this project.
- **Rich Text Editor:** Tiptap (@tiptap/react, @tiptap/starter-kit, extensions)
  Used in: forum posts, Grimoire entries, character bios, Whispers composition
  Custom extension: spoiler tags (click-to-reveal)
  Output: HTML stored in database, rendered via DOMPurify-sanitized display
- **HTML Sanitization:** DOMPurify — sanitizes all HTML before rendering to users
- **Email:** Resend (transactional email, welcome emails)
  **Rate limit (free tier): 5 req/s** — bulk sends MUST use `resend.batch.send([...])`, never individual `resend.emails.send()` in a loop
- **Deployment:** Vercel (free Hobby tier, auto-deploys on GitHub push)
  **Critical Vercel constraint:** 4.5MB Serverless Function body limit on Hobby plan.
  Admin image uploads MUST use the P-DC (direct browser upload) pattern — see §19.
  Never route large file uploads through Server Actions on Hobby plan.

### Required Environment Variables
All four must be present in `.env.local` locally AND in Vercel Environment Variables
for production. The site will fail silently or 404 if any are missing.

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (never expose client-side)
RESEND_API_KEY=                  # Resend API key for transactional email
NEXT_PUBLIC_SITE_URL=            # Full site URL (https://atwitchinghour.com in production)
```

**Pre-deploy checklist:** Before any Vercel deployment, confirm all five variables
are set in Vercel → Settings → Environment Variables. A missing env var will not
cause a build failure but WILL cause runtime 404s or auth failures.

### Supabase Configuration (Dashboard)
Authentication → URL Configuration:
- Site URL: `https://atwitchinghour.com` (update when domain is live)
- Redirect URLs: `https://atwitchinghour.com/auth/callback`
  Also add: `http://localhost:3000/auth/callback` for local dev
  Also add: `https://the-witching-hour.vercel.app/auth/callback` for Vercel preview

### Supabase Storage Buckets (all public)
- `portraits` — user avatar images
- `characters` — character portrait images (path: character-portraits/{uuid}.{ext})
- `rich-text-images` — Tiptap editor image uploads (admin-only)

---

## 3. Canons & Show Hierarchy

### Primary Canons (full forum wings, RP support, show ribbon colour-coded)

| Show | Ribbon colour | Hex | Notes |
|---|---|---|---|
| Charmed | Gold | #e0b028 | The heart of the site. Always listed first. |
| Buffy the Vampire Slayer | Moonstone blue | #3878a8 | Largest supporting fandom |
| Angel | Ember | #c83818 | Companion to Buffy |

### Supporting Canons (subforum presence, character support, lighter ribbon treatment)

| Show | Notes |
|---|---|
| The Secret Circle | Circle coven arc — natural fit |
| The Craft (1996 film) | Film, not series — aesthetically central |
| Witches of East End | Norse mythology angle |
| Practical Magic | Owens family lore |

**Canon source field values (used throughout the database):**
`'charmed'` `'buffy'` `'angel'` `'secret_circle'` `'the_craft'` `'witches_of_east_end'` `'practical_magic'` `'original'` `'all'`

The value `'original'` is used for characters and content not tied to any specific show. The value `'all'` is used for cross-canon content (events, site-wide threads).

---

## 4. Design System — Blood Moon (Default Theme)

The default theme is **Blood Moon**. All UI is built to this palette first. Other themes are applied as CSS variable overrides (see §8 Multi-Theme Engine).

### The Six Hero Colors

| Name | Hex | Role |
|---|---|---|
| Char (base) | `#100808` | Page background — near-black with red undertone |
| Deep Claret (surface) | `#301010` | Cards, panels, nav surfaces |
| Rose Ash (light) | `#f0d4c0` | Primary text — warm, not pure white |
| Ember (primary accent) | `#c83818` | Links, Cabal faction, CTA buttons, unread indicators |
| Harvest Gold (secondary) | `#e0b028` | Covenant faction, active states, XP bars, gold trim |
| Moonstone (tertiary) | `#3878a8` | Unbound faction, success states, Buffy canon tag, cool contrast |

### Extended / Derived Tones

| Name | Hex | Role |
|---|---|---|
| Raised | `#1e0c0c` | Between char and claret — hover states, inset boxes |
| Elevated | `#3e1818` | Dropdowns, modals, active surfaces |
| Mist | `#b89080` | Secondary text — warm sepia |
| Faded | `#6a4838` | Muted text, timestamps, placeholders |
| Ember light | `#e06030` | Hover on ember |
| Ember dim | `#7a2010` | Borders using ember colour at low opacity |
| Gold light | `#f0c840` | Hover on gold |
| Gold dim | `#8a6818` | Borders using gold colour |
| Moon light | `#58a8d0` | Hover on moonstone |
| Moon dim | `#1a4870` | Borders using moonstone colour |

### Faction Color Mapping

| Faction | Color | Hex | Light variant | Fill |
|---|---|---|---|---|
| The Covenant | Harvest Gold | `#e0b028` | `#f0c840` | `rgba(224,176,40,0.12)` |
| The Cabal | Ember | `#c83818` | `#e06030` | `rgba(200,56,24,0.12)` |
| The Unbound | Moonstone | `#3878a8` | `#58a8d0` | `rgba(56,120,168,0.12)` |

**Faction diamond pip:** A small square rotated 45° in the faction color. Used in post headers, online lists, character badges, nav indicators throughout.

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | Cormorant Upright (wght 300–600) | Site logo, page headings, character names, hero text |
| Heading | Playfair Display (ital + wght 400–700) | Card titles, section headings, thread titles |
| UI Labels | Cinzel (wght 400–600) | Nav links, category labels, panel headers, ALL CAPS UI elements |
| Body | EB Garamond (ital + wght 400–600) | All body text, post content, descriptions, metadata |

**Import via Google Fonts:**
```
https://fonts.googleapis.com/css2?family=Cormorant+Upright:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cinzel:wght@400;500;600&display=swap
```

### CSS Variable Naming Convention

All design tokens are declared as CSS custom properties on `:root`. Theme switching works by applying a `data-theme` attribute to `<body>` which overrides these variables. Tailwind v4 utility classes (e.g. `text-ember`, `bg-claret`) are defined in the `@theme` block in `globals.css` and resolve to these CSS variables — so they remain theme-aware.

```css
:root {
  /* Six hero colors */
  --char:        #100808;
  --claret:      #301010;
  --roseash:     #f0d4c0;
  --ember:       #c83818;
  --gold:        #e0b028;
  --moonstone:   #3878a8;
  /* Extended tones */
  --raised:      #1e0c0c;
  --elevated:    #3e1818;
  --mist:        #b89080;
  --faded:       #6a4838;
  --ember-light: #e06030;
  --ember-dim:   #7a2010;
  --gold-light:  #f0c840;
  --gold-dim:    #8a6818;
  --moon-light:  #58a8d0;
  --moon-dim:    #1a4870;
  /* Faction fills */
  --cov-fill:    rgba(224,176,40,0.12);
  --cab-fill:    rgba(200,56,24,0.12);
  --unb-fill:    rgba(56,120,168,0.12);
  --cov-border:  rgba(224,176,40,0.35);
  --cab-border:  rgba(200,56,24,0.35);
  --unb-border:  rgba(56,120,168,0.35);
  /* Alpha / glow tokens (added TWH-1.4) */
  --ember-glow:  rgba(200,56,24,0.15);
  --gold-glow:   rgba(224,176,40,0.12);
  --moon-glow:   rgba(56,120,168,0.10);
  --masthead-bg: rgba(48,16,16,0.92);
}
```

**Tailwind v4 `@theme` block:** Color utility classes (`text-ember`, `bg-claret`,
`border-gold`, etc.) and font family classes (`font-cormorant`, `font-playfair`,
`font-garamond`, `font-cinzel`) are declared in `@theme` in `globals.css` and
resolve to the CSS variables above. They are theme-aware automatically.

**Opacity modifier limitation:** Tailwind v4 opacity modifiers (`text-ember/50`)
do NOT work with CSS variable-backed colors. Use inline styles for alpha variants.

### Signature Visual Elements

- **Blood moon logo mark:** Crescent formed by two overlapping circles, pentacle inscribed in the visible sliver, cardinal tick marks in gold at compass points
- **Body ambient glow:** Three radial gradients — ember bleeding from top-left, gold from mid-right, moonstone rising from bottom-center
- **Faction diamond pips:** 6×6px squares rotated 45°, glowing box-shadow in faction color at 50% opacity
- **Filigree dividers:** `ember → gold` gradient lines with diamond pips and ✦ star glyphs at center
- **Corner accent treatment:** L-shaped brackets (2px in faction/accent color) on event banners and featured panels
- **Pentacle watermark:** SVG pentacle at 4–8% opacity behind hero sections
- **Avatar rings:** Two concentric dashed rings rotating in opposite directions (ember inner, gold outer) around character/user avatars

---

## 5. Site Structure & Navigation

### Masthead (sticky, two elements)
1. **Top bar:** Logo mark + site title + nav links + user chip + action buttons
2. **Show ribbon:** Canon source strip below masthead — Charmed (gold), Buffy (moonstone), Angel (ember), supporting shows (muted), tagline right-aligned

### Primary Navigation Links
- Home (dashboard)
- Forums
- The Circle (RP hub)
- Grimoire (lore wiki)
- Rewatch
- Members

### Sidebar Personal Links
- Whispers (private messages — with unread badge)
- My Characters
- The Apothecary (XP store)
- Bookmarks
- Edit Profile
- Settings

### Admin/Mod Links (conditional on role)
- Admin Panel (Admin only)
- Mod Panel (Moderator + Faction Leader)

---

## 6. Factions

Three factions. Characters choose a faction on creation. Factions are not strictly good/evil — moral complexity is intentional. Users can have characters in different factions.

### The Covenant
- **Alignment:** Light-leaning, protective, structured
- **Color:** Harvest Gold (`#e0b028`)
- **Lore:** Practitioners of ancient protective magic and Wiccan tradition. Not purely good — bound by agreements, sometimes constrained by their own rules. Draw from: the Halliwells, Willow (reformed), white lighters.
- **Faction page accent:** Gold borders, warm candlelight atmosphere

### The Cabal
- **Alignment:** Dark-leaning, power-seeking, pragmatic
- **Color:** Ember (`#c83818`)
- **Lore:** Those who seek power by other means. Not purely evil — includes anti-heroes, grey practitioners, those who rejected the Covenant's constraints. Draw from: Cole Turner (S3–4), dark witches, demon-aligned.
- **Faction page accent:** Ember borders, deep claret atmosphere

### The Unbound
- **Alignment:** Neutral, chaotic, independent
- **Color:** Moonstone (`#3878a8`)
- **Lore:** Rogues, mercenaries, and those who rejected both sides. Wildcards who operate on their own terms. Often the most morally interesting characters.
- **Faction page accent:** Moonstone borders, cool midnight atmosphere

---

## 7. Character System

Characters are sub-profiles of user accounts. The maximum number of characters per user is admin-configurable via `site_settings` key `max_characters_per_user` (default value: `'5'`). Nothing in the application hardcodes a character limit — always read from site_settings.

### Character Fields
- `name` — character display name (shown in IC posts instead of username)
- `avatar_url` — character portrait (separate from user avatar)
- `bio` — Tiptap HTML, max ~1000 characters rendered
- `faction_id` — FK to factions (nullable — unaffiliated characters allowed)
- `canon_source` — which show this character is from, or 'original'
- `xp` — integer, accumulates from RP posts and admin awards
- `level` — integer 1–N, derived from xp vs character_level_thresholds
- `status` — `'pending'` (awaiting approval) | `'active'` | `'suspended'`
- `is_npc` — boolean, admin-only set. NPC characters controlled by staff.

### Approval Flow
1. User submits character (multi-step form: name → faction → bio → review)
2. Character status = 'pending'; notification fires to admin queue
3. Admin approves → status = 'active', notification to user
4. Admin rejects → reason required, notification to user with reason
5. Approved characters appear in the user's character selector for IC posting

### XP & Levelling
- XP accumulates per character (not per user)
- Sources: RP post submission (auto, admin-configurable amount), admin manual award, event multiplier bonus
- Level thresholds: stored in `character_level_thresholds` table (admin-adjustable)
- Level labels: Novice → Apprentice → Adept → Practitioner → Elder (admin-configurable)
- Level-up fires notification to user
- Each level unlocks powers (admin-configures what unlocks at each level)
- XP logged in `character_xp_log` (character_id, amount, reason, created_at)

### IC Posting Mode
- Designated RP boards have `is_rp_board = true`
- In RP boards, the post composer shows an IC/OOC toggle
- IC mode: user selects which of their active characters is posting
- Post renders with: character avatar, character name (large), faction diamond pip, canon source badge, "played by [username]" link in muted text
- OOC mode: normal post with user identity
- Toggle state persists in sessionStorage per board

---

## 8. Multi-Theme Engine

Five themes available. Blood Moon is the default. Theme preference stored on the user's `users` row (`theme_preference` text, default `'blood-moon'`).

Theme is applied via `data-theme` attribute on `<body>`. Each theme is a `:root` CSS variable override block in `globals.css`.

| Theme key | Name | Base feeling |
|---|---|---|
| `blood-moon` | Blood Moon | Char black, ember, harvest gold, moonstone — default |
| `silver-onyx` | Silver & Onyx | Pure onyx, graphite, moonlight, iris violet, garnet, tourmaline |
| `victorian-apothecary` | Victorian Apothecary | Bottle green, sage paper, amber, rust, wisteria |
| `crimson-athenaeum` | Crimson Athenaeum | Void black, bordeaux, blush vellum, true crimson, antique gold, smoke blue |
| `midnight-garden` | Midnight Garden | Teal-black, cold frost, copper, damask rose, amethyst |

**Admin theme lock:** A `forced_theme` column on the `boards` table allows admin to override user preference for specific boards/sections. Communicated to user: "This area has its own atmosphere." User theme restores on exit.

---

## 9. Roles & Permissions

### Role Hierarchy (highest to lowest)
```
Admin
Moderator
Lore Keeper    (manages Grimoire wiki)
Faction Leader  (scoped to faction_id)
Founding Member (display/prestige role — no mod permissions by default)
[Regular User]
```

### Additive Permission Model
All permissions are additive across roles — no role can negate another. System checks: does this user have ANY role granting permission X?

### Key Permissions
- `manage_site` — Admin only, full site control
- `moderate_boards` — delete/pin/lock posts across all boards
- `moderate_own_board` — Moderator scoped to specific board
- `manage_lore` — create/edit/publish Grimoire entries
- `approve_characters` — review and approve character submissions
- `award_xp` — manually award XP to characters
- `post_announcement` — post faction/site-wide system announcements
- `manage_faction` — Faction Leader, scoped to their faction

**Critical:** Permission column is `is_enabled` (boolean). NEVER `is_granted`. This is a hard rule inherited from WM's build experience.

---

## 10. Boards (Forum) System

### Board Scopes
- `public` — all logged-in users
- `faction` — characters in that faction only (scope_id = faction_id)
- `rp` — RP boards (IC posting enabled, XP awarded on post)
- `staff` — admin/mod only
- `admin` — admin only

### Canon Source Tagging
Every thread has an optional `canon_source` field. Displayed as a colored badge matching the show ribbon. Used for filtering.

### Spoiler System
- Threads can be marked `is_spoiler = true` (creator or mod)
- Tiptap custom extension: `[spoiler]content[/spoiler]` renders as click-to-reveal
- Users with shows set to incomplete in their `watching_status` field see a spoiler warning

### RP-Specific Boards
- `is_rp_board = true` on the boards table enables IC mode
- XP auto-award fires on post submission in RP boards
- OOC sidebar available on all RP threads
- Admin can force a theme override per board via `forced_theme`

---

## 11. Whispers (Private Messaging)

Direct port of Wizard Mansion's Wizard Mail system. UI labels changed:
- "Wizard Mail" → "Whispers"
- "Mansion Notice" → "Council Notice"

Supports: player-to-player messages, system messages (admin-broadcast), gift attachments (not used at launch — infrastructure present), Realtime delivery.

System messages trigger the "Council Notice" sidebar indicator (glowing/pulsing).

---

## 12. The Apothecary (XP Store)

Users spend character XP on:
- **Powers** — adds to character's power list; some require minimum level
- **Cosmetics** — avatar frames, title badges, profile accents
- **Artifacts** — RP-usable items (flavour, no mechanical effect at launch)

XP deduction is atomic: `UPDATE characters SET xp = xp - cost WHERE id = $1 AND xp >= cost RETURNING id`. If no row returned, insufficient XP — reject.

---

## 13. The Grimoire (Lore Wiki)

Community-editable lore compendium. Categories: Powers, Demons, Locations, Spells, Creatures, Lore. Every entry tagged with `canon_source`. Revision history stored. Lore Keeper and Admin can publish/unpublish.

Full-text search indexed on title + body.

---

## 14. Rewatch Club

Scheduled episodes with RSVP. On event time: status transitions to 'live', a dedicated chat channel opens. After event: status = 'archived', discussion thread linked. Each event tied to a specific canon, season, and episode.

---

## 15. The Séance (Live Chat)

Direct port of Wizard Mansion's Whispering Chamber — all CHAT-1 through CHAT-3c features included:
- Message grouping (by author + time proximity)
- Typing indicator
- @-autocomplete (online-first, substring match, 8 results)
- Mention click (links to user profile)
- Block filter (bidirectional)
- Idle drop (5 min inactivity, scoped to chat container)
- Soft-delete (mod-only, renders placeholder)
- STRUCTURED MENTIONS DATA FLOW (enriched on insert + realtime, no runtime name-to-id lookup)

TWH additions:
- IC mode toggle (post as active character)
- Multiple channels: General, Covenant (faction-gated), Cabal (faction-gated), Unbound (faction-gated), Watch Party (temporary, per-event)

**Critical Realtime requirements (WM hard lessons):**
1. `REPLICA IDENTITY FULL` required on `chat_messages` for UPDATE events
2. Table must be in `supabase_realtime` publication
3. Both are required — neither alone is sufficient

---

## 16. Achievement Badges

Trigger types:
- `post_count` — fires on RP post count milestones (25, 100, 500, etc.)
- `event_participation` — fires on first event RSVP or participation
- `character_level` — fires on character level milestones
- `admin_grant` — manual staff award
- `founding_member` — granted to all characters created before `launch_date` site setting

Displayed as badge grid on character profiles.

---

## 17. Performance Architecture

**Caching system — `lib/cached-settings.ts`**
All globally-static server data is cached using Next.js `unstable_cache` with tag-based invalidation. Every cached function returns a plain array or object directly (NOT `{ data: [...] }`).

Cached functions and tags (to be extended as features are built):

| Function | Tag | TTL |
|---|---|---|
| `getCachedSiteSettings()` | `site-settings` | 5 min |
| `getCachedFactions()` | `factions` | 1 hr |
| `getCachedCharacterLevelThresholds()` | `level-thresholds` | 1 hr |
| `getActiveEvent()` | `active-event` | 5 min |

**Critical integration rules:**
1. Before writing any new query against a cached table, check `lib/cached-settings.ts` first. If a cached version exists, use it.
2. Every admin mutation that modifies cached data MUST call `revalidateTag(tag)` alongside any `revalidatePath` calls.
3. Cached functions return plain arrays/objects. Switching from direct Supabase query to cached function requires removing `.data` access.
4. New globally-static admin data should be cached with tag-based invalidation.

**Layout.tsx query structure:**
- 3-tier parallel `Promise.all` — never add sequential awaits outside these blocks
- `browserSupabase` singleton — `lib/supabase/browserClient.ts` — all client Realtime subscriptions use this, never `createClient()` in a component

---

## 18. Database Schema

### Table Naming Convention
**Critical — read before touching any table:**
- `users` — account-level profile. One row per registered user. Maps to `auth.users.id`.
- `characters` — RP character sub-profiles. Multiple per user (limit set in site_settings). FK to `users.id`.

These names are final and intentional. `users` is the person. `characters` are the personas they play. Never reverse this or use `characters` to mean the account profile.

### Core Tables

```sql
-- SITE CONFIGURATION
site_settings    — key (text PK), value (text), updated_at

-- USER ACCOUNTS (Supabase Auth handles auth.users)
users            — id (uuid PK = auth.users.id), display_name (text unique),
                   avatar_url (text nullable), bio (text nullable),
                   theme_preference (text default 'blood-moon'),
                   show_preference (text nullable),
                   watching_status (jsonb default '{}'),
                   active_character_id (uuid nullable FK characters.id),
                   created_at (timestamptz default now())

-- SESSIONS / SECURITY
session_logs     — id (uuid), user_id (uuid FK auth.users), ip_address (text),
                   user_agent (text nullable), created_at
                   (rate-limited: one log per user+IP per hour)
ip_bans          — id (uuid), ip_address (text unique), reason (text nullable),
                   banned_by (uuid), created_at, expires_at (nullable)

-- ROLES & PERMISSIONS
roles            — id (uuid), name (text unique), display_name (text),
                   is_invisible (boolean default false),
                   is_permanent (boolean default false), created_at
role_permissions — id (uuid), role_id (uuid FK roles), permission_id (uuid FK permissions),
                   is_enabled (boolean default false),
                   UNIQUE (role_id, permission_id)
permissions      — id (uuid), name (text unique), description (text), created_at
user_roles       — id (uuid), user_id (uuid FK auth.users), role_id (uuid FK roles),
                   scope_id (uuid nullable — faction_id or board_id),
                   granted_by (uuid), granted_at (timestamptz)

-- FACTIONS
factions         — id (uuid), name (text unique), slug (text unique),
                   color_hex (text), description (text), lore (text HTML),
                   leader_user_id (uuid nullable FK auth.users), created_at

-- RP CHARACTERS
characters       — id (uuid), user_id (uuid FK users.id ON DELETE CASCADE),
                   name (text), avatar_url (text nullable),
                   bio (text nullable HTML),
                   faction_id (uuid nullable FK factions),
                   canon_source (text default 'original'),
                   xp (integer default 0), level (integer default 1),
                   status (text CHECK pending/active/suspended default 'pending'),
                   is_npc (boolean default false),
                   created_at (timestamptz)
                   -- Index: (user_id), (faction_id), (status)

character_level_thresholds — level (integer PK), xp_required (integer),
                   label (text), unlocks_description (text nullable), created_at

character_powers — id (uuid), character_id (uuid FK characters ON DELETE CASCADE),
                   power_name (text), power_description (text nullable),
                   source (text CHECK 'apothecary'/'level_unlock'/'admin_grant'),
                   acquired_at (timestamptz)
                   -- Index: (character_id)

character_xp_log — id (uuid), character_id (uuid FK characters ON DELETE CASCADE),
                   amount (integer), reason (text), awarded_by (uuid nullable),
                   created_at (timestamptz)
                   -- Index: (character_id)

character_relationships — id (uuid),
                   character_id (uuid FK characters ON DELETE CASCADE),
                   related_character_id (uuid FK characters ON DELETE CASCADE),
                   relationship_type (text CHECK ally/rival/family/mentor/apprentice/other),
                   relationship_label (text nullable),
                   is_mutual (boolean default false),
                   created_by (uuid FK auth.users), created_at
                   UNIQUE (character_id, related_character_id)

-- NOTIFICATIONS
notifications    — id (uuid), user_id (uuid FK auth.users),
                   type (text), title (text), body (text),
                   link (text nullable), is_read (boolean default false),
                   created_at (timestamptz)
                   -- In Realtime publication (INSERT subscription)

-- MESSAGE BOARDS
boards           — id (uuid), name (text), description (text nullable),
                   category (text), scope (text CHECK public/faction/rp/staff/admin),
                   scope_id (uuid nullable — faction_id),
                   is_rp_board (boolean default false),
                   forced_theme (text nullable),
                   discord_announce (boolean default false),
                   created_at

board_threads    — id (uuid), board_id (uuid FK boards), author_id (uuid FK auth.users),
                   title (text), canon_source (text nullable),
                   is_spoiler (boolean default false),
                   is_pinned (boolean default false), is_locked (boolean default false),
                   created_at, updated_at

board_posts      — id (uuid), thread_id (uuid FK board_threads),
                   author_id (uuid FK auth.users),
                   character_id (uuid nullable FK characters ON DELETE SET NULL),
                   is_ic (boolean default false),
                   content (text HTML), is_flagged (boolean default false),
                   flag_reason (text nullable), flagged_by (uuid nullable),
                   created_at, updated_at

ooc_posts        — id (uuid), thread_id (uuid FK board_threads),
                   user_id (uuid FK auth.users),
                   content (text), created_at

post_enchantments — id (uuid), post_id (uuid FK board_posts ON DELETE CASCADE),
                   user_id (uuid FK auth.users), created_at
                   UNIQUE (post_id, user_id)

post_reports     — id (uuid), post_id (uuid FK board_posts),
                   reported_by (uuid FK auth.users),
                   reason (text), details (text nullable),
                   status (text CHECK new/reviewed/actioned default 'new'),
                   created_at

-- WHISPERS (Private Messaging)
mail_messages    — id (uuid), sender_id (uuid nullable FK auth.users),
                   recipient_id (uuid FK auth.users),
                   subject (text), body (text),
                   read_at (timestamptz nullable),
                   deleted_by_sender (boolean default false),
                   deleted_by_recipient (boolean default false),
                   is_system_message (boolean default false),
                   is_welcome (boolean default false),
                   system_message_audience (text CHECK all/faction/individual nullable),
                   audience_id (uuid nullable), created_at
                   -- REPLICA IDENTITY FULL (required for UPDATE realtime)
                   -- In Realtime publication

-- SOCIAL
friendships      — id (uuid), user_id (uuid FK auth.users),
                   friend_id (uuid FK auth.users),
                   status (text CHECK pending/accepted/declined),
                   created_at
                   UNIQUE (user_id, friend_id)

thread_bookmarks — id (uuid), user_id (uuid FK auth.users),
                   thread_id (uuid FK board_threads ON DELETE CASCADE),
                   created_at
                   UNIQUE (user_id, thread_id)

-- LIVE CHAT
chat_messages    — id (uuid), user_id (uuid FK auth.users),
                   character_id (uuid nullable FK characters ON DELETE SET NULL),
                   is_ic (boolean default false),
                   channel_id (text default 'general'),
                   content (text), mentioned_user_ids (jsonb default '[]'),
                   deleted_at (timestamptz nullable), created_at
                   -- REPLICA IDENTITY FULL (required for UPDATE realtime)
                   -- In Realtime publication
                   -- GIN index on mentioned_user_ids

-- THE APOTHECARY (XP Store)
apothecary_listings — id (uuid), name (text), description (text),
                   xp_cost (integer), listing_type (text CHECK power/cosmetic/artifact),
                   min_level_required (integer default 1),
                   is_active (boolean default true), created_at

apothecary_purchases — id (uuid), character_id (uuid FK characters ON DELETE CASCADE),
                   listing_id (uuid FK apothecary_listings),
                   purchased_at (timestamptz)
                   UNIQUE (character_id, listing_id)

power_catalog    — id (uuid), name (text), description (text),
                   show_origin (text), effect_description (text nullable),
                   created_at

-- THE GRIMOIRE (Lore Wiki)
grimoire_categories — id (uuid), name (text), display_order (integer), created_at

grimoire_entries — id (uuid), title (text), slug (text unique),
                   category_id (uuid FK grimoire_categories),
                   canon_source (text), body (text HTML),
                   created_by (uuid FK auth.users),
                   status (text CHECK draft/published default 'draft'),
                   is_featured (boolean default false),
                   created_at, updated_at

grimoire_revisions — id (uuid), entry_id (uuid FK grimoire_entries ON DELETE CASCADE),
                   editor_id (uuid FK auth.users),
                   body_before (text), body_after (text), created_at

-- REWATCH CLUB
rewatch_events   — id (uuid), canon_source (text), season (integer nullable),
                   episode_number (integer nullable), episode_title (text),
                   scheduled_at (timestamptz),
                   chat_channel_id (text nullable),
                   discussion_thread_id (uuid nullable FK board_threads),
                   status (text CHECK scheduled/live/archived default 'scheduled'),
                   created_by (uuid FK auth.users), created_at

rewatch_rsvps    — id (uuid), event_id (uuid FK rewatch_events ON DELETE CASCADE),
                   user_id (uuid FK auth.users), created_at
                   UNIQUE (event_id, user_id)

-- SITE EVENTS (The Convergence)
site_events      — id (uuid), name (text), description (text),
                   banner_text (text nullable),
                   starts_at (timestamptz), ends_at (timestamptz),
                   xp_multiplier (numeric default 1.0),
                   is_active (boolean default false), created_at

-- ACHIEVEMENTS
achievement_definitions — id (uuid), name (text), description (text),
                   badge_image_url (text nullable),
                   trigger_type (text CHECK post_count/event_participation/
                     character_level/admin_grant/founding_member),
                   trigger_value (integer nullable), created_at

character_achievements — id (uuid),
                   character_id (uuid FK characters ON DELETE CASCADE),
                   achievement_id (uuid FK achievement_definitions),
                   earned_at (timestamptz)
                   UNIQUE (character_id, achievement_id)
```

---

## 19. Key Conventions & Patterns

### P-DC Admin Upload Pattern
Admin image uploads use direct browser upload — NOT Server Action routing.
Files above ~1MB MUST use this pattern due to Vercel Hobby 4.5MB body limit.
- Client calls `lib/uploadAdminImage.ts` helper directly
- Helper uploads to Supabase Storage via browser client
- Signed URL or public URL returned to client, stored in DB via Server Action
Never route large files through Server Actions.

### Admin Record Deletion
Before deleting any record that may be referenced by FK constraints:
1. Check usage count via API route
2. Show warning modal with usage count to admin
3. Handle cascades explicitly (SET NULL where needed, CASCADE where appropriate)
4. Never silently break related data

### Fire-and-Forget Notifications
Notifications to users are always fire-and-forget — never `await` them inside the main action path. Pattern:
```ts
// correct
void createNotification(userId, { type, title, body, link })
// wrong
await createNotification(userId, { type, title, body, link })
```

### Atomic XP Operations
Always use conditional UPDATE, never read-then-write:
```sql
UPDATE characters SET xp = xp - $cost WHERE id = $id AND xp >= $cost RETURNING id
-- If no row returned: insufficient XP
```

### useTransition Anti-Pattern
Do NOT use `useTransition` / `startTransition` for async handlers. Use `useState(false)` + direct `await`:
```ts
// correct
const [loading, setLoading] = useState(false)
const handleSubmit = async () => { setLoading(true); await action(); setLoading(false) }
// wrong
const [isPending, startTransition] = useTransition()
startTransition(async () => { await action() })
```

### Promise.all Layout Pattern (confirmed TWH-1.3)
To achieve parallel queries in layout.tsx without a sequential waterfall:
1. Call `getSession()` first (local cookie read, no network call) to extract the user ID
2. Use that ID to start the users table query simultaneously with `getUser()` and `getCachedSiteSettings()` in a single `Promise.all`
3. Never add sequential `await` calls outside the `Promise.all` block

```ts
// correct
const session = await getServerClient().auth.getSession() // local, no network
const userId = session.data.session?.user.id
const [settings, { data: { user } }, userRow] = await Promise.all([
  getCachedSiteSettings(),
  getServerClient().auth.getUser(),
  getUserRow(userId)
])
```

### getAdminClient() Usage Rules (confirmed TWH-1.3)
Use `getAdminClient()` (service role, bypasses RLS) in these specific cases:
1. `getCachedSiteSettings()` — must work for unauthenticated pages (landing, login)
2. Fire-and-forget operations (e.g. `logSession()`) — run asynchronously after the component returns, where the server client's cookie context may no longer be valid
3. Admin Server Actions that need to write data blocked by user RLS policies

Do NOT use `getAdminClient()` for reads that should be RLS-filtered.

### Authenticated Route Group Pattern (confirmed TWH-1.3)
All authenticated pages live under `app/(authenticated)/`. The route group layout
`app/(authenticated)/layout.tsx` handles the Masthead, Sidebar, and PageLayout
shell once — pages inside the group do not import or render PageLayout themselves.

Public pages (landing, login, register, confirm) live outside the route group.
Auth pages live under `app/(auth)/`.

### Middleware Convention (confirmed fix TWH-1.3)
The Next.js middleware file is `middleware.ts` at the project root.
The exported function MUST be named `middleware`.
This project uses `middleware.ts` with `export async function middleware(...)`.
Do NOT rename to `proxy.ts` or export as `proxy` — this breaks routing entirely.

---

## 20. Build History

### Phase 0 — Project Setup (June 2026)

**TWH-0.1 — Complete**
- Repo scaffolded at `/Users/soundadvice/witchinghour/`
- Next.js 16.2.9 installed (not 14 — `create-next-app@latest` resolved to 16; all patterns identical)
- Tailwind v4 + Turbopack active
- Dependencies installed: `@supabase/supabase-js @supabase/ssr sharp @tiptap/react @tiptap/starter-kit @tiptap/extension-image dompurify @types/dompurify resend`
- `lib/supabase/browserClient.ts` — module-level singleton via `createBrowserClient`, exported as `getBrowserClient()`
- `lib/supabase/serverClient.ts` — async `getServerClient()` using `createServerClient` with `cookies()` from `next/headers`
- `lib/supabase/adminClient.ts` — `getAdminClient()` using service role key, no session persistence
- `lib/cached-settings.ts` — empty shell with `unstable_cache` import
- `app/globals.css` — Blood Moon `:root` variables (22 tokens, faction fills/borders), body defaults
- `app/layout.tsx` — Google Fonts loaded via `<link>` tags with preconnect headers
- Dev server confirmed: 200 OK, no errors

**TWH-0.2 — Complete**
- `TWH_BRIEF_v1.md` — master project document written
- `TWH_PROCESS_v1.md` — build governance document written

**TWH-0.3 — Complete**
- GitHub repository: `aquariusrps/witchinghour`
- Supabase project: `the-witching-hour` (project ID: vkhuttcusqubteseifui)
- Storage buckets created: `portraits`, `characters`, `rich-text-images`
- `.env.local` created with all 5 required env vars
- Vercel project connected to GitHub, auto-deploy on push to main confirmed
- Supabase Auth configured: email confirmation ON, SMTP via Resend, redirect URLs set
- **Lesson recorded:** `.env.local` must be created and verified before any subsequent
  build begins. Missing env vars cause silent runtime 404s, not build errors.

### Phase 1 — Authentication & User Accounts (June 2026)

**TWH-1.1 — Complete** (commit: e5eb864 area)
Migration 001 applied. Tables created:
- `site_settings` — key/value, RLS: SELECT authenticated, write service role only
  Seed rows: `launch_date=''`, `max_characters_per_user='5'`, `xp_per_rp_post='10'`
- `users` — account profiles, RLS: SELECT all authenticated, UPDATE own row only
  `active_character_id` nullable, no FK yet (deferred to Migration 005)
- `session_logs` — INSERT own rows only, no SELECT policy (service role reads)
- `ip_bans` — all ops via service role only

**TWH-1.2 — Complete**
- Registration flow: `app/(auth)/register/page.tsx` + `RegisterForm.tsx`
- Server action: `app/actions/auth.ts` → `registerUser()`
  Validates fields, checks display_name uniqueness via admin client,
  calls `supabase.auth.signUp()` with `emailRedirectTo` → `/auth/callback`,
  inserts `users` row via admin client, redirects to `/confirm`
- `app/(auth)/confirm/page.tsx` — "Check your email" page
- `app/auth/callback/route.ts` — exchanges code for session, inserts welcome
  Council Notice into `mail_messages` (try/catch — deferred until mail migration),
  redirects to `/dashboard`
- `app/(auth)/login/page.tsx` + `LoginForm.tsx` — email/password login
- `app/(auth)/layout.tsx` — auth page shell
- ESLint added: `eslint.config.mjs`, `eslint-config-next` installed

**TWH-1.2a — Complete**
- `app/page.tsx` — landing page
  Hero: "The Witching Hour" (Cormorant Upright, weight 600, gold) + "is upon us."
  (weight 300, roseash) on one continuous line via `clamp()`
  Tagline: "For those who never stopped believing in magic." (EB Garamond italic)
  CTAs: "Enter the Circle" → /register, "I already belong" → /login
  Blood moon logo mark SVG (120px), pentacle watermark (4% opacity)
  Show ribbon (7 canons, colour-coded dots)
  CSS animations: fade-in + scale on logo, stagger fade on content
  `prefers-reduced-motion` respected
  SEO: title, meta description, Open Graph tags
  Authenticated users redirected to /dashboard
- `app/components/BloodMoonMark.tsx` — reusable SVG logo mark component

**TWH-1.3 — Complete** (commits: e5eb864, d20096d)
- `middleware.ts` — Next.js middleware (MUST be named middleware.ts, export as
  `middleware` — see §19 Middleware Convention). Protects 11 route prefixes,
  refreshes session cookies via `@supabase/ssr` updateSession pattern.
  **Critical lesson:** Claude Code incorrectly named this `proxy.ts` with
  `export function proxy()` — this broke all routing. Fixed to `middleware.ts`
  with `export async function middleware()`.
- `lib/cached-settings.ts` — `getCachedSiteSettings()` implemented with
  `unstable_cache`, tag `site-settings`, TTL 300s, uses `getAdminClient()`
  (must work for unauthenticated pages). `getSetting(key)` helper added.
- `app/layout.tsx` — parallel `Promise.all` pattern, `data-theme` on body,
  fire-and-forget `logSession()`
- `app/(authenticated)/layout.tsx` — route group layout for all authenticated pages
- `app/(authenticated)/dashboard/page.tsx` — dashboard shell
- `app/components/Masthead.tsx` — sticky nav with show ribbon
- `app/components/Sidebar.tsx` — left nav (Client Component for `usePathname()`)
- `app/components/PageLayout.tsx` — grid layout wrapper (220px sidebar + 1fr)

**TWH-1.4 — Complete**
- `app/globals.css` — complete rewrite:
  `@theme` block for Tailwind v4 (16 color utility classes + 4 font classes)
  4 new alpha tokens: `--ember-glow`, `--gold-glow`, `--moon-glow`, `--masthead-bg`
  Body three-layer radial gradient (ember top-left, gold mid-right, moon bottom)
  4 `[data-theme]` override blocks: silver-onyx, victorian-apothecary,
  crimson-athenaeum, midnight-garden
- Component audit: all hardcoded rgba values replaced with CSS variable tokens

### Known Issues / Active Q-items
- Alternate theme palette hex values are first-pass scaffolds — verify against
  visual mocks before shipping theme switcher publicly
- Body gradient + landing page HERO_GRADIENT may double-layer — verify visually
- React cache() / DAL deduplication deferred — getUser() runs twice per
  authenticated page render (acceptable at current scale, revisit at Phase 5+)

*This document is updated at the completion of each build phase.*
*Cross-reference: TWH_PROCESS_v1.md (build governance), TWH_ROADMAP (in planning chat)*
