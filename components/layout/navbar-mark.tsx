import Link from 'next/link'
import { ElloLogoType } from '@/components/icons'
import styles from './navbar.module.css'

export const NavbarMark = () => (
  <Link href="/" draggable aria-label="Ello" className={`NavbarMark ${styles.mark}`}>
    <ElloLogoType />
  </Link>
)
