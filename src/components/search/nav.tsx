'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { cn } from '@/utils/cn'

interface Props {
  values: Array<{
    href: string
    id: number
    text: string
  }>
}

export default function Nav({ values }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q')
  const filter = searchParams.get('f')

  return (
    <ul className='flex h-10 flex-wrap items-center justify-around border-b border-neutral-800 lg:rounded-br-md lg:border-r'>
      {values.map(value => (
        <li key={value.id}>
          <Link
            className={cn('p-1.5 text-neutral-300 sm:px-3', {
              'border-b-2 border-b-[#00b4f1] font-semibold text-neutral-200': filter === value.href,
            })}
            href={`${pathname}?q=${query}&f=${value.href}`}
          >
            {value.text}
          </Link>
        </li>
      ))}
    </ul>
  )
}
