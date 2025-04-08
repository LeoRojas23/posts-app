import Link from 'next/link'
import { Suspense } from 'react'
import { headers } from 'next/headers'

import ToggleFollowUser from '../follow/toggle-follow-user'

import Pagination from '@/components/pagination'
import { getSearchUsers } from '@/db/queries'
import { auth } from '@/auth'

interface Props {
  query: string
  filter: string
  page?: number
}

export default async function Users({ query, filter, page }: Props) {
  const { users: usersData, totalUsers, totalPages } = await getSearchUsers({ query, filter, page })

  if (!usersData.length && page && page > 1)
    return (
      <>
        <p className='text-center text-sm text-neutral-400'>
          There are no more users matching &apos;{query}&apos;
        </p>
        <Pagination totalPages={totalPages} />
      </>
    )

  if (!usersData.length)
    return (
      <p className='text-center text-sm text-neutral-400'>
        No users matching &apos;{query}&apos; were found.
      </p>
    )

  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <section className='flex w-full flex-col'>
      {filter === 'all' && (
        <span className='pt-1 text-sm text-neutral-400'>
          <b>{totalUsers}</b> user{totalUsers > 1 ? 's' : ''} found
        </span>
      )}
      <ul className='flex flex-col'>
        {usersData.map(user => {
          return (
            <li
              key={user.id}
              className='flex items-center justify-start gap-2 border-x border-b border-neutral-800 px-1 py-2 last:rounded-b-md first-of-type:rounded-t-md first-of-type:border-t'
            >
              <aside>
                <Link href={`/profile/${user.username}`}>
                  <img
                    alt={user.username ?? 'Profile image'}
                    className='h-10 w-10 rounded-md transition-opacity duration-100 ease-linear hover:opacity-70'
                    src={user.image ?? ''}
                  />
                </Link>
              </aside>
              <div className='flex w-full flex-1 items-center justify-between'>
                <div className='flex flex-col'>
                  <Link className='w-fit' href={`/profile/${user.username}`}>
                    <h2 className='text-[15px] font-bold text-neutral-200 underline-offset-[3px] hover:underline'>
                      {user.name}
                    </h2>
                  </Link>

                  <Link className='w-fit' href={`/profile/${user.username}`}>
                    <h3 className='text-sm text-neutral-400 underline-offset-[3px] hover:underline'>
                      @{user.username}
                    </h3>
                  </Link>
                </div>
                <aside>
                  {session?.user.username === user.username ? (
                    <Link
                      className='rounded-md bg-[#00b4f1] px-2 py-1 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90 sm:px-2.5 sm:py-1.5'
                      href='/settings'
                    >
                      Edit profile
                    </Link>
                  ) : (
                    <ToggleFollowUser
                      sessionUserId={session?.user.id}
                      showIcon={false}
                      userToFollow={user.id}
                    />
                  )}
                </aside>
              </div>
            </li>
          )
        })}
      </ul>
      {page ? (
        <Suspense>
          <Pagination totalPages={totalPages} />
        </Suspense>
      ) : (
        totalUsers > 3 &&
        usersData.length !== totalUsers && (
          <Link
            className='my-1 px-1 py-1 text-blue-400 transition-colors duration-100 ease-linear hover:bg-neutral-800'
            href={`?q=${query}&f=users`}
          >
            See more users
          </Link>
        )
      )}
    </section>
  )
}
