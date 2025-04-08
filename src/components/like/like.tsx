import { headers } from 'next/headers'

import ToggleLike from './toggle-like'

import { auth } from '@/auth'
import { getLikesOfComment, getLikesOfPost } from '@/db/queries'

interface Props {
  dataId: string
  from: 'post' | 'comment'
}

export default async function Like({ dataId, from }: Props) {
  const user = await auth.api.getSession({ headers: await headers() })

  const likesData =
    from === 'post'
      ? await getLikesOfPost({ postId: dataId })
      : await getLikesOfComment({ commentId: dataId })

  return (
    <ToggleLike
      dataId={dataId}
      from={from}
      likesData={likesData}
      sessionUserId={user?.session.userId}
    />
  )
}
