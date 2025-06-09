'use client'

import { useActionState } from 'react'

import FormButton from './form-button'

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
      <FormButton className={className} pending={pending}>
        {children}
      </FormButton>
    </form>
  )
}
