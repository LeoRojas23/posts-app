import Link from 'next/link'
import { and, count, eq } from 'drizzle-orm'

import PostWithReplies from './post-with-replies'
import RepliesList from './replies-list'

import { type RepliesProfile as IRepliesProfile } from '@/types'
import { commentTable, userTable } from '@/db/schema'
import { db } from '@/db'

interface Props {
  path: string
  replies: IRepliesProfile[]
  slug: string
}

export default async function Replies({ path, replies, slug }: Props) {
  return (
    <>
      {replies?.map(reply => (
        <article
          key={reply.id}
          className='flex w-full flex-col border-x border-b border-neutral-800 last-of-type:rounded-b-md sm:border-l-0 sm:last-of-type:rounded-bl-none'
        >
          <PostWithReplies path={path} post={reply} />

          <ReplyInfo postAuthor={reply.author.username} postId={reply.id} slug={slug} />

          <RepliesList
            authorUsername={reply.author.username}
            comments={reply.comments}
            path={path}
            postId={reply.id}
          />
        </article>
      ))}
    </>
  )
}

async function ReplyInfo({
  postId,
  slug,
  postAuthor,
}: {
  postId: string
  slug: string
  postAuthor: string | null
}) {
  const userId = await db
    .select({
      id: userTable.id,
    })
    .from(userTable)
    .where(eq(userTable.username, slug))
    .then(res => res[0].id)

  const moreCommentsOfUser = await db
    .select({
      count: count(),
    })
    .from(commentTable)
    .where(and(eq(commentTable.authorId, userId), eq(commentTable.postId, postId)))
    .then(res => res[0].count)

  return (
    <>
      {moreCommentsOfUser > 3 && (
        <Link
          className='ml-[25px] cursor-pointer border-l-2 border-l-neutral-800 py-1 transition-colors duration-100 ease-linear hover:bg-neutral-800'
          href={`/post/${postAuthor}/${postId}`}
        >
          <span className='pl-2 text-[#56ff50]'>More replies of {slug}</span>
        </Link>
      )}
    </>
  )
}
