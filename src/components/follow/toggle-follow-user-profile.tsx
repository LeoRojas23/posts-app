'use client'

import { toast } from 'sonner'
import { useFormState } from 'react-dom'

import SubmitFormButton from '../button/submit-form-button'

import { useFollow } from './follow-context'

import { followUser } from '@/actions/actions'
import { type UserAuth } from '@/types'

interface Props {
  path: string
  userToFollow: string
  session: UserAuth | null
}

export default function ToggleFollowUserProfile({ path, userToFollow, session }: Props) {
  const { follow, addFollow, removeFollow } = useFollow()
  const followUserTransformed = followUser.bind(null, userToFollow, path)
  const [, formAction] = useFormState(followUserTransformed, null)

  const followersCount = follow.filter(f => f.followingId === userToFollow).length

  const followingCount = follow.filter(f => f.followerId === userToFollow).length

  const isFollowing = follow.some(
    f => f.followingId === userToFollow && f.followerId === session?.id,
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
      <form
        action={async () => {
          if (!session) {
            toast.error('Authentication required.')

            return
          }

          if (isFollowing) {
            removeFollow(session.id, userToFollow)
          } else {
            addFollow(session.id, userToFollow)
          }

          await formAction()
        }}
      >
        <SubmitFormButton
          disableDots
          className='rounded-md bg-[#00ff00] px-2 py-1 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90 sm:px-2.5 sm:py-1.5'
        >
          {isFollowing ? 'Unfollow user' : 'Follow user'}
        </SubmitFormButton>
      </form>
    </section>
  )
}
