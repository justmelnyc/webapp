import { create } from 'zustand'

/** The invite a logged-out visitor pressed SUBMIT on (the original's `gui.onboardToArtistInvite`). */
export interface OnboardInvite {
  id: string
  title: string
  slug: string
}

interface OnboardInviteState {
  /** Set when SUBMIT opens the sign-up dialog: onboarding returns to this invite when it ends. */
  invite: OnboardInvite | null
  /** Set when onboarding ended: the invite page opens the omnibar once and clears it. */
  isCompleting: boolean
  start: (invite: OnboardInvite) => void
  complete: () => void
  reset: () => void
}

/**
 * Carries a visitor from SUBMIT through sign-up and onboarding back to the invite. Like the original's
 * redux state it lives in memory only: the app is never reloaded between those steps.
 */
export const useOnboardInviteStore = create<OnboardInviteState>((set) => ({
  invite: null,
  isCompleting: false,
  start: (invite) => set({ invite }),
  complete: () => set({ invite: null, isCompleting: true }),
  reset: () => set({ invite: null, isCompleting: false }),
}))

/** Where an onboarding step ends: the invite that started it (completing the flow), or `fallback`. */
export const finishOnboarding = (fallback: string): string => {
  const { invite, complete } = useOnboardInviteStore.getState()
  if (!invite) return fallback
  complete()
  return `/invites/${invite.slug}`
}
