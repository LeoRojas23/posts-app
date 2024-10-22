'use client'

import { useFormState } from 'react-dom'

import Icon from '../icon'

import SubmitFormButton from './submit-form-button'

import { deleteData } from '@/actions/actions'

interface Props {
  dataId: string
  path: string
  from: 'post' | 'comment'
}

export default function DeleteButton({ dataId, path, from }: Props) {
  const deleteDataTransformed = deleteData.bind(null, dataId, from, path)

  const [, formAction] = useFormState(deleteDataTransformed, null)

  return (
    <form action={formAction} className='w-full'>
      <SubmitFormButton
        disableDots
        className='flex w-full items-center justify-start gap-1.5 rounded-md px-1 transition-colors duration-100 ease-linear hover:bg-neutral-700'
      >
        <Icon className='h-4 w-4' id='deleteIcon' />
        Delete
      </SubmitFormButton>
    </form>
  )
}
