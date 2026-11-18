'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { ChevronIcon, XIcon } from '@/components/icons'
import { useComposerStore } from '@/stores/composer-store'
import type { Category } from '@/types/content'
import { cn } from '@/utils/cn'
import styles from './category-selector.module.css'

/** The original's CategoryPostSelector: a searchable single-choice "Choose Category" box. */
export const CategorySelector = ({ categories }: { categories: Category[] }) => {
  const categoryIds = useComposerStore((s) => s.categoryIds)
  const setCategory = useComposerStore((s) => s.setCategory)
  const isEditing = useComposerStore((s) => s.mode === 'edit') // an existing post's category is shown, not changeable
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [index, setIndex] = useState<number | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const selected = categories.find((c) => c.id === categoryIds[0]) ?? null
  const matches = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    if (!open) return
    const onDown = (e: globalThis.MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (open && !selected) inputRef.current?.focus()
  }, [open, selected])

  function close(): void {
    setOpen(false)
    setSearch('')
    setIndex(null)
  }

  const choose = (category: Category): void => {
    setCategory(category.id)
    close()
  }

  const onClick = (e: MouseEvent<HTMLElement>): void => {
    const target = e.target as Element
    if (target.closest('svg')) return close()
    if (target.closest('button')) return
    setOpen(true)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    const max = matches.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex(index === null || index >= max - 1 ? 0 : index + 1)
    } else if (e.key === 'ArrowUp' && index !== null) {
      e.preventDefault()
      setIndex(index > 0 ? index - 1 : max - 1)
    } else if (e.key === 'Enter' && index !== null) {
      e.preventDefault()
      const match = matches[index]
      if (match) choose(match)
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      inputRef.current?.blur()
      close()
    }
  }

  return (
    <aside
      ref={rootRef}
      role="searchbox"
      className={cn('category-post-selector', isEditing && 'disabled', styles.root)}
      onClick={isEditing ? undefined : onClick}
    >
      <span className={cn(styles.control, open && styles.open)}>
        {selected ? (
          <span className={styles.selected}>
            <b>
              <i>{isEditing ? 'Posted into:' : 'Post into:'}</i>&nbsp;{selected.name}
            </b>
            {isEditing ? null : (
              <button type="button" aria-label="Remove category" onClick={() => setCategory(null)}>
                <XIcon />
              </button>
            )}
          </span>
        ) : (
          <span className="input-with-label">
            {!search && (
              <label className={styles.label} htmlFor={listId}>
                {open ? 'Type category name' : 'Choose Category'}
              </label>
            )}
            <ChevronIcon />
            <input
              ref={inputRef}
              id={listId}
              type="search"
              name="categorySelector"
              className={styles.selector}
              value={search}
              autoComplete="off"
              onChange={(e) => {
                setSearch(e.target.value)
                setIndex(e.target.value ? 0 : null)
              }}
              onKeyDown={onKeyDown}
              onFocus={() => setOpen(true)}
            />
          </span>
        )}
      </span>
      {open && !selected && (
        <span className={styles.list} role="listbox">
          <span>
            <b>All Categories</b>
            <ul>
              {matches.map((c, i) => (
                <li key={c.id} className={cn(i === index && styles.isSelected)}>
                  <button type="button" role="option" aria-selected={i === index} onClick={() => choose(c)}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </span>
        </span>
      )}
    </aside>
  )
}
