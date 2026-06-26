import { unstable_cache } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/adminClient'

// See TWH_BRIEF_v1.md §17 — all cached functions return plain objects, never { data: [...] }

type SiteSettings = Record<string, string>

export const getCachedSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const admin = getAdminClient()
    const { data } = await admin.from('site_settings').select('key, value')
    if (!data) return {}
    return Object.fromEntries(data.map(({ key, value }: { key: string; value: string }) => [key, value]))
  },
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 300 }
)

export async function getSetting(key: string): Promise<string | null> {
  const settings = await getCachedSiteSettings()
  return settings[key] ?? null
}
