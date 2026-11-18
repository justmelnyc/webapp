'use client'

import { ArrowIcon } from '@/components/icons'
import { useNewPostsStore } from '@/stores/new-posts-store'
import styles from './navbar-new-posts.module.css'

/** The original's NavbarMorePostsButton: shows when the stream under it has newer posts. */
export const NavbarNewPosts = () => {
  const count = useNewPostsStore((state) => state.count)
  const apply = useNewPostsStore((state) => state.apply)
  if (count === 0 || !apply) return null
  return (
    <button type="button" className={`NavbarMorePostsButton ${styles.button}`} onClick={apply}>
      <ArrowIcon />
      <span className={styles.label}>New Posts</span>
    </button>
  )
}
