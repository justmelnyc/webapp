import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './footer.module.css'

export const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <a className={styles.link} href={href} rel="noopener noreferrer" target="_blank">
    <span className={styles.linkText}>{label}</span>
  </a>
)

interface FooterToolProps {
  /** `TopTool` or `LayoutTool`: the original's hover and mobile rules key off these names. */
  name: 'TopTool' | 'LayoutTool'
  icon: ReactNode
  label: string
  onClick: () => void
}

export const FooterTool = ({ name, icon, label, onClick }: FooterToolProps) => (
  <button
    type="button"
    className={cn(name, 'FooterTool', styles.tool, name === 'LayoutTool' && styles.layoutTool)}
    onClick={onClick}
  >
    {icon}
    <span className={styles.toolText}>{label}</span>
  </button>
)
