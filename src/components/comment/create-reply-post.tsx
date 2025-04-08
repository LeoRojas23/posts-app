'use client'

import { useActionState, useOptimistic } from 'react'
import { toast } from 'sonner'

import Icon from '../icon'
import FormCreateReply from '../form/form-create-reply'

import { regexComment } from '@/utils/utils'
import { createComment } from '@/actions/actions'
import { CreateCommentResponse } from '@/types'

interface Props {
  postId: string
  commentsLength: number
}

const initialState: CreateCommentResponse = {
  success: false,
  message: '',
}

export default function CreateReplyPost({ postId, commentsLength }: Props) {
  const [optimisticCommentsLength, addOptimisticCommentsLength] = useOptimistic(
    commentsLength,
    (currentComments, newComment: string) => {
      if (regexComment.test(newComment)) {
        return currentComments + 1
      }

      return currentComments
    },
  )

  const [state, formAction] = useActionState(
    async (status: CreateCommentResponse, formData: FormData) => {
      const text = formData.get('postComment') as string

      const result = await createComment({ formData, postId })

      if (!result.success) {
        toast.error(result.message)

        return result
      }

      addOptimisticCommentsLength(text)

      return result
    },
    initialState,
  )

  return (
    <details
      className='flex w-full flex-col justify-center [&>summary>svg]:open:text-[#00b4f1]'
      name='postDetails'
    >
      <summary className='group/reply-svg-post mx-auto flex w-fit cursor-pointer list-none items-center justify-start gap-1.5 py-1.5'>
        <Icon
          className='h-6 w-6 text-neutral-200 transition-colors duration-100 ease-linear sm:group-hover/reply-svg-post:text-[#00b4f1]'
          id='commentIcon'
        />
        <span className='text-sm font-light tabular-nums text-neutral-200 sm:text-base'>
          {optimisticCommentsLength}
        </span>
      </summary>
      <form action={formAction} className='flex w-full items-center justify-center gap-1'>
        <FormCreateReply
          fromPostView
          fromPostId={false}
          name='postComment'
          payload={state.payload}
        />
      </form>
    </details>
  )
}
