'use client'

import { useActionState } from 'react'
import { toast } from 'sonner'

import FormButton from '../button/form-button'

import { useFollow } from './follow-context'

import { toggleFollow } from '@/actions/actions'

interface Props {
  userToFollow: string
  sessionUserId: string | undefined
}

export default function ToggleFollowUserProfile({ userToFollow, sessionUserId }: Props) {
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

  const followersCount = follow.filter(f => f.followingId === userToFollow).length

  const followingCount = follow.filter(f => f.followerId === userToFollow).length

  const isFollowing = follow.some(
    f => f.followingId === userToFollow && f.followerId === sessionUserId,
  )

  return (
    <section className='flex items-center justify-between px-1 sm:px-1.5'>
      <section className='flex w-fit items-center gap-4'>
        <p className='flex items-center gap-1 text-neutral-400'>
          <span className='font-bold text-neutral-200'>{followingCount}</span>
          Following
        </p>
        <p className='flex items-center gap-1 text-neutral-400'>
          <span className='font-bold text-neutral-200'>{followersCount}</span>
          Followers
        </p>
      </section>
      <form action={formAction}>
        <FormButton
          disableDots
          fromToggleFollow
          className='rounded-md bg-[#00b4f1] px-2 py-1 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90 sm:px-2.5 sm:py-1.5'
          pending={pending}
        >
          {isFollowing ? 'Unfollow user' : 'Follow user'}
        </FormButton>
      </form>
    </section>
  )
}
