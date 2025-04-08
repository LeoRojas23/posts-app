'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'

import Icon from '../icon'

import Search from './search'

import { type UserInfoLayout } from '@/types'

interface Props {
  session: string | undefined
  values: Array<{
    href: string
    id: number
    text: string
  }> | null
  userInfo: UserInfoLayout | null
  followingCount: number
  followersCount: number
  children: React.ReactNode
}

export default function MobileMenu({
  session,
  values,
  userInfo,
  followingCount,
  followersCount,
  children,
}: Props) {
  const [toggle, setToggle] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setToggle(false)
      }
    }

    if (!toggle) {
      document.body.classList.remove('overflow-hidden')
    } else {
      document.body.classList.add('overflow-hidden')
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [toggle])

  useEffect(() => {
    setToggle(false)
  }, [pathname, searchParams])

  return (
    <li className='relative flex h-full items-center sm:hidden'>
      <Icon
        className='h-6 w-6 cursor-pointer text-neutral-200'
        id={toggle ? 'closeMenu' : 'openMenu'}
        onClick={() => {
          setToggle(val => !val)
        }}
      />

      <ul className='absolute left-0 top-10 z-20 w-screen bg-[#0a0a0a]'>
        {toggle ? (
          <>
            <li className='px-0.5 pt-1.5'>
              <Suspense>
                <Search />
              </Suspense>
            </li>

            {session ? (
              <>
                <li className='flex items-center border-b border-b-neutral-800'>
                  <Link
                    className='flex w-full flex-col gap-3 py-2 pl-0.5'
                    href={`/profile/${userInfo!.username}`}
                  >
                    <header>
                      <img
                        alt={userInfo?.name ?? 'Profile image'}
                        className='h-10 w-10 rounded-md'
                        src={userInfo?.image ?? ''}
                      />
                      <h2 className='max-w-52 truncate text-[15px] font-bold text-neutral-200'>
                        {userInfo!.name}
                      </h2>
                      <h3 className='text-sm text-neutral-400'>@{userInfo!.username}</h3>
                    </header>
                    <footer className='flex items-center justify-start gap-2'>
                      <p className='flex items-center gap-1 text-[15px] font-light text-neutral-400'>
                        <span className='text-neutral-200'>{followingCount}</span>
                        Following
                      </p>
                      <p className='flex items-center gap-1 text-[15px] font-light text-neutral-400'>
                        <span className='text-neutral-200'>{followersCount}</span>
                        Followers
                      </p>
                    </footer>
                  </Link>
                  <div className='pr-0.5'>{children}</div>
                </li>

                {values?.map(value => (
                  <li key={value.id} className='flex w-full flex-col text-neutral-200'>
                    <Link
                      className='border-b border-b-neutral-800 px-0.5 py-2 pl-1'
                      href={value.href}
                    >
                      {value.text}
                    </Link>
                  </li>
                ))}
              </>
            ) : (
              <li className='flex h-fit w-full items-center justify-center border-b border-b-neutral-800 py-4'>
                <Link
                  className='rounded-md bg-[#00b4f1] px-2 py-2 font-semibold text-[#0d0d0d]'
                  href='/sign-in'
                >
                  Sign in
                </Link>
              </li>
            )}
          </>
        ) : null}
      </ul>
    </li>
  )
}
