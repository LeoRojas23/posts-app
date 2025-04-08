import { Suspense } from 'react'
import { eq } from 'drizzle-orm'

import LikedComment from '@/components/profile/liked-comment'
import Pagination from '@/components/pagination'
import { getLikedComments } from '@/db/queries'
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
    title: `Liked comments by ${userData.name} (@${userData.username})`,
    description: `Liked comments of ${userData.name}`,
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

  const { likedComments, totalPages } = await getLikedComments({ slug, page: pageNumber })

  if (!likedComments.length && pageNumber > 1)
    return (
      <>
        <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
          {slug} has no more liked comments.
        </p>
        <Pagination totalPages={totalPages} />
      </>
    )

  if (!likedComments.length)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} hasn&apos;t liked any comments yet.
      </p>
    )

  return (
    <>
      {likedComments.map(comment => (
        <LikedComment key={comment.id} comment={comment} path={`/profile/${slug}/likes/comments`} />
      ))}

      <Suspense>
        <Pagination totalPages={totalPages} />
      </Suspense>
    </>
  )
}
