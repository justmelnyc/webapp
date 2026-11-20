'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { assignProfileRole, removeProfileRole } from '@/actions/category-actions'
import { XIconLG } from '@/components/icons'
import { NewRoleMark, UserRoleItem, UserRoleRemove } from '@/components/profile/user-role-item'
import { UserRolesForm, type NewProfileRole } from '@/components/profile/user-roles-form'
import { useProfileRolesStore } from '@/stores/profile-roles-store'
import { toast } from '@/stores/toast-store'
import type { AdministeredCategory } from '@/types/category'
import type { UserRole } from '@/types/user'
import { cn } from '@/utils/cn'
import { canRemoveRole, mergeRoles } from '@/utils/profile-roles'
import styles from './user-roles.module.css'

interface UserRolesPanelProps {
  userId: string
  username: string
  roles: UserRole[]
  /** The categories the viewer administers (`searchCategories(administered: true)`): with any, they get the form. */
  administeredCategories: AdministeredCategory[]
  isStaff: boolean
}

/**
 * The original's `UserDetailRolesContainer` + `UserDetailRoles`: a "Community Roles" panel listing the user's
 * roles in categories. People who administer categories can assign a role there and remove the ones they may.
 */
export const UserRolesPanel = ({ userId, username, roles: initialRoles, administeredCategories, isStaff }: UserRolesPanelProps) => {
  const isOpen = useProfileRolesStore((state) => state.isOpen)
  const setOpen = useProfileRolesStore((state) => state.setOpen)
  // Like the original's store, the list lives here once loaded: a new role goes last, a removed one disappears.
  const [roles, setRoles] = useState(initialRoles)
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null)

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

  const close = (): void => {
    setOpen(false)
    setNewCategoryId(null)
  }

  const onMaskClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) close()
  }

  const assign = async (role: NewProfileRole): Promise<boolean> => {
    const result = await assignProfileRole({ ...role, userId, username })
    if (!result.ok) {
      toast.error(result.error)
      return false
    }
    setRoles((current) => mergeRoles(current, result.data))
    setNewCategoryId(role.categoryId)
    return true
  }

  const remove = async (role: UserRole): Promise<void> => {
    const result = await removeProfileRole(role.id, username)
    if (!result.ok) return toast.error(result.error)
    setRoles((current) => current.filter((entry) => entry.id !== role.id))
  }

  return (
    <div className={styles.modal}>
      <div className={cn('mask', styles.mask)} role="presentation" onClick={onMaskClick}>
        <div className={cn('content', styles.content)}>
          <button type="button" aria-label="Close" className={cn('CloseModal', styles.close)} onClick={close}>
            <XIconLG />
          </button>
          <div className={cn('assign-roles', styles.assign)}>
            <h1>Community Roles</h1>
            {administeredCategories.length > 0 ? (
              <UserRolesForm administeredCategories={administeredCategories} isStaff={isStaff} onSubmit={assign} />
            ) : null}
          </div>
          <ul className={cn('user-roles', styles.list)}>
            {roles.map((role) => (
              <UserRoleItem key={role.id} role={role}>
                {/* like the original, every role of the category just assigned is marked, not only the new one */}
                {newCategoryId === role.category.id ? <NewRoleMark /> : null}
                {canRemoveRole(role, administeredCategories, isStaff) ? (
                  <UserRoleRemove role={role} username={username} onRemove={remove} />
                ) : null}
              </UserRoleItem>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
