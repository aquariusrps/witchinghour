'use client'

import { useActionState } from 'react'
import { loginUser } from '@/app/actions/auth'

const labelCss: React.CSSProperties = {
  fontFamily: 'Cinzel, serif',
  color: 'var(--mist)',
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
}

const inputCss: React.CSSProperties = {
  backgroundColor: 'var(--raised)',
  borderColor: 'var(--ember-dim)',
  color: 'var(--roseash)',
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: '1rem',
}

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginUser, undefined)

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.error && (
        <p
          className="text-sm p-3 rounded-sm"
          style={{
            color: 'var(--ember-light)',
            backgroundColor: 'var(--raised)',
            borderLeft: '2px solid var(--ember)',
            fontFamily: 'EB Garamond, Georgia, serif',
          }}
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" style={labelCss}>
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2 rounded-sm border outline-none transition-colors"
          style={inputCss}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" style={labelCss}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full px-3 py-2 rounded-sm border outline-none transition-colors"
          style={inputCss}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-sm tracking-widest uppercase transition-colors disabled:opacity-50 mt-2"
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.7rem',
          backgroundColor: 'var(--ember)',
          color: 'var(--roseash)',
        }}
      >
        {pending ? 'Opening the veil…' : 'Enter the Circle'}
      </button>
    </form>
  )
}
