'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { RoleFilterSelector } from '@/components/profile/role-filter-selector'
import type { AdministeredCategory } from '@/types/category'
import { cn } from '@/utils/cn'
import { roleOptionsFor, type RoleOption } from '@/utils/profile-roles'
import styles from './user-roles-form.module.css'

export interface NewProfileRole {
  categoryId: string
  role: 'featured' | 'curator' | 'moderator'
}

const ROLE_PARAMS: Record<RoleOption['id'], NewProfileRole['role']> = {
  FEATURED: 'featured',
  CURATOR: 'curator',
  MODERATOR: 'moderator',
}

/** `StatusMessage`: shows for 1.75s, fades out, then tells its parent it is done. */
const StatusMessage = ({ onHidden }: { onHidden: () => void }) => {
  const [hiding, setHiding] = useState(false)
  useEffect(() => {
    const hide = setTimeout(() => setHiding(true), 1750)
    const done = setTimeout(onHidden, 2300)
    return () => {
      clearTimeout(hide)
      clearTimeout(done)
    }
  }, [onHidden])
  return <p className={cn('status-msg', styles.status, hiding && styles.statusHidden)}>Success!</p>
}

interface UserRolesFormProps {
  administeredCategories: AdministeredCategory[]
  isStaff: boolean
  /** Stores the role; answers whether that worked (the form resets and says "Success!" when it did). */
  onSubmit: (role: NewProfileRole) => Promise<boolean>
}

/** `UserCategoryRolesForm`: pick one of your categories and a position, then Add. */
export const UserRolesForm = ({ administeredCategories, isStaff, onSubmit }: UserRolesFormProps) => {
  const [category, setCategory] = useState<AdministeredCategory | null>(null)
  const [role, setRole] = useState<RoleOption | null>(null)
  const [showStatus, setShowStatus] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.preventDefault()
    if (!category || !role || pending) return
    setPending(true)
    const stored = await onSubmit({ categoryId: category.id, role: ROLE_PARAMS[role.id] })
    setPending(false)
    if (!stored) return
    setCategory(null)
    setRole(null)
    setShowStatus(true)
  }

  return (
    <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <div className={cn('selectors', styles.selectors)}>
        <RoleFilterSelector
          type="roleCategoryPicker"
          labelText="Choose Category"
          searchPromptText="Type category name"
          items={administeredCategories}
          selected={category}
          onSelect={setCategory}
          onClear={() => setCategory(null)}
          className={styles.picker}
        />
        <RoleFilterSelector
          type="rolePicker"
          labelText="Choose position"
          searchPromptText="Type position"
          items={roleOptionsFor(category, isStaff)}
          selected={role}
          onSelect={setRole}
          onClear={() => setRole(null)}
          className={cn(styles.picker, styles.rolePicker)}
        />
      </div>
      {showStatus ? <StatusMessage onHidden={() => setShowStatus(false)} /> : null}
      <button type="submit" className={cn('role-submit', styles.submit)} disabled={!category || !role} onClick={submit}>
        <span>Add</span>
      </button>
    </form>
  )
}
