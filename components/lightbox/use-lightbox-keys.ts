'use client'

import { useKeyboardShortcuts } from '@/components/layout/use-keyboard-shortcuts'
import { SHORTCUT_KEYS } from '@/constants/shortcut-keys'
import type { Direction } from './lightbox-queue'

interface LightboxKeys {
  onClose: () => void
  onAdvance: (direction: Direction) => void
}

/**
 * The keys the original binds while a lightbox is open (LightBoxContainer.bindKeys): Esc / 5 close,
 * the arrows, j k, [ ] and 4 6 step through the queue. The post tools bind `l` themselves.
 */
export const useLightboxKeys = ({ onClose, onAdvance }: LightboxKeys): void => {
  const bindings: Record<string, () => void> = {}
  for (const key of SHORTCUT_KEYS.ESC) bindings[key] = onClose
  for (const key of SHORTCUT_KEYS.NEXT) bindings[key] = () => onAdvance('next')
  for (const key of SHORTCUT_KEYS.PREV) bindings[key] = () => onAdvance('prev')
  useKeyboardShortcuts(bindings)
}
