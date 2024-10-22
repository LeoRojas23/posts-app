'use client'

import { useParams } from 'next/navigation'

export default function NotFound() {
  const params = useParams()

  return (
    <section className='flex h-full w-full flex-col gap-1'>
      <header className='flex flex-col gap-2 px-1 sm:px-1.5'>
        <div className='h-28 w-28 rounded-full bg-neutral-800 sm:h-[138px] sm:w-[138px]' />
        <h1 className='text-lg font-bold text-neutral-200'>@{params.slug}</h1>
      </header>
      <p className='mt-20 text-center text-3xl font-bold text-neutral-200 sm:text-4xl'>
        User not found
      </p>
    </section>
  )
}
