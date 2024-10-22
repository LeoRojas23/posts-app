'use client'

import { useOptimistic, useRef } from 'react'
import { toast } from 'sonner'

import Icon from '../icon'
import FormCreateReply from '../form/form-create-reply'

import { type SessionAuth } from '@/types'
import { regexComment } from '@/utils/utils'
import { createComment } from '@/actions/actions'

interface Props {
  postId: string
  commentsLength: number
  path: string
  session: SessionAuth | null
}

export default function CreateReplyPost({ postId, commentsLength, path, session }: Props) {
  const ref = useRef<HTMLFormElement>(null)

  const [optimisticCommentsLength, addOptimisticCommentsLength] = useOptimistic(
    commentsLength,
    (currentComments, newComment: string) => {
      if (regexComment.test(newComment)) {
        return currentComments + 1
      }

      return currentComments
    },
  )

  const formAction = async (formData: FormData) => {
    if (!session) {
      toast.error('Authentication required.')

      return
    }

    const text = formData.get('postComment') as string

    ref.current?.reset()
    addOptimisticCommentsLength(text)
    const result = await createComment(formData, postId, path)

    if (result?.error) {
      toast.error(result.error)

      return
    }
  }

  return (
    <form ref={ref} action={formAction} className='w-full'>
      <details
        className='flex w-full items-center justify-center [&>summary>svg]:open:text-[#00ff00]'
        name='postDetails'
      >
        <summary className='group/reply-svg-post mx-auto flex w-fit cursor-pointer list-none items-center justify-start gap-1.5 py-1.5'>
          <Icon
            className='h-6 w-6 text-neutral-200 transition-colors duration-100 ease-linear sm:group-hover/reply-svg-post:text-[#00ff00]'
            id='commentIcon'
          />
          <span className='text-sm font-light tabular-nums text-neutral-200 sm:text-base'>
            {optimisticCommentsLength}
          </span>
        </summary>
        <div className='flex items-center justify-center gap-1'>
          <FormCreateReply fromPostView fromPostId={false} name='postComment' />
        </div>
      </details>
    </form>
  )
}
