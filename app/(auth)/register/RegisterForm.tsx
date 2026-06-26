'use client'

import { useActionState } from 'react'
import { registerUser } from '@/app/actions/auth'

const SHOW_OPTIONS = [
  { value: 'charmed', label: 'Charmed' },
  { value: 'buffy', label: 'Buffy the Vampire Slayer' },
  { value: 'angel', label: 'Angel' },
  { value: 'secret_circle', label: 'The Secret Circle' },
  { value: 'the_craft', label: 'The Craft' },
  { value: 'witches_of_east_end', label: 'Witches of East End' },
  { value: 'practical_magic', label: 'Practical Magic' },
  { value: 'other', label: 'Other' },
]

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

const fieldErrorCss: React.CSSProperties = {
  color: 'var(--ember-light)',
  fontFamily: 'EB Garamond, Georgia, serif',
  fontSize: '0.875rem',
}

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, undefined)

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
        <label htmlFor="displayName" style={labelCss}>
          Display Name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          minLength={2}
          maxLength={40}
          autoComplete="username"
          className="w-full px-3 py-2 rounded-sm border outline-none transition-colors"
          style={inputCss}
        />
        {state?.fieldErrors?.displayName && (
          <p style={fieldErrorCss}>{state.fieldErrors.displayName}</p>
        )}
      </div>

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
        {state?.fieldErrors?.email && (
          <p style={fieldErrorCss}>{state.fieldErrors.email}</p>
        )}
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
          minLength={8}
          autoComplete="new-password"
          className="w-full px-3 py-2 rounded-sm border outline-none transition-colors"
          style={inputCss}
        />
        {state?.fieldErrors?.password && (
          <p style={fieldErrorCss}>{state.fieldErrors.password}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="showPreference" style={labelCss}>
          Favourite Show{' '}
          <span style={{ color: 'var(--faded)', textTransform: 'none', letterSpacing: 0 }}>
            (optional)
          </span>
        </label>
        <select
          id="showPreference"
          name="showPreference"
          className="w-full px-3 py-2 rounded-sm border outline-none transition-colors appearance-none"
          style={inputCss}
        >
          <option value="">— Select a show —</option>
          {SHOW_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
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
        {pending ? 'Entering the circle…' : 'Join the Coven'}
      </button>
    </form>
  )
}
