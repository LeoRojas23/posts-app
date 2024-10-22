import { redirect } from 'next/navigation'

import ClientPage from './client-page'

import { validateRequest } from '@/lib/lucia'

export async function generateMetadata() {
  return {
    title: 'Edit profile',
    description: 'Edit profile of user',
  }
}

export default async function page() {
  const { user } = await validateRequest()

  if (!user) redirect('/')

  return (
    <main className='flex h-[calc(100vh-3rem)] w-full flex-col items-center px-1 sm:px-2 lg:pl-2'>
      <header className='mb-1 flex w-full items-center justify-center'>
        <h2 className='text-2xl font-semibold text-neutral-200'>Edit profile</h2>
      </header>
      <ClientPage session={user} />
    </main>
  )
}
