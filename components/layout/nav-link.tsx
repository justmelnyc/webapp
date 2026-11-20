'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface NavLinkProps {
  href: string
  children: ReactNode
  /** Treat sub-paths as active too (e.g. /discover/art under /discover). */
  matchPrefix?: string
}

export const NavLink = ({ href, children, matchPrefix }: NavLinkProps) => {
  const pathname = usePathname()
  const active = matchPrefix ? pathname.startsWith(matchPrefix) : pathname === href
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn('border-b-2 pb-0.5 text-sm', active ? 'border-black text-black' : 'text-g99 hover:text-black border-transparent')}
    >
      {children}
    </Link>
  )
}
