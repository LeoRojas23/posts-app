import { Suspense } from 'react'

import LoaderRounded from '@/components/loader-rounded'
import Posts from '@/components/search/posts'
import Users from '@/components/search/users'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams

  return {
    title: `${q} - Search`,
    description: `${q} - Search results`,
  }
}

interface Props {
  searchParams: Promise<{
    q: string
    f: string
    page: string
  }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { f, q, page } = await searchParams

  const pageNumber = Number(page) || 1

  if (f === 'users') {
    return <Users filter={f} page={pageNumber} query={q} />
  }

  if (f === 'posts') {
    return <Posts filter={f} page={pageNumber} query={q} />
  }

  return (
    <Suspense fallback={<LoaderRounded />}>
      <Users filter={f} query={q} />
      <Posts filter={f} query={q} />
    </Suspense>
  )
}
