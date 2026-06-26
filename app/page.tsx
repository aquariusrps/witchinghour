import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import BloodMoonMark from '@/app/components/BloodMoonMark'

export const metadata: Metadata = {
  title: 'The Witching Hour — A Fan Community for Charmed, Buffy & Angel',
  description:
    'For those who never stopped believing in magic. A fan community and roleplay hub for Charmed, Buffy the Vampire Slayer, Angel, and the magic that never left.',
  openGraph: {
    title: 'The Witching Hour — A Fan Community for Charmed, Buffy & Angel',
    description:
      'For those who never stopped believing in magic. A fan community and roleplay hub for Charmed, Buffy the Vampire Slayer, Angel, and the magic that never left.',
    type: 'website',
    url: 'https://atwitchinghour.com',
  },
}

const CANONS = [
  { label: 'Charmed',                color: 'var(--gold)',      primary: true  },
  { label: 'Buffy the Vampire Slayer', color: 'var(--moonstone)', primary: true  },
  { label: 'Angel',                  color: 'var(--ember)',     primary: true  },
  { label: 'The Secret Circle',      color: 'var(--mist)',      primary: false },
  { label: 'The Craft',              color: 'var(--mist)',      primary: false },
  { label: 'Witches of East End',    color: 'var(--mist)',      primary: false },
  { label: 'Practical Magic',        color: 'var(--mist)',      primary: false },
]

const HERO_GRADIENT = [
  'radial-gradient(ellipse 65% 55% at top left,  rgba(200,56,24,0.18)  0%, transparent 60%)',
  'radial-gradient(ellipse 55% 60% at right center, rgba(224,176,40,0.12) 0%, transparent 60%)',
  'radial-gradient(ellipse 65% 50% at bottom center, rgba(56,120,168,0.12) 0%, transparent 60%)',
  'var(--char)',
].join(', ')

// Pentacle: 5-pointed star inscribed in a circle.
// Vertices at 72° intervals from top (−90°), outer radius 95 in a 200×200 viewBox.
// P0=(100,5) P1=(190.4,70.6) P2=(155.8,176.9) P3=(44.2,176.9) P4=(9.6,70.6)
// Connect every other vertex for the star: 0→2→4→1→3→0
const PENTACLE_PATH = 'M100,5 L155.8,176.9 L9.6,70.6 L190.4,70.6 L44.2,176.9 Z'

const ANIMATIONS = `
  @keyframes moonRise {
    from { opacity: 0; transform: scale(1.0); }
    to   { opacity: 1; transform: scale(1.04); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim-moon  { animation: moonRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay:   0ms; }
  .anim-decl  { animation: fadeUp  0.7s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 350ms; }
  .anim-tag   { animation: fadeUp  0.7s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 500ms; }
  .anim-btn   { animation: fadeUp  0.7s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 650ms; }
  @media (prefers-reduced-motion: reduce) {
    .anim-moon, .anim-decl, .anim-tag, .anim-btn {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
`

export default async function LandingPage() {
  try {
    const supabase = await getServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) redirect('/dashboard')
  } catch {
    // Supabase not configured yet (env vars pending) — render landing page
  }

  return (
    <>
      <style>{ANIMATIONS}</style>

      <main
        className="relative flex flex-col min-h-screen overflow-hidden"
        style={{ background: HERO_GRADIENT }}
      >
        {/* Pentacle watermark */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            style={{ width: 'min(640px, 90vmin)', height: 'min(640px, 90vmin)' }}
          >
            <circle cx="100" cy="100" r="95" stroke="var(--roseash)" strokeWidth="0.6" />
            <path d={PENTACLE_PATH} stroke="var(--roseash)" strokeWidth="0.6" fill="none" strokeLinejoin="miter" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          {/* Logo mark */}
          <div className="anim-moon mb-6">
            <BloodMoonMark size={120} />
          </div>

          {/* Declaration */}
          <h1 className="anim-decl mb-4 leading-tight" style={{ fontFamily: 'Cormorant Upright, serif' }}>
            <span
              style={{
                fontWeight: 600,
                color: 'var(--gold)',
                fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)',
              }}
            >
              The Witching Hour
            </span>
            <span
              style={{
                fontWeight: 300,
                color: 'var(--roseash)',
                fontSize: 'clamp(1.9rem, 5.2vw, 3.5rem)',
              }}
            >
              {' '}is upon us.
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="anim-tag mb-10 max-w-md"
            style={{
              fontFamily: 'EB Garamond, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.05rem, 2.4vw, 1.35rem)',
              color: 'var(--mist)',
              lineHeight: 1.6,
            }}
          >
            For those who never stopped believing in magic.
          </p>

          {/* CTA buttons */}
          <div className="anim-btn flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:w-auto">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-sm transition-colors"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                backgroundColor: 'var(--ember)',
                color: 'var(--roseash)',
              }}
            >
              Enter the Circle
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 rounded-sm border transition-colors"
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                borderColor: 'var(--ember-dim)',
                color: 'var(--mist)',
                backgroundColor: 'transparent',
              }}
            >
              I already belong
            </Link>
          </div>
        </div>

        {/* Show ribbon */}
        <div
          className="relative z-10 border-t"
          style={{
            backgroundColor: 'var(--claret)',
            borderColor: 'var(--ember-dim)',
          }}
        >
          <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 px-6 py-3">
            {CANONS.map(({ label, color, primary }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 whitespace-nowrap"
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: primary ? 'var(--roseash)' : 'var(--faded)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
