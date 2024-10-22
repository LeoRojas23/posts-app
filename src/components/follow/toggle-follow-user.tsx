'use client'

import { toast } from 'sonner'
import { useFormState } from 'react-dom'

import Icon from '../icon'
import SubmitFormButton from '../button/submit-form-button'

import { useFollow } from './follow-context'

import { followUser } from '@/actions/actions'
import { type UserAuth } from '@/types'
import { cn } from '@/utils/cn'

interface Props {
  path: string
  userToFollow: string
  session: UserAuth | null
  showIcon: boolean
}

export default function ToggleFollowUser({ path, userToFollow, session, showIcon }: Props) {
  const { follow, addFollow, removeFollow } = useFollow()
  const followUserTransformed = followUser.bind(null, userToFollow, path)
  const [, formAction] = useFormState(followUserTransformed, null)

  const isFollowing = follow.some(
    f => f.followingId === userToFollow && f.followerId === session?.id,
  )

  return (
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
      className='flex w-full items-center justify-end'
    >
      <SubmitFormButton
        disableDots
        className={cn({
          'flex w-full items-center justify-start gap-1.5 rounded-md px-1 transition-colors duration-100 ease-linear hover:bg-neutral-700':
            showIcon,
          'rounded-md bg-[#00ff00] px-2 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90':
            !showIcon,
        })}
      >
        {showIcon ? (
          <Icon className='h-4 w-4' id={isFollowing ? 'unfollowUser' : 'followUser'} />
        ) : null}
        {isFollowing ? 'Unfollow user' : 'Follow user'}
      </SubmitFormButton>
    </form>
  )
}
