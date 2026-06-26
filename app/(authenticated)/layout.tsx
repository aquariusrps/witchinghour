import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/serverClient'
import PageLayout from '@/app/components/PageLayout'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <PageLayout displayName={profile?.display_name} avatarUrl={profile?.avatar_url}>
      {children}
    </PageLayout>
  )
}
