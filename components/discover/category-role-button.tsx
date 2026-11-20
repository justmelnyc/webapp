'use client'

import { CircleAddRemove } from '@/components/icons'
import { cn } from '@/utils/cn'
import { roleName, type RoleType } from '@/utils/category-roles'
import styles from './category-users.module.css'

interface RoleButtonProps {
  roleType: RoleType
  onClick: () => void
}

/** CategoryAddRemoveRoleButton, add form: the green plus that opens the user picker. */
export const AddRoleButton = ({ roleType, onClick }: RoleButtonProps) => (
  <button
    type="button"
    className={cn('add-role open-trigger', styles.roleButton, styles.addRole)}
    title={`Add ${roleName(roleType)}`}
    onClick={onClick}
  >
    <span className="label">Add {roleName(roleType)}</span>
    <span className="icon">
      <CircleAddRemove />
    </span>
  </button>
)

/** CategoryAddRemoveRoleButton, remove form: the same icon turned into an X, next to a curator or moderator. */
export const RemoveRoleButton = ({ roleType, onClick }: RoleButtonProps) => (
  <button
    type="button"
    className={cn('remove-role', styles.roleButton, styles.removeRole)}
    title={`Remove ${roleName(roleType)}`}
    onClick={onClick}
  >
    <span className="label">Remove {roleName(roleType)}</span>
    <span className="icon">
      <CircleAddRemove />
    </span>
  </button>
)
