import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/serverClient'
import { getAdminClient } from '@/lib/supabase/adminClient'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // One cookie-aware client for the code exchange
  const supabase = await getServerClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
  }

  // Insert welcome Council Notice via admin client (non-cookie-aware — no two-client conflict)
  // Wrapped in try/catch: mail_messages table is created in a later migration
  try {
    const admin = getAdminClient()
    await admin.from('mail_messages').insert({
      sender_id: null,
      recipient_id: data.user.id,
      subject: 'Welcome to The Witching Hour',
      body: [
        '<p>The veil has parted, and you have found your way to us.</p>',
        '<p>Welcome to <strong>The Witching Hour</strong> — a place where the old magic endures, ',
        'where stories are written in shadow and candlelight, and where you are free to become ',
        'whoever you were always meant to be.</p>',
        '<p>Your first step is to create your character and choose a faction. ',
        '<em>The Covenant</em> guards ancient traditions. <em>The Cabal</em> walks the edges of power. ',
        '<em>The Unbound</em> answer to no one but themselves.</p>',
        '<p>The circle is open. The hour is yours.</p>',
      ].join(''),
      is_system_message: true,
      is_welcome: true,
    })
  } catch {
    // Silently deferred — mail_messages migration not yet applied
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
