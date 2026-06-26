import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { getCachedSiteSettings } from '@/lib/cached-settings'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'

export const metadata: Metadata = {
  metadataBase: new URL('https://atwitchinghour.com'),
  title: {
    default: 'The Witching Hour',
    template: '%s — The Witching Hour',
  },
  description: 'A fan community and roleplay hub for supernatural television.',
}

type UserProfile = {
  display_name: string
  avatar_url: string | null
  theme_preference: string
  active_character_id: string | null
}

async function logSession(userId: string, ipAddress: string): Promise<void> {
  const admin = getAdminClient()
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: existing } = await admin
    .from('session_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('ip_address', ipAddress)
    .gte('created_at', since)
    .limit(1)
    .maybeSingle()
  if (!existing) {
    await admin.from('session_logs').insert({ user_id: userId, ip_address: ipAddress })
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let theme = 'blood-moon'

  try {
    const supabase = await getServerClient()
    const headerStore = await headers()
    const ip =
      headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'

    // Read session from cookie (local read — no network call) to get the user ID
    // so all three queries below can start simultaneously in Promise.all.
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const cookieUserId = session?.user?.id ?? null

    // Three parallel queries per TWH_BRIEF_v1.md §17
    const [, authResult, profileResult] = await Promise.all([
      getCachedSiteSettings(),
      supabase.auth.getUser(),
      cookieUserId
        ? supabase
            .from('users')
            .select('display_name, avatar_url, theme_preference, active_character_id')
            .eq('id', cookieUserId)
            .single()
        : Promise.resolve({ data: null }),
    ])

    const user = authResult.data.user
    const profile = (profileResult as { data: UserProfile | null }).data

    if (user && profile) {
      theme = profile.theme_preference ?? 'blood-moon'
      // Fire-and-forget — never awaited (TWH_BRIEF_v1.md §19)
      void logSession(user.id, ip)
    }
  } catch {
    // Supabase not configured yet (TWH-0.3 pending) — render with defaults
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Upright:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cinzel:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" data-theme={theme}>
        {children}
      </body>
    </html>
  )
}
