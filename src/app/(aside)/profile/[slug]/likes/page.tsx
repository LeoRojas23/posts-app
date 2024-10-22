import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { userTable } from '@/db/schema'
import LikedPost from '@/components/profile/liked-post'
import LikedComment from '@/components/profile/liked-comment'
import Pagination from '@/components/pagination'
import { fetchLikedContentOfUser } from '@/db/queries'

interface Props {
  params: { slug: string }
  searchParams: { page: string }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const userData = await db
    .select({
      name: userTable.name,
      username: userTable.username,
    })
    .from(userTable)
    .where(eq(userTable.username, params.slug))
    .then(res => res[0])

  if (!userData)
    return {
      title: 'Profile / Posts',
      description: 'This profile cannot be found.',
    }

  return {
    title: `Content liked by ${userData.name} (@${userData.username})`,
    description: `Likes of ${userData.name}`,
  }
}

export default async function page({ params, searchParams }: Props) {
  const { slug } = params

  const page = Number(searchParams.page) || 1

  const { likedContent, totalPages } = await fetchLikedContentOfUser(slug, page)

  if (!likedContent.length && page > 1)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} has no more liked content.
      </p>
    )

  if (!likedContent.length)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} didn&apos;t like anything yet.
      </p>
    )

  return (
    <main className='flex h-fit w-full flex-col'>
      <section>
        {likedContent.map(liked => {
          if (liked.type === 'post') {
            return <LikedPost key={liked.id} path={`/profile/${slug}/likes`} post={liked} />
          } else {
            return <LikedComment key={liked.id} comment={liked} path={`/profile/${slug}/likes`} />
          }
        })}

        <Pagination totalPages={totalPages} />
      </section>
    </main>
  )
}
