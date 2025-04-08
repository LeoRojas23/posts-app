'use client'

import Icon from '../icon'
import ToggleLike from '../like/toggle-like'

interface Props {
  commentLikes: Array<{ userId: string }>
  commentId: string
  commentCount: number
  sessionUserId: string | undefined
}

export default function FooterReply({
  commentLikes,
  commentId,
  commentCount,
  sessionUserId,
}: Props) {
  return (
    <section className='grid h-full grid-cols-2 place-items-center py-1'>
      <div className='mx-auto flex w-fit list-none items-center justify-start gap-1.5'>
        <Icon className='h-6 w-6 text-neutral-200' id='commentIcon' />
        <span className='text-sm font-light tabular-nums text-neutral-200 sm:text-base'>
          {commentCount}
        </span>
      </div>
      <div
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <ToggleLike
          dataId={commentId}
          from='comment'
          likesData={commentLikes}
          sessionUserId={sessionUserId}
        />
      </div>
    </section>
  )
}
