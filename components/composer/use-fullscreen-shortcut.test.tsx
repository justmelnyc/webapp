import { act, renderHook } from '@testing-library/react'
import { useFullscreenShortcut } from './use-fullscreen-shortcut'

const press = (key: string, target: Document | HTMLElement = document): void => {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
}

describe('useFullscreenShortcut', () => {
  it('toggles on the g m sequence and off again', () => {
    const { result } = renderHook(() => useFullscreenShortcut(true))
    press('g')
    press('m')
    expect(result.current).toBe(true)
    press('g')
    press('m')
    expect(result.current).toBe(false)
  })

  it('ignores other sequences, typing in fields and a closed omnibar', () => {
    const { result } = renderHook(() => useFullscreenShortcut(true))
    press('m')
    press('g')
    press('x')
    expect(result.current).toBe(false)
    const input = document.createElement('input')
    document.body.appendChild(input)
    press('g', input)
    press('m', input)
    expect(result.current).toBe(false)
    const closed = renderHook(() => useFullscreenShortcut(false))
    press('g')
    press('m')
    expect(closed.result.current).toBe(false)
  })
})
