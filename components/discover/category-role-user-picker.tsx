'use client'

import { useEffect, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { XIconLG } from '@/components/icons'
import { Avatar } from '@/components/ui/avatar'
import type { QuickSearchUser } from '@/types/category'
import { roleName, type RoleType } from '@/utils/category-roles'
import { cn } from '@/utils/cn'
import { useRoleUserSearch } from './use-role-user-search'
import styles from './category-role-user-picker.module.css'

interface PickerProps {
  roleType: RoleType
  onPick: (user: QuickSearchUser) => void
  onClose: () => void
}

/** Where the arrow keys take the highlight: down and up wrap around the list. */
const nextIndex = (key: string, index: number | null, count: number): number | null => {
  if (count === 0) return index
  if (key === 'ArrowDown') return index === null || index >= count - 1 ? 0 : index + 1
  if (key === 'ArrowUp' && index !== null) return index === 0 ? count - 1 : index - 1
  return index
}

/** CategoryRoleUserPicker: the "Add Curator" / "Add Moderator" dialog with its username search. */
export const CategoryRoleUserPicker = ({ roleType, onPick, onClose }: PickerProps) => {
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const { users, search } = useRoleUserSearch()
  const hasItems = users.length > 0
  const inputId = `add-${roleType}`

  // Escape closes the dialog unless there are results on screen (the original's Mousetrap binding)
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape' && !hasItems) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hasItems, onClose])

  useEffect(() => {
    if (selected === null) return
    document.getElementById(`user_${users[selected]?.id}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [selected, users])

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value
    setText(value)
    // like the original, typing only highlights a user whose name was typed out in full
    const exact = value === '' ? -1 : users.findIndex((user) => user.username === value)
    setSelected(exact < 0 ? null : exact)
    search(value)
  }

  const pick = (user: QuickSearchUser): void => {
    setText(user.username)
    onPick(user)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (event.key === 'ArrowUp' && selected !== null) event.preventDefault()
      return setSelected(nextIndex(event.key, selected, users.length))
    }
    const user = selected === null ? undefined : users[selected]
    if (event.key === 'Enter' && user) {
      event.preventDefault()
      pick(user)
    }
  }

  const onMaskClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className={styles.modal}>
      <div className={cn('mask', styles.mask)} role="presentation" onClick={onMaskClick}>
        <div className={styles.picker} role="dialog" aria-label={`Add ${roleName(roleType)}`}>
          <button
            type="button"
            aria-label="Close"
            className={cn('CloseModal', styles.close)}
            onClick={onClose}
          >
            <XIconLG />
          </button>
          <div className={cn('pick-user', styles.pickUser)}>
            <h1>Add {roleName(roleType)}</h1>
            <form onSubmit={(event) => event.preventDefault()}>
              <label htmlFor={inputId}>
                <span className="label-text">@</span>{' '}
                <span className="input-holder">
                  <input
                    autoComplete="off"
                    className={cn('username', hasItems && 'has-items')}
                    id={inputId}
                    name={inputId}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    type="search"
                    value={text}
                  />
                </span>
                {hasItems && (
                  <ul className={styles.results} id="userPickerList">
                    {users.map((user, index) => (
                      <li
                        key={user.id}
                        id={`user_${user.id}`}
                        className={cn(styles.user, selected === index && 'isSelected')}
                      >
                        <button type="button" onClick={() => pick(user)}>
                          <Avatar src={user.avatar?.small?.url} name={user.username} />
                          <span className="username">@{user.username}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </label>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
