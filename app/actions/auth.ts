'use server'

import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'

export type RegisterState =
  | {
      error?: string
      fieldErrors?: {
        displayName?: string
        email?: string
        password?: string
      }
    }
  | undefined

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const displayName = ((formData.get('displayName') as string | null) ?? '').trim()
  const email = ((formData.get('email') as string | null) ?? '').trim()
  const password = (formData.get('password') as string | null) ?? ''
  const showPreference = (formData.get('showPreference') as string | null) || null

  const fieldErrors: NonNullable<RegisterState>['fieldErrors'] = {}

  if (displayName.length < 2) {
    fieldErrors.displayName = 'Display name must be at least 2 characters.'
  }
  if (!email.includes('@')) {
    fieldErrors.email = 'A valid email address is required.'
  }
  if (password.length < 8) {
    fieldErrors.password = 'Password must be at least 8 characters.'
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  // Admin client (no cookies) handles all DB reads/writes outside of auth
  const admin = getAdminClient()

  const { data: existing } = await admin
    .from('users')
    .select('id')
    .eq('display_name', displayName)
    .maybeSingle()

  if (existing) {
    return { fieldErrors: { displayName: 'That display name is already taken.' } }
  }

  // One cookie-aware client for auth — admin client above is not cookie-aware, no conflict
  const supabase = await getServerClient()
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes('already registered')) {
      return { fieldErrors: { email: 'An account with this email already exists.' } }
    }
    return { error: signUpError.message }
  }

  if (!authData.user) {
    return { error: 'Registration failed. Please try again.' }
  }

  const { error: insertError } = await admin.from('users').insert({
    id: authData.user.id,
    display_name: displayName,
    show_preference: showPreference,
  })

  if (insertError) {
    return { error: 'Failed to create user profile. Please contact support.' }
  }

  redirect(`/confirm?email=${encodeURIComponent(email)}`)
}

export type LoginState = { error?: string } | undefined

export async function loginUser(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = ((formData.get('email') as string | null) ?? '').trim()
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  redirect('/dashboard')
}
