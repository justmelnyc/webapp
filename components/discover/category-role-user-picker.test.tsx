import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { searchRoleUsers } from '@/actions/category-actions'
import { CategoryRoleUserPicker } from './category-role-user-picker'

jest.mock('@/actions/category-actions', () => ({ searchRoleUsers: jest.fn() }))

const searchMock = jest.mocked(searchRoleUsers)
const USERS = [
  { id: '8', username: 'kofi', avatar: null },
  { id: '9', username: 'kofia', avatar: null },
  { id: '10', username: 'kofib', avatar: null },
]

const setup = () => {
  const onPick = jest.fn()
  const onClose = jest.fn()
  render(<CategoryRoleUserPicker roleType="moderators" onPick={onPick} onClose={onClose} />)
  return { onPick, onClose, input: screen.getByRole('searchbox') }
}

const selectedNames = (): string[] =>
  [...document.querySelectorAll('li.isSelected')].map((li) => li.textContent ?? '')

beforeEach(() => {
  jest.clearAllMocks()
  searchMock.mockResolvedValue({ ok: true, data: USERS })
})

describe('CategoryRoleUserPicker', () => {
  it('is titled after the role and names its field after the list', () => {
    const { input } = setup()
    expect(screen.getByRole('heading', { name: 'Add Moderator' })).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'add-moderators')
    expect(input).not.toHaveClass('has-items')
  })

  it('searches once typing pauses and lists the users without highlighting any', async () => {
    const { input } = setup()
    await userEvent.type(input, 'ko')
    expect(await screen.findByRole('button', { name: /@kofia/ })).toBeInTheDocument()
    expect(searchMock).toHaveBeenCalledTimes(1)
    expect(searchMock).toHaveBeenCalledWith('ko')
    expect(input).toHaveClass('has-items')
    expect(selectedNames()).toEqual([])
  })

  it('highlights a user once their whole name is typed', async () => {
    const { input } = setup()
    await userEvent.type(input, 'kof')
    await screen.findByRole('button', { name: /@kofia/ })
    await userEvent.type(input, 'i')
    expect(selectedNames()).toEqual(['@kofi'])
  })

  it('moves the highlight with the arrow keys, wrapping around, and picks with Enter', async () => {
    const { input, onPick } = setup()
    await userEvent.type(input, 'ko')
    await screen.findByRole('button', { name: /@kofia/ })
    await userEvent.keyboard('{ArrowDown}')
    expect(selectedNames()).toEqual(['@kofi'])
    await userEvent.keyboard('{ArrowUp}')
    expect(selectedNames()).toEqual(['@kofib'])
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(selectedNames()).toEqual(['@kofia'])
    await userEvent.keyboard('{Enter}')
    expect(onPick).toHaveBeenCalledWith(USERS[1])
    expect(input).toHaveValue('kofia')
  })

  it('picks the clicked user', async () => {
    const { input, onPick } = setup()
    await userEvent.type(input, 'ko')
    await userEvent.click(await screen.findByRole('button', { name: /@kofib/ }))
    expect(onPick).toHaveBeenCalledWith(USERS[2])
  })

  it('clears the results when the field is emptied', async () => {
    const { input } = setup()
    await userEvent.type(input, 'ko')
    await screen.findByRole('button', { name: /@kofia/ })
    await userEvent.clear(input)
    expect(screen.queryByRole('button', { name: /@kofia/ })).not.toBeInTheDocument()
  })

  it('closes from the X, the mask and Escape, but Escape leaves results alone', async () => {
    const { input, onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await userEvent.click(screen.getByRole('presentation'))
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
    await userEvent.type(input, 'ko')
    await screen.findByRole('button', { name: /@kofia/ })
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('ignores an answer that arrives after a newer search', async () => {
    let resolveFirst: (value: { ok: true; data: typeof USERS }) => void = () => undefined
    searchMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve
      }),
    )
    searchMock.mockResolvedValueOnce({ ok: true, data: [USERS[2]!] })
    const { input } = setup()
    await userEvent.type(input, 'ko')
    await waitFor(() => expect(searchMock).toHaveBeenCalledTimes(1))
    await userEvent.type(input, 'fib')
    await screen.findByRole('button', { name: /@kofib/ })
    await act(async () => resolveFirst({ ok: true, data: USERS }))
    expect(screen.queryByRole('button', { name: /@kofia/ })).not.toBeInTheDocument()
  })
})
