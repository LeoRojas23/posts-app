'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import Icon from './icon'

import { cn } from '@/utils/cn'

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)

    params.set('page', pageNumber.toString())

    return `${pathname}?${params.toString()}`
  }

  return (
    <nav className='my-4 flex w-full items-center justify-center gap-10'>
      <Link
        className={cn(
          'rounded-md border border-[#00b4f1] px-2 py-1 font-semibold text-neutral-200',
          {
            'pointer-events-none opacity-40': currentPage - 1 === 0,
          },
        )}
        href={createPageUrl(currentPage - 1)}
      >
        <Icon className='size-6 text-neutral-200' id='left' />
      </Link>
      <Link
        className={cn(
          'rounded-md border border-[#00b4f1] px-2 py-1 font-semibold text-neutral-200',
          {
            'pointer-events-none opacity-40': currentPage >= totalPages,
          },
        )}
        href={createPageUrl(currentPage + 1)}
      >
        <Icon className='size-6 text-neutral-200' id='right' />
      </Link>
    </nav>
  )
}
