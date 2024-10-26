'use client'

import { useRef } from 'react'
import { toast } from 'sonner'

import Icon from '../icon'
import FormCreateReply from '../form/form-create-reply'

import { createComment } from '@/actions/actions'
import { type SessionAuth } from '@/types'

interface Props {
  parentId: string
  commentsLength: number
  postId: string
  path: string
  session: SessionAuth | null
}

export default function CreateReplyComment({
  parentId,
  commentsLength,
  postId,
  path,
  session,
}: Props) {
  const ref = useRef<HTMLFormElement>(null)

  const formAction = async (formData: FormData) => {
    if (!session) {
      toast.error('Authentication required.')

      return
    }

    ref.current?.reset()
    const result = await createComment(formData, postId, path, parentId)

    if (result?.error) {
      toast.error(result.error)

      return
    }
  }

  return (
    <form ref={ref} action={formAction} className='w-full'>
      <details
        className='flex w-full items-center justify-center [&>summary>svg]:open:text-[#00b4f1]'
        name='commentDetails'
      >
        <summary className='group/reply-svg-comment relative mx-auto flex w-fit cursor-pointer list-none items-center justify-start gap-1.5 py-1.5'>
          <Icon
            className='h-6 w-6 cursor-pointer text-neutral-200 transition-colors duration-100 ease-linear sm:group-hover/reply-svg-comment:text-[#00b4f1]'
            id='commentIcon'
          />
          <span className='text-sm font-light tabular-nums text-neutral-200 sm:text-base'>
            {commentsLength}
          </span>
        </summary>
        <div className='flex items-center justify-center gap-1'>
          <FormCreateReply fromPostId={false} fromPostView={false} name='replyComment' />
        </div>
      </details>
    </form>
  )
}
