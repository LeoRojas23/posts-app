import { eq } from 'drizzle-orm'
import { Suspense } from 'react'

import { db } from '@/db'
import { userTable } from '@/db/schema'
import PostList from '@/components/post/post-list'
import Pagination from '@/components/pagination'
import { getPostsOfUser } from '@/db/queries'

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
    title: `${userData.name} (@${userData.username})`,
    description: `Profile of ${userData.name}`,
  }
}

export default async function page({ params, searchParams }: Props) {
  const { page } = await searchParams
  const { slug } = await params

  const pageNumber = Number(page) || 1

  const { posts, totalPages } = await getPostsOfUser({ slug, page: pageNumber })

  if (!posts.length && pageNumber > 1)
    return (
      <>
        <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
          {slug} has no more posts.
        </p>
        <Pagination totalPages={totalPages} />
      </>
    )

  if (!posts.length)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} hasn&apos;t created any posts yet.
      </p>
    )

  return (
    <main className='flex h-fit w-full flex-col'>
      <section>
        <PostList
          className='border-x border-b border-neutral-800 last-of-type:rounded-b-md sm:border-l-0 sm:last-of-type:rounded-bl-none'
          path={`/profile/${slug}`}
          posts={posts}
        />

        <Suspense>
          <Pagination totalPages={totalPages} />
        </Suspense>
      </section>
    </main>
  )
}
