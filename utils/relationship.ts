/** Priorities the viewer can hold toward another user (RELATIONSHIP_PRIORITY in the original). */
export type Priority = 'self' | 'friend' | 'noise' | 'inactive' | 'block' | 'mute' | 'none'

export const isBlockedOrMuted = (priority: string | null | undefined): boolean =>
  priority === 'block' || priority === 'mute'

/**
 * RelationshipContainer.getNextBlockMutePriority: choosing Block or Mute while already blocked or muted
 * lifts it (back to `inactive`); otherwise it applies the requested one.
 */
export const getNextBlockMutePriority = (
  current: string | null | undefined,
  requested: 'block' | 'mute',
): 'block' | 'mute' | 'inactive' => (isBlockedOrMuted(current) ? 'inactive' : requested)
