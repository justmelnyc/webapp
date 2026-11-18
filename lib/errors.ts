/** An API call failed. `status` is the HTTP status (0 if the request never completed). */
export class ApiError extends Error {
  readonly status: number
  /** The raw response body (kept so callers can read structured validation errors). */
  readonly detail: string

  constructor(status: number, message: string, detail = '') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Please log in') {
    super(401, message)
    this.name = 'UnauthorizedError'
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong'
