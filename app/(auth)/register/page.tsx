import Link from 'next/link'
import BloodMoonMark from '@/app/components/BloodMoonMark'
import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <BloodMoonMark size={64} />
        <h1
          className="text-4xl font-light tracking-wide mt-4 mb-1"
          style={{ fontFamily: 'Cormorant Upright, serif', color: 'var(--roseash)' }}
        >
          The Witching Hour
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: 'EB Garamond, Georgia, serif', color: 'var(--mist)' }}
        >
          Where the old magic endures
        </p>
      </div>

      <div
        className="rounded-sm border p-8"
        style={{ backgroundColor: 'var(--claret)', borderColor: 'var(--ember-dim)' }}
      >
        <h2
          className="text-xs tracking-[0.2em] uppercase mb-6"
          style={{ fontFamily: 'Cinzel, serif', color: 'var(--mist)' }}
        >
          Join the Coven
        </h2>
        <RegisterForm />
      </div>

      <p
        className="text-center text-sm mt-6"
        style={{ fontFamily: 'EB Garamond, Georgia, serif', color: 'var(--mist)' }}
      >
        Already a member?{' '}
        <Link href="/login" style={{ color: 'var(--ember)' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
