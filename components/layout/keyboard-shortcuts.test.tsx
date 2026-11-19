import { act, render, screen } from '@testing-library/react'
import { KeyboardShortcuts } from './keyboard-shortcuts'
import { useLayoutModeStore } from './layout-mode-store'

const push = jest.fn()
let mockPathname = '/'
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => mockPathname,
}))

const press = (key: string, init: KeyboardEventInit = {}, target: Document | HTMLElement = document): void => {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
  })
}

describe('KeyboardShortcuts', () => {
  beforeEach(() => {
    push.mockReset()
    mockPathname = '/'
    useLayoutModeStore.setState({ mode: 'grid' })
  })

  it('navigates with the original keys while logged in', () => {
    render(<KeyboardShortcuts isLoggedIn />)
    const expected: Record<string, string> = {
      a: '/invites', e: '/', f: '/following', s: '/search', r: '/notifications', d: '/discover',
    }
    for (const [key, path] of Object.entries(expected)) {
      press(key)
      expect(push).toHaveBeenLastCalledWith(path)
    }
  })

  it('d returns to the last discover stream and forgets it on logout', () => {
    mockPathname = '/discover/trending'
    const { rerender } = render(<KeyboardShortcuts isLoggedIn />)
    mockPathname = '/following'
    rerender(<KeyboardShortcuts isLoggedIn />)
    press('d')
    expect(push).toHaveBeenLastCalledWith('/discover/trending')
    rerender(<KeyboardShortcuts isLoggedIn={false} />)
    rerender(<KeyboardShortcuts isLoggedIn />)
    press('d')
    expect(push).toHaveBeenLastCalledWith('/discover')
  })

  it('ignores typing, modifiers and (except =) a logged out viewer', () => {
    const { rerender } = render(<KeyboardShortcuts isLoggedIn />)
    const input = document.createElement('input')
    document.body.appendChild(input)
    press('f', {}, input)
    press('f', { metaKey: true })
    expect(push).not.toHaveBeenCalled()
    rerender(<KeyboardShortcuts isLoggedIn={false} />)
    press('f')
    press('?')
    expect(push).not.toHaveBeenCalled()
    expect(screen.queryByText('Key Commands')).toBeNull()
    press('=')
    expect(useLayoutModeStore.getState().mode).toBe('list')
  })

  it('? opens the help dialog, ? again and Escape close it', () => {
    render(<KeyboardShortcuts isLoggedIn />)
    press('?')
    expect(screen.getByText('Key Commands')).toBeInTheDocument()
    expect(screen.getByText('Navigate to editorial')).toBeInTheDocument()
    press('?')
    expect(screen.queryByText('Key Commands')).toBeNull()
    press('?')
    press('Escape', {}, screen.getByRole('dialog'))
    expect(screen.queryByText('Key Commands')).toBeNull()
  })
})
