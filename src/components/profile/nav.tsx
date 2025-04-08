import { headers } from 'next/headers'

import ToggleFollowUserProfile from '../follow/toggle-follow-user-profile'
import { NavLink } from '../nav-link'

import ProfileNav from './profile-nav'

import { auth } from '@/auth'
import Image from '@/components/image'
import { getUserInfo } from '@/db/queries'

export default async function Nav({ slug }: { slug: string }) {
  const user = await auth.api.getSession({ headers: await headers() })

  const userData = await getUserInfo({ slug })

  const renderEditProfile = userData.id === user?.session.userId

  const values = [
    { href: `/profile/${slug}`, id: 1, text: 'Posts' },
    { href: `/profile/${slug}/replies`, id: 2, text: 'Replies' },
    { href: `/profile/${slug}/media`, id: 3, text: 'Media' },
    { href: `/profile/${slug}/likes/posts`, id: 4, text: 'Likes' },
  ]

  return (
    <div className='flex h-fit w-full flex-col gap-1 border-x border-neutral-800 sm:border-l-0'>
      <header className='flex flex-col items-start justify-center gap-2 px-1.5 pt-1.5'>
        <Image
          fromProfile
          alt={`Profile image of ${userData.username}`}
          className='h-28 w-28 rounded-md outline outline-neutral-800 sm:h-36 sm:w-36'
          srcImage={userData.image ?? ''}
        />
        <div className='flex flex-col items-start'>
          <h2 className='text-xl font-bold text-neutral-200'>{userData.name}</h2>
          <h3 className='text-lg text-neutral-400'>@{userData.username}</h3>
        </div>
      </header>
      {renderEditProfile ? (
        <ProfileNav />
      ) : (
        <ToggleFollowUserProfile sessionUserId={user?.session.userId} userToFollow={userData.id} />
      )}
      <ul className='flex w-full flex-wrap items-center justify-around border-b border-b-neutral-800 py-1'>
        {values.map(value => (
          <li key={value.id} className='flex'>
            <NavLink
              activeClassName='border-b-2 border-b-[#00b4f1] font-semibold text-neutral-200'
              className='p-1.5 text-neutral-300 sm:px-3'
              href={value.href}
              match={value.text === 'Likes' ? `^/profile/${userData.username}/likes` : undefined}
              sessionUsername={slug}
            >
              <span className='text-base'>{value.text}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
