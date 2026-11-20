import type { Viewer } from '@/types/user'

/** Which list of a category a role belongs to (the original's `roleType`). */
export type RoleType = 'curators' | 'moderators'

type RoleViewer = Pick<Viewer, 'isStaff' | 'links'> | null | undefined

const administeredIds = (viewer: RoleViewer): string[] => viewer?.links?.categories ?? []

/** `selectIsRoleAdministrator`: staff, or anyone the API lists categories for. */
export const isRoleAdministrator = (viewer: RoleViewer): boolean =>
  !!viewer && (!!viewer.isStaff || administeredIds(viewer).length > 0)

/**
 * `selectHasRoleAssignmentAccess`: staff may change the roles of every category, other people
 * those of the categories in their profile's `links.categories`. The original reads the same
 * list for curators and for moderators, so access never depends on the kind of role.
 */
export const canAssignRoles = (viewer: RoleViewer, categoryId: string): boolean =>
  !!viewer && (!!viewer.isStaff || administeredIds(viewer).includes(categoryId))

/** The role the API stores for a list (`ROLES` in CategoryRolesContainer). */
export const roleOf = (roleType: RoleType): 'curator' | 'moderator' =>
  roleType === 'curators' ? 'curator' : 'moderator'

/** 'Curator' / 'Moderator', as the buttons and the dialog name it. */
export const roleName = (roleType: RoleType): string =>
  roleType === 'curators' ? 'Curator' : 'Moderator'
