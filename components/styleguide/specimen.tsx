import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './specimens.module.css'

interface SpecimenProps {
  /** The component's export name. */
  name: string
  about: ReactNode
  children: ReactNode
}

/** One primitive: its name, what it is for, and its variants. */
export const Specimen = ({ name, about, children }: SpecimenProps) => (
  <article className={styles.specimen}>
    <h3 className={styles.specimenName}>{name}</h3>
    <p className={styles.specimenAbout}>{about}</p>
    <div className={styles.variants}>{children}</div>
  </article>
)

export const Variant = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className={styles.variant}>
    <span className={styles.variantLabel}>{label}</span>
    {children}
  </div>
)

interface StageProps {
  className?: string
  children: ReactNode
}

/** Where a primitive is drawn: on white ... */
export const Stage = ({ className, children }: StageProps) => <div className={cn(styles.stage, className)}>{children}</div>

/** ... on the settings grey ... */
export const GreyStage = ({ className, children }: StageProps) => <Stage className={cn(styles.stageGrey, className)}>{children}</Stage>

/** ... on black (footer, heroes) ... */
export const DarkStage = ({ className, children }: StageProps) => <Stage className={cn(styles.stageDark, className)}>{children}</Stage>

/** ... on the modal scrim ... */
export const ModalStage = ({ className, children }: StageProps) => <Stage className={cn(styles.stageModal, className)}>{children}</Stage>

/** ... or on the red danger zone scrim. */
export const DangerStage = ({ className, children }: StageProps) => <Stage className={cn(styles.stageDanger, className)}>{children}</Stage>

/** Lays small primitives out in a wrapping line. */
export const Inline = ({ children }: { children: ReactNode }) => <div className={styles.inline}>{children}</div>

export const dismissStage = styles.stageDismiss
