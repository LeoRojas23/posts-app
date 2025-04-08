import { eq } from 'drizzle-orm'
import { Suspense } from 'react'

import { db } from '@/db'
import { userTable } from '@/db/schema'
import PostList from '@/components/post/post-list'
import Pagination from '@/components/pagination'
import { getMediaPostsOfUser } from '@/db/queries'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const userData = await db
    .select({
      name: userTable.name,
      username: userTable.username,
    })
    .from(userTable)
    .where(eq(userTable.username, slug))
    .then(res => res[0])

  if (!userData)
    return {
      title: 'Profile / Posts',
      description: 'This profile cannot be found.',
    }

  return {
    title: `Media posts by ${userData.name} (@${userData.username})`,
    description: `Media posts of ${userData.name}`,
  }
}

export default async function page({ searchParams, params }: Props) {
  const { page } = await searchParams
  const { slug } = await params

  const pageNumber = Number(page) || 1

  const { mediaPosts, totalPages } = await getMediaPostsOfUser({ slug, page: pageNumber })

  if (!mediaPosts.length && pageNumber > 1)
    return (
      <>
        <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
          {slug} has no more media posts.
        </p>
        <Pagination totalPages={totalPages} />
      </>
    )

  if (!mediaPosts.length)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} hasn&apos;t created any media posts yet.
      </p>
    )

  return (
    <main className='flex h-fit w-full flex-col'>
      <section>
        <PostList
          className='border-x border-b border-neutral-800 last-of-type:rounded-b-md sm:border-l-0 sm:last-of-type:rounded-bl-none'
          path={`/profile/${slug}/media`}
          posts={mediaPosts}
        />

        <Suspense>
          <Pagination totalPages={totalPages} />
        </Suspense>
      </section>
    </main>
  )
}
