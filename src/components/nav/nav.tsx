import Link from 'next/link'
import { Suspense } from 'react'
import { headers } from 'next/headers'

import Icon from '../icon'
import AuthButton from '../button/auth-button'

import Search from './search'
import MobileMenu from './mobile-menu'

import { getUserInfo, getFollowsCount } from '@/db/queries'
import { auth } from '@/auth'

export default async function Nav() {
  const session = await auth.api.getSession({ headers: await headers() })

  const values = session?.user
    ? [
        { href: '/', id: 0, text: 'Home' },
        { href: `/profile/${session.user.username}/likes/posts`, id: 1, text: 'Likes' },
        { href: `/profile/${session.user.username}/media`, id: 2, text: 'Media' },
        { href: `/profile/${session.user.username}/replies`, id: 3, text: 'Replies' },
        { href: `/profile/${session.user.username}`, id: 4, text: 'Profile' },
      ]
    : null

  const userInfo = session?.user ? await getUserInfo({ slug: session.user.username }) : null

  const { followingCount, followersCount } = await getFollowsCount({
    sessionUserId: session?.user.id,
  })

  return (
    <header className='sticky left-0 top-0 z-10 h-12 w-full border-b border-b-neutral-800 bg-[#0a0a0a] bg-opacity-[0.99]'>
      <ul className='grid h-full w-full grid-cols-3 place-content-center place-items-start sm:grid-cols-2'>
        <Suspense>
          <MobileMenu
            followersCount={followersCount}
            followingCount={followingCount}
            session={session?.user.id}
            userInfo={userInfo}
            values={values}
          >
            <AuthButton
              action='signOut'
              className='w-16 rounded-md bg-[#00b4f1] p-1 font-bold text-[#0d0d0d]'
            >
              Logout
            </AuthButton>
          </MobileMenu>
        </Suspense>

        <li className='flex h-full w-full items-center justify-center sm:w-[80px] lg:justify-start'>
          <Link aria-label='app-icon' href='/'>
            <Icon className='h-8 w-8 text-neutral-200' id='navIcon' />
          </Link>
        </li>

        <li className='hidden sm:flex sm:h-full sm:w-full sm:items-center sm:justify-end sm:px-1 lg:px-0'>
          <Suspense>
            <Search />
          </Suspense>
        </li>
      </ul>
    </header>
  )
}
