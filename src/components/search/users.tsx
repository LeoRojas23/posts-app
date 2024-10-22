import Link from 'next/link'

import ToggleFollowUser from '../follow/toggle-follow-user'

import Pagination from '@/components/pagination'
import { validateRequest } from '@/lib/lucia'
import { fetchSearchUsers } from '@/db/queries'

interface Props {
  query: string
  filter: string
  page?: number
}

export default async function Users({ query, filter, page }: Props) {
  const { users: usersData, totalUsers, totalPages } = await fetchSearchUsers(query, filter, page)

  if (!usersData.length)
    return (
      <p className='text-center text-sm text-neutral-400'>
        No users matching &apos;{query}&apos; found
      </p>
    )

  const { user: userSession } = await validateRequest()

  return (
    <section className='flex w-full flex-col'>
      {!filter && !filter?.length && (
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
                    alt={user.username}
                    className='h-10 w-10 rounded-md transition-opacity duration-100 ease-linear hover:opacity-70'
                    src={user.image}
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
                  {userSession?.username === user.username ? (
                    <Link
                      className='rounded-md bg-[#00ff00] px-2 py-1 font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90 sm:px-2.5 sm:py-1.5'
                      href='/settings'
                    >
                      Edit profile
                    </Link>
                  ) : (
                    <ToggleFollowUser
                      path={`/search?q=${query}`}
                      session={userSession}
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
        <Pagination totalPages={totalPages} />
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
