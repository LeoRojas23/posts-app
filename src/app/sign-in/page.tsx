import AuthButton from '@/components/button/auth-button'
import Icon from '@/components/icon'

export async function generateMetadata() {
  return {
    title: 'Posts - Sign in',
    description: 'Sign in with google or github for Posts',
  }
}

export default function SignInPage() {
  return (
    <main className='my-auto flex h-[calc(100vh-3rem)] w-full items-center justify-center'>
      <section className='flex w-80 flex-col gap-2 rounded-md bg-[#111111] px-6 text-neutral-200'>
        <h1 className='flex items-center justify-center gap-2 pt-10 text-lg font-bold'>
          <Icon className='h-5 w-5 text-neutral-200' id='navIcon' />
          Posts
        </h1>
        <h2 className='mx-auto text-base font-semibold tracking-wide text-neutral-300'>Sign in</h2>
        <div className='flex flex-col justify-center gap-2 pb-10 sm:flex-row'>
          <AuthButton
            action='signIn'
            className='flex w-full items-center justify-center gap-2 rounded-md bg-[#fffdfd] px-2 font-semibold text-[#0d0d0d]'
            provider='google'
          >
            <Icon className='h-6 w-6' id='googleIcon' />
            Google
          </AuthButton>

          <AuthButton
            action='signIn'
            className='flex w-full items-center justify-center gap-2 rounded-md bg-[#fffdfd] px-2 font-semibold text-[#0d0d0d]'
            provider='github'
          >
            <Icon className='h-6 w-6' id='githubIcon' />
            Github
          </AuthButton>
        </div>
      </section>
    </main>
  )
}
