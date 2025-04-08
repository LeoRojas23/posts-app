import { headers } from 'next/headers'

import { auth } from '@/auth'
import FormUpdateSettings from '@/components/form/form-update-settings'

export async function generateMetadata() {
  return {
    title: 'Edit profile',
    description: 'Edit profile of user',
  }
}

export default async function Page() {
  const user = await auth.api.getSession({ headers: await headers() })

  return (
    <main className='flex h-[calc(100vh-3rem)] w-full flex-col items-center px-1 sm:px-2 lg:pl-2'>
      <header className='mb-1 flex w-full items-center justify-center'>
        <h2 className='text-2xl font-semibold text-neutral-200'>Edit profile</h2>
      </header>
      <FormUpdateSettings sessionName={user!.user.name} sessionUsername={user!.user.username} />
    </main>
  )
}
