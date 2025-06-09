'use client'

import { useActionState } from 'react'

import Icon from '../icon'
import FormButton from '../button/form-button'

import { clearImageData } from '@/actions/actions'

interface Props {
  onClick: () => void
}

export default function CancelImage({ onClick }: Props) {
  const [, formAction, formActionPending] = useActionState(async () => {
    onClick()

    return await clearImageData()
  }, null)

  return (
    <FormButton
      className='absolute top-1 left-1 cursor-pointer rounded-full bg-[#a50f0f] p-1 transition-opacity duration-100 ease-linear hover:opacity-80 sm:p-1.5'
      dotsColor='bg-[#fff1f1]'
      formAction={formAction}
      pending={formActionPending}
      type='submit'
    >
      <Icon className='h-5 w-5 text-[#fff1f1]' id='close' />
    </FormButton>
  )
}
