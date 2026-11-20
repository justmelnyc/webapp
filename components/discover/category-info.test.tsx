import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { addCategoryRole, removeCategoryRole, searchRoleUsers } from '@/actions/category-actions'
import { useCategoryDrawerStore } from '@/stores/category-drawer-store'
import type { CategoryDetails, CategoryUser } from '@/types/category'
import { CategoryDrawerProvider } from './category-drawer'
import { CategoryInfo } from './category-info'
import type { RoleViewer } from './category-users'

jest.mock('@/actions/category-actions', () => ({
  addCategoryRole: jest.fn(),
  removeCategoryRole: jest.fn(),
  searchRoleUsers: jest.fn(),
  subscribeToCategories: jest.fn(),
}))
jest.mock('@/components/auth/registration-dialog', () => ({
  useRegistrationDialog: () => ({ open: jest.fn() }),
}))
jest.mock('@/actions/relationship-actions', () => ({ setFollowing: jest.fn() }))

const addMock = jest.mocked(addCategoryRole)
const removeMock = jest.mocked(removeCategoryRole)
const searchMock = jest.mocked(searchRoleUsers)

const roleUser = (id: string, username: string, role: CategoryUser['role']): CategoryUser => ({
  id: `1-${id}-${role.toLowerCase()}`,
  role,
  user: { id, username, currentUserState: { relationshipPriority: 'none' } },
})

const art: CategoryDetails = {
  id: '1',
  name: 'Art',
  slug: 'art',
  description: 'Art on mock Ello',
  categoryUsers: [roleUser('1', 'ada', 'CURATOR'), roleUser('8', 'kofi', 'CURATOR')],
}

const VISITOR: RoleViewer = { id: null, canAssign: false }
const ADA: RoleViewer = { id: '1', canAssign: true }

const renderInfo = (viewer = VISITOR, category = art, isCloseable = true) =>
  render(
    <CategoryDrawerProvider isCloseable={isCloseable}>
      <CategoryInfo category={category} cta={{ text: 'Join', url: '/join' }} viewer={viewer} />
    </CategoryDrawerProvider>,
  )

beforeEach(() => {
  jest.clearAllMocks()
  useCategoryDrawerStore.setState({ isOpen: false })
})

describe('CategoryInfo', () => {
  it('starts as the Info trigger and opens the panel', async () => {
    renderInfo()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTitle('Art info'))
    const panel = screen.getByRole('complementary')
    expect(within(panel).getByRole('heading', { name: 'Info' })).toBeInTheDocument()
    expect(within(panel).getByText('Art on mock Ello')).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Join' })).toHaveAttribute('href', '/join')
    expect(within(panel).getByRole('button', { name: 'Subscribe' })).toBeInTheDocument()
    await userEvent.click(screen.getByTitle('Close Art info'))
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })

  it('lists curators, and leaves out a list with nobody in it', () => {
    useCategoryDrawerStore.setState({ isOpen: true })
    renderInfo()
    expect(screen.getByRole('heading', { name: 'Curators' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Moderators' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /@ada/ })).toHaveAttribute('href', '/ada')
    expect(screen.getByRole('link', { name: /@kofi/ })).toHaveAttribute('href', '/kofi')
  })

  it('offers visitors a follow toggle and no role buttons', () => {
    useCategoryDrawerStore.setState({ isOpen: true })
    renderInfo()
    expect(screen.getAllByRole('button', { name: 'Follow' })).toHaveLength(2)
    expect(screen.queryByTitle('Add Curator')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Remove Curator')).not.toBeInTheDocument()
  })

  it('lets a role administrator remove everyone but themselves', async () => {
    useCategoryDrawerStore.setState({ isOpen: true })
    removeMock.mockResolvedValue({ ok: true, data: undefined })
    renderInfo(ADA)
    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument()
    expect(screen.getAllByTitle('Remove Curator')).toHaveLength(1)
    await userEvent.click(screen.getByTitle('Remove Curator'))
    expect(removeMock).toHaveBeenCalledWith('1-8-curator')
    expect(screen.queryByRole('link', { name: /@kofi/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /@ada/ })).toBeInTheDocument()
  })

  it('puts a user back when removing them fails', async () => {
    useCategoryDrawerStore.setState({ isOpen: true })
    removeMock.mockResolvedValue({ ok: false, error: 'forbidden' })
    renderInfo(ADA)
    await userEvent.click(screen.getByTitle('Remove Curator'))
    expect(await screen.findByRole('link', { name: /@kofi/ })).toBeInTheDocument()
  })

  it('adds the picked user as a curator', async () => {
    useCategoryDrawerStore.setState({ isOpen: true })
    searchMock.mockResolvedValue({ ok: true, data: [{ id: '6', username: 'noor', avatar: null }] })
    addMock.mockResolvedValue({
      ok: true,
      data: [...(art.categoryUsers ?? []), roleUser('6', 'noor', 'CURATOR')],
    })
    renderInfo(ADA)
    await userEvent.click(screen.getByTitle('Add Curator'))
    const dialog = screen.getByRole('dialog', { name: 'Add Curator' })
    await userEvent.type(within(dialog).getByRole('searchbox'), 'no')
    await userEvent.click(await within(dialog).findByRole('button', { name: /@noor/ }))
    expect(addMock).toHaveBeenCalledWith({
      userId: '6',
      categoryId: '1',
      role: 'curator',
      slug: 'art',
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /@noor/ })).toBeInTheDocument()
  })

  it('keeps a brand category open with nothing to close it', () => {
    renderInfo(VISITOR, { ...art, brandAccount: { id: '9', username: 'brand' } }, false)
    expect(screen.getByRole('complementary')).toBeInTheDocument()
    expect(screen.getByTitle('Close Art info').querySelector('.icon')).toBeNull()
  })
})
