import { Suspense } from 'react'

import { validateRequest } from '../../lib/lucia'

import PostData from './post-data'

import FormCreatePost from '@/components/form/form-create-post'
import LoaderRounded from '@/components/loader-rounded'

export default async function Home({
  searchParams,
}: {
  searchParams: {
    page: string
  }
}) {
  const page = Number(searchParams.page) || 1

  const { session } = await validateRequest()

  return (
    <main className='h-full w-full px-1 lg:pr-0'>
      <FormCreatePost session={session} />

      <section>
        <Suspense
          fallback={
            <div className='min-h-screen rounded-t-md border-x border-t border-neutral-800'>
              <LoaderRounded />
            </div>
          }
        >
          <PostData page={page} />
        </Suspense>
      </section>
    </main>
  )
}
