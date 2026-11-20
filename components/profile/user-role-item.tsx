'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { XBoxIcon } from '@/components/icons'
import type { UserRole } from '@/types/user'
import { cn } from '@/utils/cn'
import { ROLE_NAMES } from '@/utils/profile-roles'
import styles from './user-roles-form.module.css'

interface RemoveRoleProps {
  role: UserRole
  username: string
  onRemove: (role: UserRole) => void
}

/** `UserDetailRemoveRole`: the x of a role, which asks "Remove @name from Category? Yes No" before it removes. */
export const UserRoleRemove = ({ role, username, onRemove }: RemoveRoleProps) => {
  const [open, setOpen] = useState(false)
  const toggle = (): void => setOpen((value) => !value)
  const button = (
    <button type="button" className={cn('remove', styles.remove)} aria-label="Remove role" onClick={toggle}>
      <XBoxIcon />
    </button>
  )
  if (!open) return button
  return (
    <span className={styles.confirm}>
      <span className="confirm-text">
        Remove @{username} from <Link href={`/discover/${role.category.slug}`}>{role.category.name}</Link>?
        <button type="button" className="remove-confirm" onClick={() => onRemove(role)}>
          Yes
        </button>
        <button type="button" className="remove-cancel" onClick={toggle}>
          No
        </button>
      </span>
      {button}
    </span>
  )
}

/** A green dot on the roles of the category that was just assigned (`.new-role`). */
export const NewRoleMark = () => (
  <span className={cn('new-role', styles.newRole)}>
    <i>New!</i>
  </span>
)

/** `UserRole`: "Curator in Art", with its controls (the new mark, the remove button) as children. */
export const UserRoleItem = ({ role, children }: { role: UserRole; children?: ReactNode }) => (
  <li className={styles.role}>
    <span className="meta">
      {ROLE_NAMES[role.role]} in&nbsp;
      <Link href={`/discover/${role.category.slug}`}>{role.category.name}</Link>
    </span>
    <span className={cn('controls', styles.controls)}>{children}</span>
  </li>
)
