import { count, eq } from 'drizzle-orm'

import FooterReply from '../profile/footer-reply'

import { db } from '@/db'
import { validateRequest } from '@/lib/lucia'
import { commentLikeTable, commentTable } from '@/db/schema'

interface Props {
  commentId: string
  path: string
}

export default async function FooterReplyWrapper({ commentId, path }: Props) {
  const { user } = await validateRequest()

  const [commentsCount, commentLikes] = await Promise.all([
    db
      .select({
        count: count(),
      })
      .from(commentTable)
      .where(eq(commentTable.parentId, commentId))
      .then(res => res[0].count),
    db
      .select({
        userId: commentLikeTable.userId,
      })
      .from(commentLikeTable)
      .where(eq(commentLikeTable.commentId, commentId)),
  ])

  return (
    <FooterReply
      commentCount={commentsCount}
      commentId={commentId}
      commentLikes={commentLikes}
      path={path}
      session={user}
    />
  )
}
