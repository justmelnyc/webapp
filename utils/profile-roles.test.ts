import type { AdministeredCategory } from '@/types/category'
import type { UserRole } from '@/types/user'
import { canRemoveRole, mergeRoles, roleOptionsFor } from './profile-roles'

const art: AdministeredCategory = { id: '1', name: 'Art', slug: 'art', role: 'CURATOR' }
const photography: AdministeredCategory = { id: '2', name: 'Photography', slug: 'photography', role: 'MODERATOR' }
const role = (id: string, kind: UserRole['role'], category: AdministeredCategory): UserRole => ({
  id,
  role: kind,
  category: { id: category.id, name: category.name, slug: category.slug },
})

describe('profile roles', () => {
  it('offers the positions the viewer may hand out in the chosen category', () => {
    expect(roleOptionsFor(art, false).map((option) => option.id)).toEqual(['FEATURED'])
    expect(roleOptionsFor(photography, false).map((option) => option.id)).toEqual(['FEATURED', 'CURATOR', 'MODERATOR'])
    expect(roleOptionsFor(null, false)).toEqual([])
    expect(roleOptionsFor({ ...art, role: null }, false)).toEqual([])
  })

  it('offers staff every position, even before a category is chosen', () => {
    expect(roleOptionsFor(null, true)).toHaveLength(3)
    expect(roleOptionsFor(art, true)).toHaveLength(3)
  })

  it('lets moderators remove any role and curators only featured users, in their own categories', () => {
    expect(canRemoveRole(role('a', 'MODERATOR', photography), [photography], false)).toBe(true)
    expect(canRemoveRole(role('b', 'FEATURED', art), [art], false)).toBe(true)
    expect(canRemoveRole(role('c', 'CURATOR', art), [art], false)).toBe(false)
    expect(canRemoveRole(role('d', 'FEATURED', photography), [art], false)).toBe(false)
    expect(canRemoveRole(role('e', 'FEATURED', art), [], false)).toBe(false)
    expect(canRemoveRole(role('f', 'MODERATOR', photography), [], true)).toBe(true)
  })

  it('appends new roles and keeps the listed ones in place', () => {
    const listed = [role('2', 'FEATURED', art)]
    const fresh = [role('1', 'MODERATOR', photography), role('2', 'FEATURED', art)]
    expect(mergeRoles(listed, fresh).map((entry) => entry.id)).toEqual(['2', '1'])
    expect(mergeRoles([], fresh).map((entry) => entry.id)).toEqual(['1', '2'])
  })
})
