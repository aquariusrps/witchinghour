import Link from 'next/link'
import BloodMoonMark from '@/app/components/BloodMoonMark'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/forums', label: 'Forums' },
  { href: '/the-circle', label: 'The Circle' },
  { href: '/grimoire', label: 'Grimoire' },
  { href: '/rewatch', label: 'Rewatch' },
  { href: '/members', label: 'Members' },
]

const CANONS = [
  { label: 'Charmed',                color: 'var(--gold)',      primary: true  },
  { label: 'Buffy the Vampire Slayer', color: 'var(--moonstone)', primary: true  },
  { label: 'Angel',                  color: 'var(--ember)',     primary: true  },
  { label: 'The Secret Circle',      color: 'var(--mist)',      primary: false },
  { label: 'The Craft',              color: 'var(--mist)',      primary: false },
  { label: 'Witches of East End',    color: 'var(--mist)',      primary: false },
  { label: 'Practical Magic',        color: 'var(--mist)',      primary: false },
]

type Props = {
  displayName?: string | null
  avatarUrl?: string | null
}

function IconEnvelope() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

export default function Masthead({ displayName, avatarUrl }: Props) {
  const initial = displayName?.[0]?.toUpperCase() ?? '?'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--ember-dim)',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          backgroundColor: 'var(--masthead-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 56,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            gap: '0.5rem',
          }}
        >
          {/* Logo */}
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <BloodMoonMark size={34} />
            <span
              style={{
                fontFamily: 'Cormorant Upright, serif',
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'var(--roseash)',
                whiteSpace: 'nowrap',
              }}
            >
              The Witching Hour
            </span>
          </Link>

          {/* Nav links — hidden below sm (640px) */}
          <div
            className="hidden sm:flex"
            style={{
              alignItems: 'center',
              gap: '0.125rem',
              marginLeft: '1.5rem',
            }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '0.375rem 0.625rem',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--mist)',
                  textDecoration: 'none',
                  borderRadius: '2px',
                  transition: 'color 0.15s ease',
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Action buttons + user chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {/* Messages */}
            <button
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mist)',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Whispers"
            >
              <IconEnvelope />
              {/* Pip slot — empty, wired in a future task */}
            </button>

            {/* Notifications */}
            <button
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mist)',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Notifications"
            >
              <IconBell />
            </button>

            {/* User chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.625rem 0.25rem 0.375rem',
                borderRadius: '4px',
                backgroundColor: 'var(--raised)',
                border: '1px solid var(--ember-dim)',
                flexShrink: 0,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'var(--elevated)',
                  border: '1px solid var(--ember-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.65rem',
                      color: 'var(--faded)',
                    }}
                  >
                    {initial}
                  </span>
                )}
              </div>

              {/* Display name */}
              <span
                style={{
                  fontFamily: 'EB Garamond, Georgia, serif',
                  fontSize: '0.9rem',
                  color: 'var(--mist)',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName ?? 'Coven Member'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Show ribbon */}
      <div
        style={{
          backgroundColor: 'var(--claret)',
          borderBottom: '1px solid var(--ember-dim)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.25rem 1.5rem',
            padding: '0.3rem 1rem',
          }}
        >
          {CANONS.map(({ label, color, primary }) => (
            <Link
              key={label}
              href="#"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: primary ? 'var(--roseash)' : 'var(--faded)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
