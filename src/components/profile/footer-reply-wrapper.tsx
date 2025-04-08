import { headers } from 'next/headers'

import FooterReply from '../profile/footer-reply'

import { auth } from '@/auth'
import { getCommentsCountOfComment, getLikesOfComment } from '@/db/queries'

interface Props {
  commentId: string
}

export default async function FooterReplyWrapper({ commentId }: Props) {
  const user = await auth.api.getSession({ headers: await headers() })

  const [commentsCount, commentLikes] = await Promise.all([
    getCommentsCountOfComment({ commentId }),
    getLikesOfComment({ commentId }),
  ])

  return (
    <FooterReply
      commentCount={commentsCount}
      commentId={commentId}
      commentLikes={commentLikes}
      sessionUserId={user?.session.userId}
    />
  )
}
