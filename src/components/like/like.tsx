import { eq } from 'drizzle-orm'

import ToggleLike from './toggle-like'

import { validateRequest } from '@/lib/lucia'
import { db } from '@/db'
import { commentLikeTable, postLikeTable } from '@/db/schema'

interface Props {
  dataId: string
  path: string
  from: 'post' | 'comment'
}

export default async function Like({ dataId, path, from }: Props) {
  const { user } = await validateRequest()

  const likesData =
    from === 'post'
      ? await db
          .select({
            userId: postLikeTable.userId,
          })
          .from(postLikeTable)
          .where(eq(postLikeTable.postId, dataId))
      : await db
          .select({
            userId: commentLikeTable.userId,
          })
          .from(commentLikeTable)
          .where(eq(commentLikeTable.commentId, dataId))

  return <ToggleLike dataId={dataId} from={from} likesData={likesData} path={path} session={user} />
}
