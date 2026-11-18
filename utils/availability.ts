import { EMAIL_ERRORS, USERNAME_ERRORS, type Availability } from '@/lib/schemas/profile'

/** The original's form control states (constants/status_types.js), as the rewrite's FormControl names them. */
export type CheckStatus = 'indeterminate' | 'request' | 'failure' | 'success'

export interface CheckState {
  status: CheckStatus
  message: string
  suggestions: string[]
}

export const INDETERMINATE: CheckState = { status: 'indeterminate', message: '', suggestions: [] }
export const CHECKING: CheckState = { status: 'request', message: 'checking...', suggestions: [] }

/** The original's `getUsernameStateFromClient`: failures need no round trip. */
export const usernameClientError = (value: string): string | null => {
  if (/\s/.test(value)) return USERNAME_ERRORS.spaces
  if (!/^[a-zA-Z0-9\-_]+$/.test(value)) return USERNAME_ERRORS.invalidCharacters
  return null
}

/** The original's `isValidEmail`. */
export const emailClientError = (value: string): string | null =>
  /(.+)@(.+)\.([a-z]{2,})/.test(value) ? null : EMAIL_ERRORS.invalid

/** The original's `getUsernameStateFromServer`. */
export const usernameFromServer = (availability: Availability): CheckState =>
  availability.username
    ? { status: 'success', message: '', suggestions: [] }
    : { status: 'failure', message: USERNAME_ERRORS.exists, suggestions: availability.suggestions.username ?? [] }

/** The original's `getEmailStateFromServer`. */
export const emailFromServer = (availability: Availability): CheckState => {
  if (availability.email) return { status: 'success', message: '', suggestions: [] }
  const full = availability.suggestions.email?.full
  return { status: 'failure', message: full ? `Did you mean ${full}?` : 'That email is invalid', suggestions: [] }
}
