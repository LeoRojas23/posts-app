'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

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
    <section className='my-4 flex w-full items-center justify-center gap-10'>
      <Link
        className={cn('rounded-md bg-[#00ff00] px-2 py-1 font-semibold text-[#0d0d0d]', {
          'pointer-events-none opacity-40': currentPage - 1 === 0,
        })}
        href={createPageUrl(currentPage - 1)}
      >
        Prev
      </Link>
      <Link
        className={cn('rounded-md bg-[#00ff00] px-2 py-1 font-semibold text-[#0d0d0d]', {
          'pointer-events-none opacity-40': currentPage >= totalPages,
        })}
        href={createPageUrl(currentPage + 1)}
      >
        Next
      </Link>
    </section>
  )
}
