import { NavLink } from '@/components/nav-link'

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const values = [
    { href: `/profile/${slug}/likes/posts`, id: 1, text: 'Posts' },
    { href: `/profile/${slug}/likes/comments`, id: 2, text: 'Comments' },
  ]

  return (
    <>
      <ul className='flex w-full flex-wrap items-center justify-end gap-2 border-x border-b border-neutral-800 py-1 text-neutral-200 sm:border-l-0'>
        {values.map(value => (
          <li key={value.id} className='flex'>
            <NavLink
              activeClassName='border-b-2 border-b-[#00b4f1] font-semibold text-neutral-200'
              className='p-1.5 text-neutral-300 sm:px-3'
              href={value.href}
              match={`^${value.href}`}
              sessionUsername={slug}
            >
              <span className='text-base'>{value.text}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {children}
    </>
  )
}
