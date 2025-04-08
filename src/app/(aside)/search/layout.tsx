import { Suspense } from 'react'

import Nav from '@/components/search/nav'

export default function Layout({ children }: { children: React.ReactNode }) {
  const values = [
    { href: 'all', id: 1, text: 'All' },
    { href: 'users', id: 2, text: 'Users' },
    { href: 'posts', id: 3, text: 'Posts' },
  ]

  return (
    <main className='flex flex-col gap-2'>
      <Suspense>
        <Nav values={values} />
      </Suspense>
      <div className='space-y-2 px-1 lg:pr-0'>{children}</div>
    </main>
  )
}
