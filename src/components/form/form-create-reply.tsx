'use client'

import { useFormStatus } from 'react-dom'

import Icon from '../icon'

import { cn } from '@/utils/cn'

interface Props {
  name: string
  fromPostView: boolean
  fromPostId: boolean
  textareaId?: string
  payload?: string
}

export default function FormCreateReply({
  name,
  fromPostView,
  fromPostId,
  textareaId,
  payload,
}: Props) {
  const { pending } = useFormStatus()

  return (
    <>
      <label className='sr-only' htmlFor={textareaId ?? 'replyTextarea'}>
        Write your comment
      </label>
      <textarea
        autoComplete='off'
        className={cn(
          'w-full resize-none rounded-md border border-neutral-800 bg-transparent px-1 py-2 text-sm text-neutral-200 outline-hidden transition-colors duration-100 ease-linear sm:text-base',
          {
            'ml-1': fromPostView,
            'border-neutral-500': pending,
            'h-20 border-transparent focus:border-neutral-800': fromPostId,
          },
        )}
        defaultValue={payload}
        id={textareaId ?? 'replyTextarea'}
        name={name}
        placeholder='Write a comment'
        onKeyDown={e => {
          if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key === 'NumpadEnter')) {
            e.preventDefault()
            e.currentTarget.form?.requestSubmit()
          }
        }}
      />
      <button
        className={cn(
          'rounded-md border border-neutral-800 p-1.5 text-neutral-200 transition-colors duration-100 ease-linear hover:border-neutral-500',
          {
            'border-neutral-500': pending,
          },
        )}
        type='submit'
      >
        {fromPostId ? 'Send' : <Icon className='h-4 w-4' id='submitComment' />}
      </button>
    </>
  )
}
