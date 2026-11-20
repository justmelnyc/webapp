'use client'

import { ChevronIcon, XIcon } from '@/components/icons'
import { useCategoryDrawer } from './category-drawer'

/**
 * CategoryInfoTrigger: "Info" with a chevron while the panel is closed, an X once it is open
 * (a brand category's panel cannot be closed, so its button has no X).
 */
export const CategoryInfoTrigger = ({ name }: { name: string }) => {
  const { isOpen, isCloseable, toggle } = useCategoryDrawer()
  if (!isOpen) {
    return (
      <button
        type="button"
        className="category-info open-trigger"
        title={`${name} info`}
        onClick={toggle}
      >
        <span className="label">Info</span>
        <span className="icon">
          <ChevronIcon />
        </span>
      </button>
    )
  }
  return (
    <button
      type="button"
      className="category-info close-trigger"
      title={`Close ${name} info`}
      onClick={toggle}
    >
      <span className="label">Close</span>
      {isCloseable && (
        <span className="icon">
          <XIcon />
        </span>
      )}
    </button>
  )
}

/**
 * The trigger inside the phone-sized hero. The original renders it without `isCloseable`, which
 * always gives the "Close" form with no icon: a round button in the hero's corner that toggles the panel.
 */
export const HeroInfoTrigger = ({ name }: { name: string }) => {
  const { toggle } = useCategoryDrawer()
  return (
    <button
      type="button"
      className="category-info close-trigger"
      title={`Close ${name} info`}
      onClick={toggle}
    >
      <span className="label">Close</span>
    </button>
  )
}
