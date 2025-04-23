'use client'

import { useActionState } from 'react'
import { toast } from 'sonner'

import Icon from '../icon'
import FormCreateReply from '../form/form-create-reply'

import { createComment } from '@/actions/actions'
import { CreateCommentResponse } from '@/types'

interface Props {
  parentId: string
  commentsLength: number
  postId: string
}

const initialState: CreateCommentResponse = {
  success: false,
  message: '',
}

export default function CreateReplyComment({ parentId, commentsLength, postId }: Props) {
  const [state, formAction] = useActionState(
    async (status: CreateCommentResponse, formData: FormData) => {
      const result = await createComment({ formData, postId, parentId })

      if (!result.success) {
        toast.error(result.message)

        return result
      }

      return result
    },
    initialState,
  )

  return (
    <details
      className='flex w-full flex-col justify-center open:[&>summary>svg]:text-[#00b4f1]'
      name='commentDetails'
    >
      <summary className='group/reply-svg-comment relative mx-auto flex w-fit cursor-pointer list-none items-center justify-start gap-1.5 py-1.5'>
        <Icon
          className='h-6 w-6 cursor-pointer text-neutral-200 transition-colors duration-100 ease-linear sm:group-hover/reply-svg-comment:text-[#00b4f1]'
          id='commentIcon'
        />
        <span className='text-sm font-light text-neutral-200 tabular-nums sm:text-base'>
          {commentsLength}
        </span>
      </summary>
      <form action={formAction} className='flex w-full items-center justify-center gap-1'>
        <FormCreateReply
          fromPostId={false}
          fromPostView={false}
          name='replyComment'
          payload={state.payload}
        />
      </form>
    </details>
  )
}
