import { count, eq } from 'drizzle-orm'

import CreateReplyComment from './create-reply-comment'
import CreateReplyPost from './create-reply-post'

import { validateRequest } from '@/lib/lucia'
import { db } from '@/db'
import { commentTable } from '@/db/schema'

interface Props {
  commentId?: string
  postId: string
  path: string
}

export default async function Reply({ commentId, postId, path }: Props) {
  const { session } = await validateRequest()

  const childrenCount = commentId
    ? await db
        .select({
          count: count(),
        })
        .from(commentTable)
        .where(eq(commentTable.parentId, commentId))
        .then(res => res[0].count)
    : await db
        .select({
          count: count(),
        })
        .from(commentTable)
        .where(eq(commentTable.postId, postId))
        .then(res => res[0].count)

  return (
    <>
      {commentId ? (
        <CreateReplyComment
          commentsLength={childrenCount}
          parentId={commentId}
          path={path}
          postId={postId}
          session={session}
        />
      ) : (
        <CreateReplyPost
          commentsLength={childrenCount}
          path={path}
          postId={postId}
          session={session}
        />
      )}
    </>
  )
}
