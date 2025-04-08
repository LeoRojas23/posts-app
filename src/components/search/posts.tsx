import Link from 'next/link'
import { Suspense } from 'react'

import Pagination from '@/components/pagination'
import PostList from '@/components/post/post-list'
import { getSearchPosts } from '@/db/queries'

interface Props {
  query: string
  filter: string
  page?: number
}

export default async function Posts({ query, filter, page }: Props) {
  const { posts: postsData, totalPosts, totalPages } = await getSearchPosts({ query, filter, page })

  if (!postsData.length && page && page > 1)
    return (
      <>
        <p className='text-center text-sm text-neutral-400'>
          There are no more posts matching &apos;{query}&apos;
        </p>
        <Pagination totalPages={totalPages} />
      </>
    )

  if (!postsData.length)
    return (
      <p className='text-center text-sm text-neutral-400'>
        No posts matching &apos;{query}&apos; were found.
      </p>
    )

  return (
    <section className='flex w-full flex-col'>
      {filter === 'all' && (
        <span className='pt-1 text-sm text-neutral-400'>
          <b>{totalPosts}</b> post{totalPosts > 1 ? 's' : ''} found
        </span>
      )}
      <PostList
        className='border-x border-b border-neutral-800 first-of-type:rounded-t-md first-of-type:border-t last-of-type:rounded-b-md'
        path={`/search?q=${query}`}
        posts={postsData}
      />
      {page ? (
        <Suspense>
          <Pagination totalPages={totalPages} />
        </Suspense>
      ) : (
        totalPosts > 3 &&
        postsData.length !== totalPosts && (
          <Link
            className='my-1 px-1 py-1 text-blue-400 transition-colors duration-100 ease-linear hover:bg-neutral-800'
            href={`?q=${query}&f=posts`}
          >
            See more posts
          </Link>
        )
      )}
    </section>
  )
}
