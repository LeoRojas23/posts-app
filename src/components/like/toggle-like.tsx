'use client'

import { toast } from 'sonner'
import { useOptimistic } from 'react'
import { useFormState } from 'react-dom'

import ToggleLikeButton from '../button/toggle-like-button'

import { toggleLike } from '@/actions/actions'
import { type UserAuth } from '@/types'

interface Props {
  likesData: Array<{ userId: string }>
  dataId: string
  path: string
  session: UserAuth | null
  from: 'post' | 'comment'
}

export default function ToggleLike({ likesData, dataId, path, session, from }: Props) {
  const toggleLikeTransformed = toggleLike.bind(null, dataId, from, path)
  const [, formAction] = useFormState(toggleLikeTransformed, null)

  const [optimisticLikes, addOptimisticLikes] = useOptimistic(
    likesData,
    (currentLikes, userId: string) => {
      const existingIndex = currentLikes.findIndex(like => like.userId === userId)

      if (existingIndex !== -1) {
        return currentLikes.toSpliced(existingIndex, 1)
      } else {
        return [...currentLikes, { userId }]
      }
    },
  )

  const colorHeart = optimisticLikes.some(like => like.userId === session?.id)

  return (
    <form
      action={async () => {
        if (!session) {
          toast.error('Authentication required.')

          return
        }
        addOptimisticLikes(session.id)
        await formAction()
      }}
      className='group/like-svg relative w-fit'
    >
      <ToggleLikeButton colorHeart={colorHeart} likesLength={optimisticLikes.length} />
    </form>
  )
}
