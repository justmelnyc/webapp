'use client'

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { ChevronIcon, XIcon } from '@/components/icons'
import { cn } from '@/utils/cn'
import styles from './role-filter-selector.module.css'

export interface FilterItem {
  id: string
  name: string
}

interface RoleFilterSelectorProps<T extends FilterItem> {
  /** The original's `type`: names the input and the list (`roleCategoryPicker`, `rolePicker`). */
  type: string
  labelText: string
  searchPromptText: string
  items: T[]
  selected: T | null
  onSelect: (item: T) => void
  onClear: () => void
  className?: string
}

/** Where the arrow keys take the highlight: down and up wrap around the list. */
export const nextIndex = (key: string, index: number | null, count: number): number | null => {
  if (count === 0) return index
  if (key === 'ArrowDown') return index === null || index >= count - 1 ? 0 : index + 1
  if (key === 'ArrowUp' && index !== null) return index === 0 ? count - 1 : index - 1
  return index
}

/** The original's `FilterSelectorControl` as the Community Roles form uses it: a searchable single-choice box. */
export const RoleFilterSelector = <T extends FilterItem>({
  type,
  labelText,
  searchPromptText,
  items,
  selected,
  onSelect,
  onClear,
  className,
}: RoleFilterSelectorProps<T>) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [index, setIndex] = useState<number | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const matches = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))

  const close = (): void => {
    setOpen(false)
    setSearch('')
  }

  useEffect(() => {
    if (!open) return
    const onDown = (event: globalThis.MouseEvent): void => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => {
    if (open && !selected) inputRef.current?.focus()
  }, [open, selected])

  const choose = (item: T): void => {
    // like the original, the chosen item stays highlighted when the list opens again
    setIndex(items.findIndex((candidate) => candidate.id === item.id))
    onSelect(item)
    close()
  }

  const clear = (): void => {
    setIndex(null)
    onClear()
  }

  const onClick = (event: MouseEvent<HTMLElement>): void => {
    if (!(event.target instanceof Element)) return
    if (event.target.closest('button')) return
    if (event.target.closest('svg')) return close()
    setOpen(true)
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value
    setSearch(value)
    if (!index) setIndex(value === '' ? null : 0)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (event.key === 'ArrowUp' && index !== null) event.preventDefault()
      return setIndex(nextIndex(event.key, index, matches.length))
    }
    const match = index === null ? undefined : matches[index]
    if (event.key === 'Enter' && match) {
      event.preventDefault()
      return choose(match)
    }
    if (event.key === 'Escape') {
      // keep the panel behind it open: Escape only closes the list
      event.stopPropagation()
      inputRef.current?.blur()
      close()
    }
  }

  return (
    <aside ref={rootRef} role="searchbox" className={cn('fs', `fs-${type}`, styles.root, className)} onClick={onClick}>
      <span>
        <span className={cn(styles.control, open && ['open', styles.open])}>
          {selected ? (
            <span className={cn('selected', styles.selected)}>
              <b>{selected.name}</b>
              <button type="button" onClick={clear}>
                <span className={styles.removeLabel}>Remove</span>
                <span className="icon">
                  <XIcon />
                </span>
              </button>
            </span>
          ) : (
            <span className="input-with-label">
              {!search && (
                <label className={cn('selector-label', styles.label)} htmlFor={type}>
                  {open ? searchPromptText : labelText}
                </label>
              )}
              <ChevronIcon />
              <input
                ref={inputRef}
                id={type}
                className={cn('selector', styles.selector)}
                name={type}
                type="search"
                autoComplete="off"
                value={search}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onFocus={() => setOpen(true)}
              />
            </span>
          )}
        </span>
        {open && (
          <span id={`${type}List`} className={styles.list}>
            <ul>
              {matches.map((item, position) => (
                <li key={item.id} id={`${type}Select_${item.id}`} className={cn(position === index && ['isSelected', styles.isSelected])}>
                  <button type="button" role="option" aria-selected={position === index} onClick={() => choose(item)}>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </span>
        )}
      </span>
    </aside>
  )
}
