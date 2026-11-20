'use client'

interface IconsButtonProps {
  className?: string
}

/** The header's Icons button: inert in the original (its icon page was commented out), here it jumps to the icon set. */
export const IconsButton = ({ className }: IconsButtonProps) => (
  <button type="button" className={className} onClick={() => document.getElementById('icons')?.scrollIntoView()}>
    Icons
  </button>
)
