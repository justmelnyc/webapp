import type { AdministeredCategory } from '@/types/category'
import type { UserRole } from '@/types/user'

type Role = UserRole['role']

/** A position the Community Roles form offers, and the role one needs in the category to hand it out (`userRoles`). */
export interface RoleOption {
  id: Role
  name: string
  requires: Array<NonNullable<AdministeredCategory['role']>>
}

export const ROLE_OPTIONS: RoleOption[] = [
  { id: 'FEATURED', name: 'Featured User', requires: ['CURATOR', 'MODERATOR'] },
  { id: 'CURATOR', name: 'Curator', requires: ['MODERATOR'] },
  { id: 'MODERATOR', name: 'Moderator', requires: ['MODERATOR'] },
]

export const ROLE_NAMES: Record<Role, string> = {
  FEATURED: 'Featured User',
  CURATOR: 'Curator',
  MODERATOR: 'Moderator',
}

/**
 * The positions on offer once a category is chosen: staff get all of them, other people those their own
 * role in that category allows. Like the original, nothing is offered before a category is chosen.
 */
export const roleOptionsFor = (category: AdministeredCategory | null, isStaff: boolean): RoleOption[] =>
  ROLE_OPTIONS.filter((option) => isStaff || (!!category?.role && option.requires.includes(category.role)))

/** `canDelete`: moderators remove any role of their category, curators only its featured users. */
export const canRemoveRole = (role: UserRole, administered: AdministeredCategory[], isStaff: boolean): boolean => {
  if (isStaff) return true
  const mine = administered.find((category) => category.slug === role.category.slug)?.role
  return mine === 'MODERATOR' || (mine === 'CURATOR' && role.role === 'FEATURED')
}

/** The roles after an assignment: what was listed keeps its place, new ones go last (the original appends). */
export const mergeRoles = (current: UserRole[], fresh: UserRole[]): UserRole[] => [
  ...current,
  ...fresh.filter((role) => !current.some((known) => known.id === role.id)),
]
