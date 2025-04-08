import { and, eq } from 'drizzle-orm'
import { Suspense } from 'react'

import Comments from '@/components/comment/comments'
import LoaderRounded from '@/components/loader-rounded'
import PostId from '@/components/post/post-id'
import { db } from '@/db'
import { postTable, userTable } from '@/db/schema'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params
  const postData = await db
    .select({
      text: postTable.text,
      image: postTable.image,
      author: {
        name: userTable.name,
        username: userTable.username,
      },
    })
    .from(postTable)
    .where(and(eq(postTable.id, id)))
    .leftJoin(userTable, eq(postTable.authorId, userTable.id))
    .then(res => res[0])

  if (!postData || slug !== postData.author?.username) {
    return {
      title: 'Page not found / Posts',
      description: 'This post does not exist or has been deleted.',
    }
  }

  return {
    title: `${postData.author.name} on Posts: "${postData.text ?? postData.image}"`,
    description: `Post of ${postData.author.name}`,
  }
}

export default async function page({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params

  return (
    <main className='h-fit w-full'>
      <PostId id={id} slug={slug} />

      <Suspense
        fallback={
          <div className='min-h-screen border-r border-r-neutral-800'>
            <LoaderRounded />
          </div>
        }
      >
        <Comments id={id} slug={slug} />
      </Suspense>
    </main>
  )
}
