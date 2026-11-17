/** What a Server Action returns, so callers can show errors without try/catch. */
export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string }

export const success = <T>(data: T): ActionResult<T> => ({ ok: true, data })
export const failure = (error: string): ActionResult<never> => ({ ok: false, error })
