import SubmitFormButton from './submit-form-button'

import { signIn, signOut } from '@/auth'

interface Props {
  className: string
  children: React.ReactNode
  action: 'signOut' | 'signIn'
  provider?: 'google' | 'github'
}

export default function AuthButton({ className, children, action, provider }: Props) {
  async function formAction() {
    'use server'

    if (action === 'signOut') {
      await signOut({ redirectTo: '/' })
    } else if (provider === 'google' && action === 'signIn') {
      await signIn('google', { redirectTo: '/' })
    } else if (provider === 'github' && action === 'signIn') {
      await signIn('github', { redirectTo: '/' })
    }
  }

  return (
    <form action={formAction} className='w-full'>
      <SubmitFormButton className={className}>{children}</SubmitFormButton>
    </form>
  )
}
