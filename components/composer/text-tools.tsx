'use client'

import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { LinkIcon } from '@/components/icons'
import { useSelectionTools, type ActiveTools } from '@/components/composer/use-selection-tools'
import { prefixLink } from '@/utils/editor-html'
import { cn } from '@/utils/cn'
import styles from './text-tools.module.css'

/** Keep the selection (and focus) in the editor when a tool button is pressed. */
const keepSelection = (e: MouseEvent): void => e.preventDefault()

const Tools = ({ active, coordinates }: { active: ActiveTools; coordinates: { left: number; top: number } }) => {
  const [bold, setBold] = useState(active.isBoldActive)
  const [italic, setItalic] = useState(active.isItalicActive)
  const [link, setLink] = useState(active.isLinkActive)
  const [linkOpen, setLinkOpen] = useState(false)
  const [text, setText] = useState('')
  const range = useRef<Range | null>(null)

  const save = (): void => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) range.current = selection.getRangeAt(0)
  }
  const restore = (): void => {
    if (!range.current) return
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range.current)
  }
  const exec = (command: string, value?: string): void => {
    document.execCommand(command, false, value)
    save()
  }

  const toggleLink = (): void => {
    save()
    if (link && !linkOpen) {
      setLink(false)
      setText('')
      exec('unlink')
    } else {
      setLinkOpen(!linkOpen)
    }
  }

  const submitLink = (e: FormEvent): void => {
    e.preventDefault()
    restore()
    if (text.length === 0) {
      setLink(false)
      setLinkOpen(false)
      exec('unlink')
      return
    }
    setLink(true)
    setLinkOpen(false)
    requestAnimationFrame(() => exec('createLink', prefixLink(text)))
  }

  return (
    <div
      style={{ left: coordinates.left, top: coordinates.top - 40 }}
      className={cn('TextTools', styles.tools, linkOpen && ['asShowLinkForm', styles.asShowLinkForm])}
    >
      <button
        type="button"
        className={cn('TextToolButton forBold', styles.button, styles.forBold, bold && styles.isActive)}
        onMouseDown={keepSelection}
        onClick={() => {
          setBold(!bold)
          exec('bold', 'true')
        }}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={cn('TextToolButton forItalic', styles.button, styles.forItalic, italic && styles.isActive)}
        onMouseDown={keepSelection}
        onClick={() => {
          setItalic(!italic)
          exec('italic', 'true')
        }}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className={cn('TextToolButton forLink', styles.button, styles.forLink, link && styles.isActive)}
        onMouseDown={keepSelection}
        onClick={toggleLink}
      >
        <LinkIcon />
      </button>
      <form className={cn('TextToolForm', styles.form)} noValidate onSubmit={submitLink}>
        <input
          className={cn('TextToolLinkInput', styles.input)}
          placeholder="Add Link..."
          type="url"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </form>
    </div>
  )
}

/**
 * The original's TextTools, mounted in its `Popovers` layer: bold / italic / link over a text selection.
 * It remounts whenever the active states change (the original keys it by them) so its buttons follow the selection.
 */
export const TextTools = () => {
  const tools = useSelectionTools()
  if (!tools) return null
  return createPortal(
    <div className={cn('Popovers', styles.popovers)}>
      <Tools key={JSON.stringify(tools.active)} active={tools.active} coordinates={tools.coordinates} />
    </div>,
    document.body,
  )
}
