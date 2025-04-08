'use client'

import { useActionState } from 'react'
import { toast } from 'sonner'

import FormCreateReply from '../form/form-create-reply'

import { createComment } from '@/actions/actions'
import { cn } from '@/utils/cn'
import { CreateCommentResponse } from '@/types'

interface Props {
  postId: string
  roundedBottom: number | undefined
}

const initialState: CreateCommentResponse = {
  success: false,
  message: '',
}

export default function CreateReplyPostId({ postId, roundedBottom }: Props) {
  const [state, formAction] = useActionState(
    async (status: CreateCommentResponse, formData: FormData) => {
      const result = await createComment({ formData, postId })

      if (!result.success) {
        toast.error(result.message)

        return result
      }

      return result
    },
    initialState,
  )

  return (
    <form
      action={formAction}
      className={cn('flex items-center gap-1.5 border-y border-y-neutral-800 p-1 md:p-1.5', {
        'lg:rounded-br-md': !roundedBottom,
      })}
    >
      <FormCreateReply
        fromPostId
        fromPostView={false}
        name='commentPostFromId'
        payload={state.payload}
        textareaId='focusTextarea'
      />
    </form>
  )
}
