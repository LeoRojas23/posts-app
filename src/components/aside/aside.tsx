import Link from 'next/link'

import Icon from '../icon'
import AuthButton from '../button/auth-button'
import { NavLink } from '../nav-link'

import { validateRequest } from '@/lib/lucia'

export default async function Aside() {
  const { user } = await validateRequest()

  const values = user
    ? [
        { href: '/', icon: 'asideHome', id: 0, text: 'Home' },
        { href: `/profile/${user.username}/likes`, icon: 'asideLikes', id: 1, text: 'Likes' },
        { href: `/profile/${user.username}/media`, icon: 'asideMedia', id: 2, text: 'Media' },
        {
          href: `/profile/${user.username}/replies`,
          icon: 'asideReplies',
          id: 3,
          text: 'Replies',
        },
        { href: `/profile/${user.username}`, icon: 'asideProfile', id: 4, text: 'Profile' },
      ]
    : null

  return (
    <aside className='sticky left-0 top-12 z-10 hidden border-r border-r-neutral-800 sm:flex sm:h-[calc(100vh-3rem)] sm:flex-col sm:justify-between'>
      {user ? (
        <>
          <ul className='flex h-fit flex-col items-center gap-4 lg:items-start'>
            {values?.map(value => (
              <li key={value.id} className='flex w-full items-center justify-center'>
                <NavLink
                  activeClassName='[&>svg]:text-[#00ff00] [&>p]:text-neutral-200 [&>p]:font-semibold'
                  className='flex w-fit rounded-md p-2 text-neutral-300 hover:bg-neutral-700 lg:w-full lg:justify-start lg:gap-4 lg:pl-1'
                  href={value.href}
                  match={value.text === 'Profile' ? '^/profile' : undefined}
                >
                  <Icon className='h-6 w-6' id={value.icon} />
                  <p className='hidden lg:flex lg:text-xl'>{value.text}</p>
                </NavLink>
              </li>
            ))}
          </ul>

          <footer className='relative flex h-fit w-full items-center justify-center lg:justify-start'>
            <details className='lg:w-full [&>summary]:open:bg-neutral-700' name='toggleLogout'>
              <summary className='cursor-pointer list-none rounded-md px-1 py-1.5 transition-colors duration-100 ease-linear hover:bg-neutral-700 lg:flex lg:items-center lg:justify-between lg:gap-2'>
                <img
                  alt={user.name}
                  className='h-10 w-10 rounded-md lg:h-10 lg:w-10'
                  src={user.image}
                />
                <div className='hidden lg:flex lg:flex-1 lg:flex-col'>
                  <h2 className='max-w-[140px] truncate text-[15px] font-bold text-neutral-200'>
                    {user.name}
                  </h2>
                  <h3 className='text-sm text-neutral-400'>@{user.username}</h3>
                </div>
                <Icon className='hidden h-4 w-4 text-neutral-200 lg:flex' id='asideUserLogout' />
              </summary>
              <AuthButton
                action='signOut'
                className='absolute inset-x-0 bottom-[50px] w-full rounded-md bg-[#00ff00] py-1 text-sm font-bold text-[#0d0d0d] transition-opacity duration-100 ease-linear hover:opacity-90 lg:bottom-[56px] lg:text-base'
              >
                Logout
              </AuthButton>
            </details>
          </footer>
        </>
      ) : (
        <section className='mt-2 flex'>
          <Link
            className='mx-auto flex items-center justify-start rounded-md bg-[#00ff00] px-2 py-2 font-semibold text-[#0d0d0d]'
            href='/sign-in'
          >
            Sign in
          </Link>
        </section>
      )}
    </aside>
  )
}