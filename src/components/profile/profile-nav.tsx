import { count, eq } from 'drizzle-orm'
import Link from 'next/link'

import { db } from '@/db'
import { followTable } from '@/db/schema'
import { validateRequest } from '@/lib/lucia'

export default async function ProfileNav() {
  const { user } = await validateRequest()

  const [followingCount, followersCount] = await Promise.all([
    db
      .select({
        count: count(),
      })
      .from(followTable)
      .where(eq(followTable.followerId, user!.id))
      .then(res => res[0].count),
    db
      .select({
        count: count(followTable.followerId),
      })
      .from(followTable)
      .where(eq(followTable.followingId, user!.id))
      .then(res => res[0].count),
  ])

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
