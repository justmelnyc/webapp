'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PostFollowButton } from '@/components/posts/post-follow-button'
import { Avatar } from '@/components/ui/avatar'
import type { CategoryUser, QuickSearchUser } from '@/types/category'
import type { RoleType } from '@/utils/category-roles'
import { cn } from '@/utils/cn'
import { avatarUrl } from '@/utils/images'
import { AddRoleButton, RemoveRoleButton } from './category-role-button'
import { CategoryRoleUserPicker } from './category-role-user-picker'
import '@/components/posts/post-hints.css'
import styles from './category-users.module.css'

const TITLES: Record<RoleType, string> = { curators: 'Curators', moderators: 'Moderators' }

/** Who is looking at the list, and whether they may change it (`selectHasRoleAssignmentAccess`). */
export interface RoleViewer {
  id: string | null
  canAssign: boolean
}

interface CategoryUsersProps {
  roleType: RoleType
  users: CategoryUser[]
  viewer: RoleViewer
  onAdd: (user: QuickSearchUser) => void
  onRemove: (categoryUser: CategoryUser) => void
}

/** UserRoleList: avatar and @username; visitors who cannot manage roles get a small follow toggle. */
const RoleUser = ({ categoryUser, viewer }: { categoryUser: CategoryUser; viewer: RoleViewer }) => {
  const { user } = categoryUser
  return (
    <div className={cn('UserCompact', styles.compact)}>
      <div className={cn('UserCompactHeader', styles.compactHeader)}>
        <Link
          className={cn('UserCompactUserLink truncate', styles.userLink)}
          href={`/${user.username}`}
        >
          <Avatar src={avatarUrl(user.avatar, 'regular')} name={user.username} />
          <span className={cn('UserCompactUsername', styles.username)}>{`@${user.username}`}</span>
        </Link>
      </div>
      {!viewer.canAssign && user.id !== viewer.id && (
        <PostFollowButton
          userId={user.id}
          priority={user.currentUserState?.relationshipPriority}
          signedIn={!!viewer.id}
        />
      )}
    </div>
  )
}

/**
 * CategoryUsers: the curators or the moderators of a category. Like the original, a list with
 * nobody in it is not shown at all, so its "add" button is not offered either.
 */
export const CategoryUsers = ({ roleType, users, viewer, onAdd, onRemove }: CategoryUsersProps) => {
  const [isPickerOpen, setPickerOpen] = useState(false)
  if (users.length === 0) return null

  const pick = (user: QuickSearchUser): void => {
    setPickerOpen(false)
    onAdd(user)
  }

  return (
    <nav className={cn(`${roleType}-holder users-holder`, styles.holder)}>
      {viewer.canAssign && (
        <div className="roles-holder">
          <AddRoleButton roleType={roleType} onClick={() => setPickerOpen(true)} />
          {isPickerOpen && (
            <CategoryRoleUserPicker
              roleType={roleType}
              onPick={pick}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
      )}
      <h4>{TITLES[roleType]}</h4>
      <ul className={cn(roleType, styles.users)}>
        {users.map((categoryUser) => (
          <li key={categoryUser.id} className="category-user">
            <RoleUser categoryUser={categoryUser} viewer={viewer} />
            {viewer.canAssign && categoryUser.user.id !== viewer.id && (
              <RemoveRoleButton roleType={roleType} onClick={() => onRemove(categoryUser)} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
