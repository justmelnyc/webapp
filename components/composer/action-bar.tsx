'use client'

import { useRef, type ChangeEvent } from 'react'
import { ArrowIcon, BrowseIcon, MoneyIconCircle, XIconLG } from '@/components/icons'
import { CategorySelector } from '@/components/composer/category-selector'
import { useSubmitPost } from '@/components/composer/use-submit-post'
import { useMediaQuery } from '@/components/layout/use-media-query'
import { ACCEPTED_IMAGE_TYPES } from '@/constants/upload'
import { canPost, useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'
import styles from './action-bar.module.css'

interface ActionBarProps {
  categories: Category[]
  onFiles: (files: File[]) => void
  onCancel: () => void
}

const CancelText = ({ onCancel }: { onCancel: () => void }) => (
  <button type="button" className={`PostActionButton forCancel label ${styles.cancel}`} onClick={onCancel}>
    <span>Cancel</span>
  </button>
)

/** The original's PostActionBar (post version): Cancel, Upload, Sell, category selector and Post. */
export const ActionBar = ({ categories, onFiles, onCancel }: ActionBarProps) => {
  const blocks = useComposerStore((s) => s.blocks)
  const isSubmitting = useComposerStore((s) => s.isSubmitting)
  const { submit, isPending } = useSubmitPost()
  const inputRef = useRef<HTMLInputElement>(null)
  const isDesktop = useMediaQuery('(min-width: 40em)')
  const busy = isSubmitting || isPending
  const hasMedia = blocks.some((b) => b.kind === 'image')
  const disableSubmit = busy || !canPost(blocks)

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onFiles(Array.from(e.target.files ?? []))
    e.target.value = '' // allow picking the same file again
  }

  const upload = (
    <button type="button" className={`PostActionButton forUpload ${styles.button}`} onClick={() => inputRef.current?.click()}>
      <span className={styles.label}>Upload</span>
      <BrowseIcon />
    </button>
  )
  const sell = (
    <button type="button" className={`PostActionButton forMoney ${styles.button}`} disabled={!hasMedia}>
      <span className={styles.label}>Sell</span>
      <MoneyIconCircle />
    </button>
  )
  const submitButton = (
    <button
      type="button"
      className={`PostActionButton forSubmit forPost ${styles.button} ${styles.submit}`}
      disabled={disableSubmit}
      onClick={submit}
    >
      <span className={styles.label}>{busy ? 'Posting...' : 'Post'}</span>
      <ArrowIcon />
    </button>
  )
  const selector = categories.length > 0 ? <CategorySelector categories={categories} /> : null
  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      multiple
      hidden
      accept={ACCEPTED_IMAGE_TYPES.join(',')}
      onChange={onChange}
      aria-label="Choose images"
    />
  )

  if (isDesktop) {
    return (
      <div className={styles.bar}>
        <div className={styles.left}>
          <CancelText onCancel={onCancel} />
        </div>
        <div className={styles.right}>
          {upload}
          {sell}
          {selector}
          {submitButton}
        </div>
        {fileInput}
      </div>
    )
  }

  return (
    <div className={styles.bar}>
      {selector}
      <div className={styles.left}>
        {upload}
        {sell}
        <button
          type="button"
          className={`PostActionButton isPost forCancel icon-text ${styles.cancelIcon}`}
          onClick={onCancel}
          disabled={busy}
        >
          <span className={styles.label}>Cancel</span>
          <XIconLG />
        </button>
      </div>
      <div className={styles.right}>
        <CancelText onCancel={onCancel} />
        {submitButton}
      </div>
      {fileInput}
    </div>
  )
}
