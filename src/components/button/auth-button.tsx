'use client'

import { useActionState } from 'react'

import SubmitFormButton from './submit-form-button'

import { manageAuth } from '@/actions/actions'

interface Props {
  className: string
  children: React.ReactNode
  action: 'signOut' | 'signIn'
  provider?: 'google' | 'github'
}

export default function AuthButton({ className, children, action, provider }: Props) {
  const [, formAction, pending] = useActionState(async () => {
    await manageAuth({ action, provider })
  }, null)

  return (
    <form action={formAction}>
      <SubmitFormButton className={className} pending={pending}>
        {children}
      </SubmitFormButton>
    </form>
  )
}
