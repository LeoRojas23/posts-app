import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { userTable } from '@/db/schema'
import { fetchRepliesOfUser } from '@/db/queries'
import Replies from '@/components/profile/replies'
import Pagination from '@/components/pagination'

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
    title: `Posts with replies by ${userData.name} (@${userData.username})`,
    description: `Replies of ${userData.name}`,
  }
}

export default async function page({ params, searchParams }: Props) {
  const { slug } = params

  const page = Number(searchParams.page) || 1

  const { replies, totalPages } = await fetchRepliesOfUser(slug, page)

  if (!replies.length && page > 1)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} has no more replies.
      </p>
    )

  if (!replies.length)
    return (
      <p className='mt-2 text-center font-semibold tracking-tight text-neutral-200 sm:text-lg'>
        {slug} hasn&apos;t created any replies yet.
      </p>
    )

  return (
    <main className='flex h-fit w-full flex-col'>
      <section>
        <Replies path={`/profile/${slug}/replies`} replies={replies} slug={slug} />

        <Pagination totalPages={totalPages} />
      </section>
    </main>
  )
}
