import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { assignProfileRole, removeProfileRole } from '@/actions/category-actions'
import { useProfileRolesStore } from '@/stores/profile-roles-store'
import type { AdministeredCategory } from '@/types/category'
import type { UserRole } from '@/types/user'
import { UserRolesPanel } from './user-roles-panel'

jest.mock('@/actions/category-actions', () => ({ assignProfileRole: jest.fn(), removeProfileRole: jest.fn() }))

const assignMock = jest.mocked(assignProfileRole)
const removeMock = jest.mocked(removeProfileRole)

const ART: AdministeredCategory = { id: '1', name: 'Art', slug: 'art', role: 'CURATOR' }
const PHOTOGRAPHY: AdministeredCategory = { id: '2', name: 'Photography', slug: 'photography', role: 'MODERATOR' }
const role = (kind: UserRole['role'], category: AdministeredCategory): UserRole => ({
  id: `${category.id}-8-${kind.toLowerCase()}`,
  role: kind,
  category: { id: category.id, name: category.name, slug: category.slug },
})

const renderPanel = (roles: UserRole[], administeredCategories: AdministeredCategory[], isStaff = false) =>
  render(<UserRolesPanel userId="8" username="kofi" roles={roles} administeredCategories={administeredCategories} isStaff={isStaff} />)

const pick = async (user: ReturnType<typeof userEvent.setup>, box: string, option: string): Promise<void> => {
  await user.click(screen.getByText(box))
  await user.click(screen.getByRole('option', { name: option }))
}

describe('UserRolesPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    act(() => useProfileRolesStore.setState({ isOpen: true }))
  })

  it('renders nothing while closed', () => {
    act(() => useProfileRolesStore.setState({ isOpen: false }))
    const { container } = renderPanel([role('CURATOR', ART)], [ART])
    expect(container).toBeEmptyDOMElement()
  })

  it('only lists the roles for people who administer nothing', () => {
    renderPanel([role('CURATOR', ART)], [])
    expect(screen.getByText(/Curator in/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Art' })).toHaveAttribute('href', '/discover/art')
    expect(screen.queryByText('Choose Category')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove role' })).not.toBeInTheDocument()
  })

  it('offers a curator only the featured position and assigns it', async () => {
    const user = userEvent.setup()
    assignMock.mockResolvedValue({ ok: true, data: [role('FEATURED', ART)] })
    renderPanel([], [ART])
    const add = screen.getByRole('button', { name: 'Add' })
    expect(add).toBeDisabled()

    // no positions before a category is chosen
    await user.click(screen.getByText('Choose position'))
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    await pick(user, 'Choose Category', 'Art')
    await user.click(screen.getByText('Choose position'))
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Featured User'])
    await user.click(screen.getByRole('option', { name: 'Featured User' }))
    expect(add).toBeEnabled()

    await user.click(add)
    expect(assignMock).toHaveBeenCalledWith({ categoryId: '1', role: 'featured', userId: '8', username: 'kofi' })
    expect(await screen.findByText('Success!')).toBeInTheDocument()
    expect(screen.getByText(/Featured User in/)).toBeInTheDocument()
    expect(screen.getByText('New!')).toBeInTheDocument()
    // the form starts over
    expect(screen.getByText('Choose Category')).toBeInTheDocument()
    expect(add).toBeDisabled()
  })

  it('offers a moderator every position', async () => {
    const user = userEvent.setup()
    renderPanel([], [ART, PHOTOGRAPHY])
    await pick(user, 'Choose Category', 'Photography')
    await user.click(screen.getByText('Choose position'))
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Featured User', 'Curator', 'Moderator'])
  })

  it('keeps the list as it was when assigning fails', async () => {
    const user = userEvent.setup()
    assignMock.mockResolvedValue({ ok: false, error: 'forbidden' })
    renderPanel([], [ART])
    await pick(user, 'Choose Category', 'Art')
    await pick(user, 'Choose position', 'Featured User')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    expect(screen.queryByText(/Featured User in/)).not.toBeInTheDocument()
  })

  it('asks before removing a role, and only offers it for roles the viewer may remove', async () => {
    const user = userEvent.setup()
    removeMock.mockResolvedValue({ ok: true, data: undefined })
    renderPanel([role('CURATOR', ART), role('FEATURED', ART)], [ART])
    // a curator may only remove featured users
    const remove = screen.getByRole('button', { name: 'Remove role' })
    await user.click(remove)
    const row = screen.getByText(/Featured User in/).closest('li') as HTMLElement
    expect(within(row).getByText(/Remove @kofi from/)).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: 'No' }))
    expect(screen.queryByText(/Remove @kofi from/)).not.toBeInTheDocument()
    expect(removeMock).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Remove role' }))
    await user.click(screen.getByRole('button', { name: 'Yes' }))
    expect(removeMock).toHaveBeenCalledWith('1-8-featured', 'kofi')
    expect(screen.queryByText(/Featured User in/)).not.toBeInTheDocument()
    expect(screen.getByText(/Curator in/)).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    renderPanel([role('CURATOR', ART)], [])
    await user.keyboard('{Escape}')
    expect(useProfileRolesStore.getState().isOpen).toBe(false)
  })
})
