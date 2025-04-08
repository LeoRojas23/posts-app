'use client'

import { toast } from 'sonner'
import { useOptimistic } from 'react'
import { useActionState } from 'react'

import ToggleLikeButton from '../button/toggle-like-button'

import { toggleLike } from '@/actions/actions'
import { ToggleLikeResponse } from '@/types'

interface Props {
  likesData: Array<{ userId: string }>
  dataId: string
  sessionUserId: string | undefined
  from: 'post' | 'comment'
}

const initialState: ToggleLikeResponse = {
  success: false,
  message: '',
}

export default function ToggleLike({ likesData, dataId, sessionUserId, from }: Props) {
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

  const [, formAction] = useActionState(async () => {
    if (!sessionUserId) {
      toast.error('Authentication required.')

      return
    }

    addOptimisticLikes(sessionUserId)

    return await toggleLike({ dataId, from })
  }, initialState)

  const colorHeart = optimisticLikes.some(like => like.userId === sessionUserId)

  return (
    <form action={formAction} className='w-full'>
      <ToggleLikeButton colorHeart={colorHeart} likesLength={optimisticLikes.length} />
    </form>
  )
}
