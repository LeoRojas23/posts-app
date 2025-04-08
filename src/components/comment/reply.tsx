import CreateReplyComment from './create-reply-comment'
import CreateReplyPost from './create-reply-post'

import { getCommentsCountOfComment, getCommentsCountOfPost } from '@/db/queries'

interface Props {
  commentId?: string
  postId: string
}

export default async function Reply({ commentId, postId }: Props) {
  const childrenCount = commentId
    ? await getCommentsCountOfComment({ commentId })
    : await getCommentsCountOfPost({ postId })

  return (
    <>
      {commentId ? (
        <CreateReplyComment commentsLength={childrenCount} parentId={commentId} postId={postId} />
      ) : (
        <CreateReplyPost commentsLength={childrenCount} postId={postId} />
      )}
    </>
  )
}
