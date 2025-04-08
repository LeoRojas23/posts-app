import { Suspense } from 'react'
import { eq } from 'drizzle-orm'

import Pagination from '@/components/pagination'
import PostList from '@/components/post/post-list'
import { getLikedPosts } from '@/db/queries'
import { db } from '@/db'
import { userTable } from '@/db/schema'

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
    title: `Liked posts by ${userData.name} (@${userData.username})`,
    description: `Liked posts of ${userData.name}`,
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page: string }>
}) {
  const { page } = await searchParams
  const { slug } = await params
  const pageNumber = Number(page) || 1

  const { likedPosts, totalPages } = await getLikedPosts({ slug, page: pageNumber })

  if (!likedPosts.length && pageNumber > 1)
    return (
      <>
        <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
          {slug} has no more liked posts.
        </p>
        <Pagination totalPages={totalPages} />
      </>
    )

  if (!likedPosts.length)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} hasn&apos;t liked any posts yet.
      </p>
    )

  return (
    <>
      <PostList
        className='border-b border-r border-neutral-800 last-of-type:rounded-br-md'
        path={`/profile/${slug}/likes/posts`}
        posts={likedPosts}
      />
      <Suspense>
        <Pagination totalPages={totalPages} />
      </Suspense>
    </>
  )
}
