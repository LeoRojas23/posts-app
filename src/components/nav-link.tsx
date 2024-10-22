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
}

export function NavLink({ children, className, activeClassName, href, match }: Props) {
  const pathname = usePathname()

  const isActive = match ? pathname.match(match) : pathname === href

  return (
    <Link className={cn(className, isActive && activeClassName)} href={href}>
      {children}
    </Link>
  )
}
