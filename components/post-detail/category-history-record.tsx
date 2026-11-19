'use client'

import Link from 'next/link'
import { useState } from 'react'
import { runCategoryPostAction } from '@/actions/category-post-actions'
import { BadgeFeaturedIcon } from '@/components/icons'
import { toast } from '@/stores/toast-store'
import type { Post } from '@/types/post'
import styles from './category-history.module.css'

type CategoryPost = NonNullable<Post['categoryPosts']>[number]

/** The original's `FeatureCategoryPostTool`: a button for curators, a plain badge for everyone else. */
const StatusTool = ({ categoryPost, onFire }: { categoryPost: CategoryPost; onFire: (action: unknown) => void }) => {
  const { status, actions } = categoryPost
  if (status === 'submitted' && actions?.feature) {
    const { feature } = actions
    return (
      <button type="button" className="featured-toggle" onClick={() => onFire(feature)}>
        <BadgeFeaturedIcon color="#aaaaaa" />
      </button>
    )
  }
  if (status === 'featured' && actions?.unfeature) {
    const { unfeature } = actions
    return (
      <button type="button" className="featured-toggle featured" onClick={() => onFire(unfeature)}>
        <BadgeFeaturedIcon />
      </button>
    )
  }
  if (status !== 'featured') return null
  return (
    <span className="featured-toggle">
      <BadgeFeaturedIcon />
    </span>
  )
}

/** The original's `featuredElement`: who featured the post; an unnamed curator is `@ello`. */
const FeaturedBy = ({ categoryPost }: { categoryPost: CategoryPost }) => {
  if (categoryPost.status !== 'featured') return null
  const featuredBy = categoryPost.featuredBy?.username || 'ello'
  const category = categoryPost.category
  if (featuredBy === categoryPost.submittedBy?.username && category) {
    return (
      <span>
        Featured by <Link href={`/${featuredBy}`}>@{featuredBy}</Link> in&nbsp;
        <Link href={`/discover/${category.slug}`}>{category.name}</Link>.
      </span>
    )
  }
  return (
    <span>
      Featured by <Link href={`/${featuredBy}`}>@{featuredBy}</Link>.
    </span>
  )
}

/** The original's `submittedElement`: "Posted into" by the author, or "Added to" by someone else. */
const SubmittedBy = ({ categoryPost, authorUsername }: { categoryPost: CategoryPost; authorUsername: string }) => {
  const submittedBy = categoryPost.submittedBy?.username
  const category = categoryPost.category
  if (!category) return null
  if (submittedBy === authorUsername) {
    return (
      <span>
        Posted into&nbsp;
        <Link href={`/discover/${category.slug}`}>{category.name}</Link>.
      </span>
    )
  }
  if (submittedBy !== categoryPost.featuredBy?.username) {
    return (
      <span>
        Added to&nbsp;
        <Link href={`/discover/${category.slug}`}>{category.name}</Link> by&nbsp;
        <Link href={`/${submittedBy}`}>{submittedBy}</Link>.
      </span>
    )
  }
  return null
}

/** The original's `CategoryPostHistoryRecord`; after a curator's action it shows the API's new status. */
export const CategoryHistoryRecord = ({ categoryPost, authorUsername }: { categoryPost: CategoryPost; authorUsername: string }) => {
  const [current, setCurrent] = useState(categoryPost)
  const fire = (action: unknown): void => {
    void runCategoryPostAction(action).then((result) => {
      if (!result.ok) return toast.error(result.error)
      const { status, actions, featuredByUsername, submittedByUsername } = result.data
      setCurrent((prev) => ({
        ...prev,
        status,
        actions,
        featuredBy: featuredByUsername ? { username: featuredByUsername } : null,
        submittedBy: submittedByUsername ? { username: submittedByUsername } : prev.submittedBy,
      }))
    })
  }
  if (current.status === 'removed') return null
  return (
    <p className={styles.record}>
      <StatusTool categoryPost={current} onFire={fire} />
      <FeaturedBy categoryPost={current} />
      &nbsp;
      <SubmittedBy categoryPost={current} authorUsername={authorUsername} />
    </p>
  )
}
