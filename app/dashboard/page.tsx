import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import PageLayout from '@/app/components/PageLayout'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, avatar_url, theme_preference, show_preference, active_character_id')
    .eq('id', user.id)
    .single()

  return (
    <PageLayout displayName={profile?.display_name} avatarUrl={profile?.avatar_url}>
      <div
        style={{
          padding: '2rem',
          maxWidth: 720,
        }}
      >
        {/* Welcome heading */}
        <h1
          style={{
            fontFamily: 'Cormorant Upright, serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
            fontWeight: 300,
            color: 'var(--roseash)',
            marginBottom: '2rem',
            lineHeight: 1.2,
          }}
        >
          Welcome back,{' '}
          <span style={{ fontWeight: 500, color: 'var(--gold)' }}>
            {profile?.display_name ?? 'Witch'}
          </span>
          .
        </h1>

        {/* Debug panel — confirms users table query is working */}
        <div
          style={{
            backgroundColor: 'var(--claret)',
            border: '1px solid var(--ember-dim)',
            borderRadius: '4px',
            padding: '1.25rem 1.5rem',
          }}
        >
          <p
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--faded)',
              marginBottom: '1rem',
            }}
          >
            User Profile
          </p>

          <dl
            style={{
              fontFamily: 'EB Garamond, Georgia, serif',
              fontSize: '1rem',
              color: 'var(--mist)',
              display: 'grid',
              gridTemplateColumns: 'max-content 1fr',
              gap: '0.4rem 1.5rem',
            }}
          >
            <dt style={{ color: 'var(--faded)', fontStyle: 'italic' }}>Theme</dt>
            <dd style={{ margin: 0 }}>{profile?.theme_preference ?? '—'}</dd>

            <dt style={{ color: 'var(--faded)', fontStyle: 'italic' }}>Show</dt>
            <dd style={{ margin: 0 }}>{profile?.show_preference ?? '—'}</dd>
          </dl>
        </div>
      </div>
    </PageLayout>
  )
}
