import { ComposeButton } from '@/components/composer/compose-button'
import { PencilIcon } from '@/components/icons'
import type { Category } from '@/types/content'
import styles from './navbar.module.css'

/** The original's NavbarOmniButton: a pencil and "Post" that opens the omnibar. */
interface NavbarOmniButtonProps {
  categories: Category[]
  featuredCategoryIds?: string[]
}

export const NavbarOmniButton = ({ categories, featuredCategoryIds }: NavbarOmniButtonProps) => (
  <ComposeButton categories={categories} featuredCategoryIds={featuredCategoryIds} className={`NavbarOmniButton ${styles.omni}`}>
    <PencilIcon />
    <span>Post</span>
  </ComposeButton>
)
