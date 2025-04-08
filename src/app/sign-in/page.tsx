'use cache'

import AuthButton from '@/components/button/auth-button'
import Icon from '@/components/icon'

export async function generateMetadata() {
  return {
    title: 'Posts - Sign in',
    description: 'Sign in with google or github for Posts',
  }
}

export default async function SignInPage() {
  return (
    <main className='my-auto flex h-[calc(100vh-3rem)] w-full items-center justify-center'>
      <section className='flex w-80 flex-col gap-2 rounded-md border border-[#04344d] bg-[#111111] px-10 py-12 text-neutral-200'>
        <div className='flex items-center justify-center gap-1'>
          <Icon className='h-6 w-6 text-neutral-200' id='navIcon' />
          <h1 className='text-xl font-bold'>Posts</h1>
        </div>
        <h2 className='mx-auto text-lg font-semibold text-neutral-300'>Sign in</h2>
        <div className='flex flex-col justify-center gap-2 pt-4'>
          <AuthButton
            action='signIn'
            className='w-full rounded-md bg-[#fffdfd] font-semibold text-[#0d0d0d]'
            provider='google'
          >
            <div className='flex w-full gap-2 px-3 py-2'>
              <Icon className='h-6 w-6' id='googleIcon' />
              Google
            </div>
          </AuthButton>

          <AuthButton
            action='signIn'
            className='w-full rounded-md bg-[#fffdfd] font-semibold text-[#0d0d0d]'
            provider='github'
          >
            <div className='flex w-full gap-2 px-3 py-2'>
              <Icon className='h-6 w-6' id='githubIcon' />
              Github
            </div>
          </AuthButton>
        </div>
      </section>
    </main>
  )
}
