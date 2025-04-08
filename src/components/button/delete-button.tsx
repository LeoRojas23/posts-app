'use client'

import { useActionState } from 'react'

import Icon from '../icon'

import SubmitFormButton from './submit-form-button'

import { deleteData } from '@/actions/actions'

interface Props {
  dataId: string
  path: string
  from: 'post' | 'comment'
}

export default function DeleteButton({ dataId, path, from }: Props) {
  const [, formAction, pending] = useActionState(async () => {
    return await deleteData({ dataId, from, path })
  }, null)

  return (
    <form action={formAction} className='w-full'>
      <SubmitFormButton
        disableDots
        className='w-full rounded-md transition-colors duration-100 ease-linear hover:bg-[#3d3d3d50]'
        pending={pending}
      >
        <div className='flex w-full items-center gap-1 p-1'>
          <Icon className='h-4 w-4' id='deleteIcon' />
          Delete
        </div>
      </SubmitFormButton>
    </form>
  )
}
