import Link from 'next/link'
import BloodMoonMark from '@/app/components/BloodMoonMark'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-8">
        <BloodMoonMark size={64} />
        <h1
          className="text-4xl font-light tracking-wide mt-4"
          style={{ fontFamily: 'Cormorant Upright, serif', color: 'var(--roseash)' }}
        >
          The Witching Hour
        </h1>
      </div>

      <div
        className="rounded-sm border p-8"
        style={{ backgroundColor: 'var(--claret)', borderColor: 'var(--ember-dim)' }}
      >
        <p className="text-2xl mb-4" style={{ color: 'var(--gold)' }} aria-hidden="true">
          ✦
        </p>
        <h2
          className="text-xl mb-4"
          style={{ fontFamily: 'Playfair Display, Georgia, serif', color: 'var(--roseash)' }}
        >
          Check your email
        </h2>
        <p
          style={{
            fontFamily: 'EB Garamond, Georgia, serif',
            color: 'var(--mist)',
            lineHeight: '1.75',
          }}
        >
          A confirmation link has been sent to{' '}
          {email ? (
            <strong style={{ color: 'var(--roseash)' }}>{email}</strong>
          ) : (
            'your email address'
          )}
          . Click the link to complete your registration and enter the circle.
        </p>
        <p
          className="text-sm mt-5"
          style={{ fontFamily: 'EB Garamond, Georgia, serif', color: 'var(--faded)' }}
        >
          Didn&apos;t receive it? Check your spam folder, or try registering again.
        </p>
      </div>

      <p
        className="text-sm mt-6"
        style={{ fontFamily: 'EB Garamond, Georgia, serif', color: 'var(--mist)' }}
      >
        <Link href="/login" style={{ color: 'var(--ember)' }}>
          Return to sign in
        </Link>
      </p>
    </div>
  )
}
