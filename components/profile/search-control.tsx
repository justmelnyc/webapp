'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { SearchIcon } from '@/components/icons'
import styles from './search-control.module.css'

const DEBOUNCE_MS = 666
const MIN_TERMS = 2

/**
 * The original's SearchControl: a big grey input that searches as you type (debounced, at least two
 * characters) plus the Posts / People tabs. The form still submits as a plain GET without JavaScript.
 * The mock API only searches people, so the Posts tab is shown but disabled.
 */
export const SearchControl = ({ query }: { query: string }) => {
  const router = useRouter()
  const [text, setText] = useState(query)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const input = useRef<HTMLInputElement>(null)

  // The original focuses the input on the next frame.
  useEffect(() => {
    const frame = requestAnimationFrame(() => input.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value
    setText(value)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const terms = value.trim()
      router.replace(terms.length >= MIN_TERMS ? `/search?q=${encodeURIComponent(terms)}` : '/search')
    }, DEBOUNCE_MS)
  }

  return (
    <form action="/search" method="get" role="search" className={styles.bar}>
      <div className={`FormControl SearchControl ${styles.control}`} data-has-value={text.length > 0 ? '' : undefined}>
        <span className={styles.icon}>
          <SearchIcon />
        </span>
        <label className={styles.label} htmlFor="terms">
          Search
        </label>
        <input
          id="terms"
          type="text"
          name="q"
          value={text}
          onChange={onChange}
          placeholder="Search"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          ref={input}
          className={styles.input}
        />
      </div>
      <nav className={`SearchTabList TabListButtons ${styles.tabs}`}>
        <button type="button" className={styles.tab} disabled title="Post search is not available in this build">
          Posts
        </button>
        <button type="button" className={styles.tab} aria-current="true">
          People
        </button>
      </nav>
    </form>
  )
}
