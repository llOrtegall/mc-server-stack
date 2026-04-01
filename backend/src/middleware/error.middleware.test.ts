import { describe, expect, it } from 'bun:test'
import { AppError } from './error.middleware'

describe('AppError', () => {
  it('should set statusCode and message', () => {
    const error = new AppError(404, 'Not found')
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Not found')
  })

  it('should be an instance of Error', () => {
    const error = new AppError(500, 'Internal error')
    expect(error).toBeInstanceOf(Error)
  })

  it('should have name AppError', () => {
    const error = new AppError(401, 'Unauthorized')
    expect(error.name).toBe('AppError')
  })
})
