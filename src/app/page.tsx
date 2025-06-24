import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import LandingPageClient from '@/components/LandingPageClient'
import type { Generation } from '../../types'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function LandingPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: generations } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return <LandingPageClient generations={generations as Generation[] | null} />
}
