import Link from 'next/link'

const CANONS = [
  { label: 'Charmed',            color: 'var(--gold)',      muted: false },
  { label: 'Buffy',              color: 'var(--moonstone)', muted: false },
  { label: 'Angel',              color: 'var(--ember)',     muted: false },
  { label: 'The Secret Circle',  color: 'var(--mist)',      muted: true  },
  { label: 'The Craft',          color: 'var(--mist)',      muted: true  },
  { label: 'Witches of East End',color: 'var(--mist)',      muted: true  },
  { label: 'Practical Magic',    color: 'var(--mist)',      muted: true  },
]

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes logoScale {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .logo-in  { animation: logoScale 1.2s ease-out both; }
        .fade-in  { animation: fadeUp   1s   ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .logo-in, .fade-in {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '56px',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          textAlign: 'center',
        }}
      >
        {/* Blood moon logo mark */}
        <div className="logo-in" style={{ marginBottom: '2rem' }}>
          <svg
            width={120}
            height={120}
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              {/* Mask cuts the shadow circle out of the moon fill to form the crescent */}
              <mask id="crescent-mask">
                <rect width={120} height={120} fill="white" />
                <circle cx={78} cy={53} r={35} fill="black" />
              </mask>
            </defs>

            {/* Moon crescent fill */}
            <circle cx={60} cy={60} r={40} fill="var(--ember-dim)" mask="url(#crescent-mask)" />

            {/* Moon outline ring */}
            <circle cx={60} cy={60} r={40} fill="none" stroke="var(--ember)" strokeWidth={1.5} />

            {/*
              Pentacle — inscribed in the crescent sliver.
              Center (35,62) is inside the crescent (verified: 27px from moon center,
              49px from shadow center — well within crescent).
              Outer star radius = 11px; circle radius = 12px.

              Pentagram vertices at r=11, starting from top (-90°):
                P0 (35, 51)
                P1 (45.46, 58.60)
                P2 (41.47, 70.90)
                P3 (28.53, 70.90)
                P4 (24.54, 58.60)
              Path order (every-other vertex): P0→P2→P4→P1→P3→close
            */}
            <circle
              cx={35} cy={62} r={12}
              fill="none"
              stroke="var(--gold)"
              strokeWidth={0.75}
              opacity={0.8}
            />
            <path
              d="M 35,51 L 41.47,70.90 L 24.54,58.60 L 45.46,58.60 L 28.53,70.90 Z"
              fill="none"
              stroke="var(--gold)"
              strokeWidth={0.75}
              strokeLinejoin="round"
              opacity={0.8}
            />

            {/* Cardinal tick marks — N, E, S, W — in gold */}
            <line x1={60} y1={20} x2={60} y2={13} stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={100} y1={60} x2={107} y2={60} stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={60} y1={100} x2={60} y2={107} stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={20} y1={60} x2={13} y2={60} stroke="var(--gold)" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
        </div>

        {/* Hero line — single continuous line, two weights */}
        <div className="fade-in" style={{ animationDelay: '0.2s', lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: "'Cormorant Upright', Georgia, serif",
              fontWeight: 600,
              color: 'var(--gold)',
              fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)',
              letterSpacing: '-0.01em',
            }}
          >
            The Witching Hour
          </span>
          <span
            style={{
              fontFamily: "'Cormorant Upright', Georgia, serif",
              fontWeight: 300,
              color: 'var(--roseash)',
              fontSize: 'clamp(1.9rem, 5.2vw, 3.5rem)',
              letterSpacing: '-0.01em',
            }}
          >
            {' '}is upon us.
          </span>
        </div>

        {/* Tagline */}
        <p
          className="fade-in"
          style={{
            animationDelay: '0.4s',
            fontFamily: "'EB Garamond', Georgia, serif",
            fontStyle: 'italic',
            color: 'var(--mist)',
            fontSize: '1.15rem',
            marginTop: '1rem',
            marginBottom: '2.25rem',
          }}
        >
          For those who never stopped believing in magic.
        </p>

        {/* CTAs */}
        <div
          className="fade-in"
          style={{
            animationDelay: '0.6s',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/register"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--ember)',
              color: 'var(--roseash)',
              padding: '0.75rem 2rem',
              borderRadius: '4px',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            Enter the Circle
          </Link>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              backgroundColor: 'transparent',
              color: 'var(--mist)',
              padding: '0.75rem 2rem',
              borderRadius: '4px',
              border: '1px solid var(--ember-dim)',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            I already belong
          </Link>
        </div>
      </main>

      {/* Show ribbon — fixed at bottom of viewport */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--claret)',
          borderTop: '1px solid var(--ember-dim)',
          padding: '0.55rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          overflow: 'hidden',
        }}
      >
        {CANONS.map(({ label, color, muted }) => (
          <span
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: color,
                opacity: muted ? 0.6 : 1,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.68rem',
                letterSpacing: '0.04em',
                color: muted ? 'var(--faded)' : 'var(--mist)',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          </span>
        ))}
      </div>
    </>
  )
}
