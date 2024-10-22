import { Suspense } from 'react'

import LoaderRounded from '@/components/loader-rounded'
import Posts from '@/components/search/posts'
import Users from '@/components/search/users'

export async function generateMetadata({ searchParams }: { searchParams: { q: string } }) {
  return {
    title: `${searchParams.q} - Search`,
    description: `${searchParams.q} - Search results`,
  }
}

interface Props {
  searchParams: {
    q: string
    f: string
    page: string
  }
}

export default function SearchPage({ searchParams }: Props) {
  const { q, f } = searchParams

  const page = Number(searchParams.page) || 1

  if (f === 'users') {
    return <Users filter={f} page={page} query={q} />
  }

  if (f === 'posts') {
    return <Posts filter={f} page={page} query={q} />
  }

  return (
    <Suspense fallback={<LoaderRounded />}>
      <Users filter={f} query={q} />
      <Posts filter={f} query={q} />
    </Suspense>
  )
}
