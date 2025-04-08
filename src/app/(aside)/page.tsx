import { Suspense } from 'react'
import { headers } from 'next/headers'

import FormCreatePost from '@/components/form/form-create-post'
import LoaderRounded from '@/components/loader-rounded'
import PostList from '@/components/post/post-list'
import Pagination from '@/components/pagination'
import { getRootPosts } from '@/db/queries'
import { auth } from '@/auth'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page: string
  }>
}) {
  const user = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <main className='h-full w-full px-1 lg:pr-0'>
      <FormCreatePost session={!!user?.session.userId} />

      <section>
        <Suspense
          fallback={
            <div className='min-h-screen rounded-t-md border-x border-t border-neutral-800'>
              <LoaderRounded />
            </div>
          }
        >
          <PostData searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  )
}

async function PostData({ searchParams }: { searchParams: Promise<{ page: string }> }) {
  const { page } = await searchParams
  const pageNumber = Number(page) || 1

  const { posts, totalPages } = await getRootPosts({ page: pageNumber })

  if (!posts.length && pageNumber > 1) {
    return (
      <>
        <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
          There are not more posts
        </p>
        <Pagination totalPages={totalPages} />
      </>
    )
  }

  if (!posts.length)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        There are no posts created
      </p>
    )

  return (
    <>
      <PostList
        className='border-x border-b border-neutral-800 first:rounded-t-md first:border-t last-of-type:rounded-b-md'
        path='/'
        posts={posts}
      />

      <Suspense>
        <Pagination totalPages={totalPages} />
      </Suspense>
    </>
  )
}
