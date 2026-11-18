'use client'

import { RolesIcon } from '@/components/icons'
import { useProfileRolesStore } from '@/stores/profile-roles-store'
import { cn } from '@/utils/cn'
import styles from './user-roles.module.css'

/** `UserRolesButton.inUserProfile`: the phone-sized button that toggles the Community Roles panel. */
export const RolesButton = () => {
  const isOpen = useProfileRolesStore((state) => state.isOpen)
  const setOpen = useProfileRolesStore((state) => state.setOpen)
  return (
    <button
      type="button"
      className={cn('UserRolesButton inUserProfile', styles.button)}
      aria-label="Community roles"
      onClick={() => setOpen(!isOpen)}
    >
      <RolesIcon />
    </button>
  )
}
