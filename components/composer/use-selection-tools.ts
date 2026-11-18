'use client'

import { useEffect, useState } from 'react'

export interface ActiveTools {
  isBoldActive: boolean
  isItalicActive: boolean
  isLinkActive: boolean
}

export interface SelectionTools {
  coordinates: { left: number; top: number }
  active: ActiveTools
}

const TOOL_CLASSES = ['TextToolButton', 'TextToolForm', 'TextToolLinkInput']

/** The original's `selectionIsText`: the selection's focus sits inside an `.editable.text` block. */
const selectionIsText = (): boolean => {
  let node: Node | null = window.getSelection()?.focusNode ?? null
  while (node) {
    if (node instanceof HTMLElement && node.classList.contains('text')) return true
    node = node.parentNode
  }
  return false
}

/** The original's `getActiveTextTools`. */
const activeTools = (range: Range): ActiveTools => {
  const parent = range.commonAncestorContainer.parentNode
  return {
    isLinkActive: parent?.nodeName.toLowerCase() === 'a' || range.cloneContents().querySelectorAll('a').length > 0,
    isBoldActive: document.queryCommandEnabled('bold') && document.queryCommandState('bold'),
    isItalicActive: document.queryCommandEnabled('italic') && document.queryCommandState('italic'),
  }
}

/**
 * The original's InputComponent: after a key or mouse release, a non-empty selection inside a text block shows
 * the tools at the selection; anything else hides them. Returns null while hidden.
 */
export const useSelectionTools = (): SelectionTools | null => {
  const [tools, setTools] = useState<SelectionTools | null>(null)

  useEffect(() => {
    const refresh = (): void => {
      const selection = window.getSelection()
      if (!selectionIsText() || !selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
        setTools(null)
        return
      }
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setTools({ coordinates: { left: Math.round(rect.left), top: Math.round(rect.top) }, active: activeTools(range) })
    }
    const onKeyUp = (): void => {
      if (selectionIsText()) refresh()
    }
    const onMouseUp = (e: MouseEvent): void => {
      const target = e.target instanceof HTMLElement ? e.target : null
      if (target?.classList.contains('PostActionButton')) setTools(null)
      else if (selectionIsText()) requestAnimationFrame(refresh)
      else if (!target || !TOOL_CLASSES.some((name) => target.classList.contains(name))) setTools(null)
    }
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return tools
}
