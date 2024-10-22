import { redirect } from 'next/navigation'

import {
  createGithubAuthorizationURL,
  createGoogleAuthorizationURL,
  signOut,
} from '../../actions/actions'

import SubmitFormButton from './submit-form-button'

interface Props {
  className: string
  children: React.ReactNode
  action: 'signOut' | 'signIn'
  provider?: 'google' | 'github'
}

export default function AuthButton({ className, children, action, provider }: Props) {
  async function formAction() {
    'use server'
    let res

    if (action === 'signOut') {
      res = await signOut()
    } else if (provider === 'google' && action === 'signIn') {
      res = await createGoogleAuthorizationURL()
    } else if (provider === 'github' && action === 'signIn') {
      res = await createGithubAuthorizationURL()
    }

    if (res?.error) {
      console.log(res.error)
    } else if (res?.success && 'data' in res && res.data) {
      redirect(res.data.toString())
    } else {
      redirect('/')
    }
  }

  return (
    <form action={formAction} className='w-full'>
      <SubmitFormButton className={className}>{children}</SubmitFormButton>
    </form>
  )
}
