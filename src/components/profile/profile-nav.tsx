import Link from 'next/link'
import { headers } from 'next/headers'

import { auth } from '@/auth'
import { getFollowsCount } from '@/db/queries'

export default async function ProfileNav() {
  const session = await auth.api.getSession({ headers: await headers() })

  const { followingCount, followersCount } = await getFollowsCount({
    sessionUserId: session?.user.id,
  })

  return (
    <section className='flex items-center justify-between px-1 sm:px-1.5'>
      <section className='flex w-fit items-center gap-4'>
        <p className='flex items-center gap-1 text-neutral-400'>
          <span className='font-bold text-neutral-200'>{followingCount}</span>
          Following
        </p>
        <p className='flex items-center gap-1 text-neutral-400'>
          <span className='font-bold text-neutral-200'>{followersCount}</span>
          Followers
        </p>
      </section>
      <Link
        className='rounded-md bg-[#00b4f1] px-2 py-1 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90 sm:px-2.5 sm:py-1.5'
        href='/settings'
      >
        Edit profile
      </Link>
    </section>
  )
}
