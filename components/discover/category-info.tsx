'use client'

import { useState } from 'react'
import { addCategoryRole, removeCategoryRole } from '@/actions/category-actions'
import { toast } from '@/stores/toast-store'
import type { CategoryDetails, CategoryUser, QuickSearchUser } from '@/types/category'
import type { PageHeader } from '@/types/content'
import { roleOf, type RoleType } from '@/utils/category-roles'
import { cn } from '@/utils/cn'
import { useCategoryDrawer } from './category-drawer'
import { CategoryInfoTrigger } from './category-info-trigger'
import { CategorySubscribeButton } from './category-subscribe-button'
import { CategoryUsers, type RoleViewer } from './category-users'
import { HeroCta } from './discover-hero'
import triggerStyles from './category-info-trigger.module.css'
import styles from './category-info.module.css'

interface CategoryInfoProps {
  category: CategoryDetails
  /** The page header's call to action, shown under the description. */
  cta: PageHeader['ctaLink']
  viewer: RoleViewer
}

/** The category's curators and moderators, kept in step with what the viewer adds and removes. */
const useCategoryUsers = (category: CategoryDetails) => {
  const [users, setUsers] = useState<CategoryUser[]>(category.categoryUsers ?? [])

  const add = async (roleType: RoleType, user: QuickSearchUser): Promise<void> => {
    const result = await addCategoryRole({
      userId: user.id,
      categoryId: category.id,
      role: roleOf(roleType),
      slug: category.slug,
    })
    if (result.ok) setUsers(result.data)
    else toast.error(result.error)
  }

  const remove = async (categoryUser: CategoryUser): Promise<void> => {
    setUsers((list) => list.filter((entry) => entry.id !== categoryUser.id))
    const result = await removeCategoryRole(categoryUser.id)
    if (result.ok) return
    toast.error(result.error)
    setUsers((list) =>
      list.some((entry) => entry.id === categoryUser.id) ? list : [...list, categoryUser],
    )
  }

  return { users, add, remove }
}

/**
 * CategoryInfo: the "Info" trigger in the corner of a category page and, once opened, the
 * side panel with the subscribe button, the description and the curators and moderators.
 */
export const CategoryInfo = ({ category, cta, viewer }: CategoryInfoProps) => {
  const { isOpen } = useCategoryDrawer()
  const { users, add, remove } = useCategoryUsers(category)

  if (!isOpen) {
    return (
      <p className={triggerStyles.collapsed}>
        <CategoryInfoTrigger name={category.name} />
      </p>
    )
  }

  const list = (roleType: RoleType, role: CategoryUser['role']) => (
    <CategoryUsers
      roleType={roleType}
      users={users.filter((entry) => entry.role === role)}
      viewer={viewer}
      onAdd={(user) => void add(roleType, user)}
      onRemove={(categoryUser) => void remove(categoryUser)}
    />
  )

  return (
    <aside className={cn('sidebar', styles.expanded)}>
      <CategoryInfoTrigger name={category.name} />
      <h2>Info</h2>
      <CategorySubscribeButton categoryId={category.id} />
      {category.description && (
        <article className="description">
          <section className="main">
            <p>{category.description}</p>
            <p>
              <HeroCta cta={cta} />
            </p>
          </section>
        </article>
      )}
      <section className="moderators-curators">
        {list('moderators', 'MODERATOR')}
        {list('curators', 'CURATOR')}
      </section>
    </aside>
  )
}
