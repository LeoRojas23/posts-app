import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { userTable } from '@/db/schema'
import PostList from '@/components/post/post-list'
import Pagination from '@/components/pagination'
import { fetchMediaPostsOfUser } from '@/db/queries'

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
    title: `Media posts by ${userData.name} (@${userData.username})`,
    description: `Media posts of ${userData.name}`,
  }
}

export default async function page({ params, searchParams }: Props) {
  const { slug } = params

  const page = Number(searchParams.page) || 1

  const { mediaPosts, totalPages } = await fetchMediaPostsOfUser(slug, page)

  if (!mediaPosts.length && page > 1)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} has no more media posts.
      </p>
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

        <Pagination totalPages={totalPages} />
      </section>
    </main>
  )
}
