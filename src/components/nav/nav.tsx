import Link from 'next/link'
import { Suspense } from 'react'
import { count, eq } from 'drizzle-orm'

import Icon from '../icon'
import AuthButton from '../button/auth-button'
import { validateRequest } from '../../lib/lucia'

import Search from './search'
import MobileMenu from './mobile-menu'

import { db } from '@/db'
import { followTable } from '@/db/schema'
import { fetchUserInfo } from '@/db/queries'

export default async function Nav() {
  const { user } = await validateRequest()

  const values = user
    ? [
        { href: '/', id: 0, text: 'Home' },
        { href: `/profile/${user.username}/likes`, id: 1, text: 'Likes' },
        { href: `/profile/${user.username}/media`, id: 2, text: 'Media' },
        { href: `/profile/${user.username}/replies`, id: 3, text: 'Replies' },
        { href: `/profile/${user.username}`, id: 4, text: 'Profile' },
      ]
    : null

  const userInfo = user ? await fetchUserInfo(user.username) : null

  const [followingCount, followersCount] = await Promise.all([
    db
      .select({
        count: count(followTable.followingId),
      })
      .from(followTable)
      .where(user ? eq(followTable.followerId, user.id) : undefined)
      .then(res => res[0].count),
    db
      .select({
        count: count(followTable.followerId),
      })
      .from(followTable)
      .where(user ? eq(followTable.followerId, user.id) : undefined)
      .then(res => res[0].count),
  ])

  return (
    <header className='sticky left-0 top-0 z-10 h-12 w-full border-b border-b-neutral-800 bg-[#0a0a0a] bg-opacity-[0.99]'>
      <ul className='grid h-full w-full grid-cols-3 place-content-center place-items-start sm:grid-cols-2'>
        <Suspense>
          <MobileMenu
            followersCount={followersCount}
            followingCount={followingCount}
            user={user}
            userInfo={userInfo}
            values={values}
          >
            <AuthButton
              action='signOut'
              className='w-16 rounded-md bg-[#00ff00] px-1 py-1 font-bold text-[#0d0d0d]'
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
