'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Icon from '../icon'

import { createUrl } from '@/utils/create-url'
import { cn } from '@/utils/cn'

export default function Search() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const router = useRouter()
  const filterParam = searchParams.get('f')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const val = e.target as HTMLFormElement
    const search = val.search as HTMLInputElement
    const newParams = new URLSearchParams(searchParams.toString())

    for (const [key] of searchParams.entries()) {
      if (key !== 'q' && key !== 'f') {
        newParams.delete(key)
      }
    }

    if (search.value) {
      newParams.set('q', search.value)
      if (!filterParam) newParams.set('f', 'all')
    } else {
      newParams.delete('q')
      router.push('/')

      return
    }

    router.push(createUrl('/search', newParams))
  }

  return (
    <form className='flex items-center justify-end' onSubmit={onSubmit}>
      <div className='relative w-full'>
        <label className='sr-only' htmlFor='searchInput'>
          Search posts or users
        </label>
        <button className='absolute top-2 right-0 pr-1 sm:top-2' type='submit'>
          <Icon className='h-5 w-5 text-neutral-300' id='searchIcon' />
        </button>
        <input
          autoComplete='off'
          className={cn(
            'h-9 w-full rounded-md border border-neutral-800 bg-transparent pr-[26px] pl-1 text-sm text-neutral-300 placeholder-neutral-400 outline-hidden transition-colors duration-100 ease-linear sm:w-64 sm:pr-7',
            {
              'border-[#00b4f1]': pathname === '/search',
              'focus:border-neutral-600': pathname !== '/search',
            },
          )}
          defaultValue={searchParams.get('q')?.toString()}
          id='searchInput'
          name='search'
          placeholder='Search posts or users'
          type='text'
        />
      </div>
    </form>
  )
}
