'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { ArrowIcon, BrowseIcon, MoneyIconCircle, XIconLG } from '@/components/icons'
import { BuyLinkDialog } from '@/components/composer/buy-link-dialog'
import { CategorySelector } from '@/components/composer/category-selector'
import { useSubmitPost } from '@/components/composer/use-submit-post'
import { useMediaQuery } from '@/components/layout/use-media-query'
import { ACCEPTED_IMAGE_TYPES } from '@/constants/upload'
import { canPost, hasMedia as hasMediaIn, hasUploadsInFlight, useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'
import styles from './action-bar.module.css'

interface ActionBarProps {
  categories: Category[]
  onFiles: (files: File[]) => void
  onCancel: () => void
  /** Narrow hosts (a grid card's inline editor) use the compact layout at any width. */
  compact?: boolean
  /** DOM id of the bar (the original's `editorId`), used to scroll it into view. */
  id?: string
}

const CancelText = ({ onCancel }: { onCancel: () => void }) => (
  <button
    type="button"
    className={`PostActionButton forCancel label ${styles.cancel}`}
    onClick={onCancel}
  >
    <span>Cancel</span>
  </button>
)

/** The original's PostActionBar (post version): Cancel, Upload, Sell, category selector and Post. */
export const ActionBar = ({ categories, onFiles, onCancel, compact = false, id }: ActionBarProps) => {
  const blocks = useComposerStore((s) => s.blocks)
  const isSubmitting = useComposerStore((s) => s.isSubmitting)
  const { submit, isPending } = useSubmitPost()
  const inputRef = useRef<HTMLInputElement>(null)
  const isDesktop = useMediaQuery('(min-width: 40em)') && !compact
  const mode = useComposerStore((s) => s.mode)
  const busy = isSubmitting || isPending
  const submitLabel = { post: 'Post', edit: 'Update', repost: 'Repost' }[mode]
  const buyLink = useComposerStore((s) => s.buyLink)
  const setBuyLink = useComposerStore((s) => s.setBuyLink)
  const [selling, setSelling] = useState(false)
  const hasMedia = hasMediaIn(blocks)
  const disableSubmit = busy || (mode === 'repost' ? hasUploadsInFlight(blocks) : !canPost(blocks))

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onFiles(Array.from(e.target.files ?? []))
    e.target.value = '' // allow picking the same file again
  }

  const upload = (
    <button
      type="button"
      className={`PostActionButton forUpload ${styles.button}`}
      onClick={() => inputRef.current?.click()}
    >
      <span className={styles.label}>Upload</span>
      <BrowseIcon />
    </button>
  )
  const sell = (
    <button
      type="button"
      className={`PostActionButton forMoney ${buyLink ? 'isBuyLinked ' : ''}${styles.button} ${buyLink ? styles.buyLinked : ''}`}
      disabled={!hasMedia}
      onClick={() => setSelling(true)}
    >
      <span className={styles.label}>Sell</span>
      <MoneyIconCircle />
    </button>
  )
  const submitButton = (
    <button
      type="button"
      className={`PostActionButton forSubmit for${submitLabel} ${styles.button} ${styles.submit}`}
      disabled={disableSubmit}
      onClick={submit}
    >
      <span className={styles.label}>{busy && mode === 'post' ? 'Posting...' : submitLabel}</span>
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

  const dialog = selling ? (
    <BuyLinkDialog
      text={buyLink}
      onConfirm={(url) => {
        setBuyLink(url)
        setSelling(false)
      }}
      onDismiss={() => setSelling(false)}
    />
  ) : null

  if (isDesktop) {
    return (
      <div className={styles.bar} id={id}>
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
        {dialog}
      </div>
    )
  }

  return (
    <div className={compact ? `${styles.bar} ${styles.compact}` : styles.bar} id={id}>
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
      {dialog}
    </div>
  )
}
