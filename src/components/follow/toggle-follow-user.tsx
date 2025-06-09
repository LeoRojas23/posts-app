'use client'

import { toast } from 'sonner'
import { useActionState } from 'react'

import Icon from '../icon'
import FormButton from '../button/form-button'

import { useFollow } from './follow-context'

import { toggleFollow } from '@/actions/actions'
import { cn } from '@/utils/cn'

interface Props {
  userToFollow: string
  sessionUserId: string | undefined
  showIcon: boolean
}

export default function ToggleFollowUser({ userToFollow, sessionUserId, showIcon }: Props) {
  const { follow, addFollow, removeFollow } = useFollow()

  const [, formAction, pending] = useActionState(async () => {
    if (!sessionUserId) {
      toast.error('Authentication required.')

      return
    }

    if (isFollowing) {
      removeFollow(sessionUserId, userToFollow)
    } else {
      addFollow(sessionUserId, userToFollow)
    }

    return await toggleFollow({ userToFollow })
  }, null)

  const isFollowing = follow.some(
    f => f.followingId === userToFollow && f.followerId === sessionUserId,
  )

  return (
    <form action={formAction} className='flex w-full items-center justify-end'>
      <FormButton
        disableDots
        fromToggleFollow
        className={cn({
          'w-full rounded-md transition-colors duration-100 ease-linear hover:bg-[#3d3d3d50]':
            showIcon,
          'rounded-md bg-[#00b4f1] px-2 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90':
            !showIcon,
        })}
        pending={pending}
      >
        <div className='flex items-center gap-1.5 p-1'>
          {showIcon ? (
            <Icon className='h-4 w-4' id={isFollowing ? 'unfollowUser' : 'followUser'} />
          ) : null}
          {isFollowing ? 'Unfollow user' : 'Follow user'}
        </div>
      </FormButton>
    </form>
  )
}
