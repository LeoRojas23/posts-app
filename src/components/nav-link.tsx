'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/utils/cn'

interface Props {
  children: React.ReactNode
  className: string
  activeClassName: string
  href: string
  match?: string
  sessionUsername?: string
}

export function NavLink({
  children,
  className,
  activeClassName,
  href,
  match,
  sessionUsername,
}: Props) {
  const pathname = usePathname()

  const isActive =
    href === '/'
      ? pathname === '/'
      : match
        ? new RegExp(match).test(pathname)
        : pathname === href &&
          sessionUsername &&
          pathname.startsWith(`/profile/${sessionUsername}`) &&
          pathname.startsWith(href)

  return (
    <Link className={cn(className, isActive && activeClassName)} href={href}>
      {children}
    </Link>
  )
}
