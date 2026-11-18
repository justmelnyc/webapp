import { ApiError, errorMessage, isApiError, NotFoundError, UnauthorizedError } from './errors'

describe('errors', () => {
  it('ApiError carries status and name', () => {
    const error = new ApiError(500, 'boom')
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(500)
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('boom')
  })

  it('NotFoundError defaults to 404', () => {
    const error = new NotFoundError()
    expect(error.status).toBe(404)
    expect(error.name).toBe('NotFoundError')
    expect(error.message).toBe('Not found')
    expect(new NotFoundError('gone').message).toBe('gone')
  })

  it('UnauthorizedError defaults to 401', () => {
    const error = new UnauthorizedError()
    expect(error.status).toBe(401)
    expect(error.message).toBe('Please log in')
  })

  it('isApiError narrows subclasses only', () => {
    expect(isApiError(new NotFoundError())).toBe(true)
    expect(isApiError(new UnauthorizedError())).toBe(true)
    expect(isApiError(new Error('x'))).toBe(false)
    expect(isApiError({ status: 404 })).toBe(false)
    expect(isApiError(null)).toBe(false)
  })

  it('errorMessage uses Error messages and falls back otherwise', () => {
    expect(errorMessage(new Error('bad'))).toBe('bad')
    expect(errorMessage(new NotFoundError())).toBe('Not found')
    expect(errorMessage('str')).toBe('Something went wrong')
    expect(errorMessage(undefined)).toBe('Something went wrong')
  })
})
