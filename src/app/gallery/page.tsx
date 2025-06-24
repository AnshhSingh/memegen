import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase-server'
import GalleryPageClient from '@/components/GalleryPageClient'

export const revalidate = 0

export default async function Gallery() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  let generations = []
  if (user) {
    const { data } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    generations = data || []
  }

  return <GalleryPageClient generations={generations} />
}
