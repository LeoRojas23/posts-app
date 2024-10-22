import Pagination from '@/components/pagination'
import PostList from '@/components/post/post-list'
import { fetchRootPosts } from '@/db/queries'

interface Props {
  page: number
}

export default async function PostData({ page }: Props) {
  const { posts, totalPages } = await fetchRootPosts(page)

  if (!posts.length && page > 1) {
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

      <Pagination totalPages={totalPages} />
    </>
  )
}
