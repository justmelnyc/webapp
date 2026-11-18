'use client'

import Link from 'next/link'
import { useEffect, type MouseEvent } from 'react'
import { XIconLG } from '@/components/icons'
import { useProfileRolesStore } from '@/stores/profile-roles-store'
import type { UserRole } from '@/types/user'
import { cn } from '@/utils/cn'
import styles from './user-roles.module.css'

const ROLE_NAMES: Record<UserRole['role'], string> = {
  FEATURED: 'Featured User',
  CURATOR: 'Curator',
  MODERATOR: 'Moderator',
}

/** The original's `UserDetailRoles`: a "Community Roles" panel listing the user's roles in categories. */
export const UserRolesPanel = ({ roles }: { roles: UserRole[] }) => {
  const isOpen = useProfileRolesStore((state) => state.isOpen)
  const setOpen = useProfileRolesStore((state) => state.setOpen)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, setOpen])

  // Leaving the profile closes the panel (the original closes it when its container unmounts).
  useEffect(() => () => setOpen(false), [setOpen])

  if (!isOpen) return null

  const onMaskClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) setOpen(false)
  }

  return (
    <div className={styles.modal}>
      <div className={cn('mask', styles.mask)} role="presentation" onClick={onMaskClick}>
        <div className={cn('content', styles.content)}>
          <button type="button" aria-label="Close" className={cn('CloseModal', styles.close)} onClick={() => setOpen(false)}>
            <XIconLG />
          </button>
          <div className={styles.assign}>
            <h1>Community Roles</h1>
          </div>
          <ul className={styles.list}>
            {roles.map((role) => (
              <li key={role.id} className={styles.role}>
                <span className="meta">
                  {ROLE_NAMES[role.role]} in&nbsp;
                  <Link href={`/discover/${role.category.slug}`}>{role.category.name}</Link>
                </span>
                <span className="controls" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
