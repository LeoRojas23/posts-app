'use client'

import { useRef } from 'react'
import { toast } from 'sonner'

import FormCreateReply from '../form/form-create-reply'

import { createComment } from '@/actions/actions'
import { cn } from '@/utils/cn'
import { type SessionAuth } from '@/types'

interface Props {
  path: string
  postId: string
  session: SessionAuth | null
  roundedBottom: number | undefined
}

export default function CreateReplyPostId({ path, postId, session, roundedBottom }: Props) {
  const ref = useRef<HTMLFormElement>(null)

  const formAction = async (formData: FormData) => {
    if (!session) {
      toast.error('Authentication required.')

      return
    }

    ref.current?.reset()
    const result = await createComment(formData, postId, path)

    if (result?.error) {
      toast.error(result.error)

      return
    }
  }

  return (
    <form
      ref={ref}
      action={formAction}
      className={cn(
        'flex items-center justify-center gap-1.5 border-y border-y-neutral-800 p-1 md:p-1.5',
        {
          'lg:rounded-br-md': !roundedBottom,
        },
      )}
    >
      <FormCreateReply
        fromPostId
        fromPostView={false}
        name='commentPostFromId'
        textareaId='focusTextarea'
      />
    </form>
  )
}
