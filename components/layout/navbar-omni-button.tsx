import { ComposeButton } from '@/components/composer/compose-button'
import { PencilIcon } from '@/components/icons'
import type { Category } from '@/types/content'
import styles from './navbar.module.css'

/** The original's NavbarOmniButton: a pencil and "Post" that opens the omnibar. */
export const NavbarOmniButton = ({ categories }: { categories: Category[] }) => (
  <ComposeButton categories={categories} className={`NavbarOmniButton ${styles.omni}`}>
    <PencilIcon />
    <span>Post</span>
  </ComposeButton>
)
