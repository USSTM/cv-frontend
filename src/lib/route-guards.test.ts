import { isRedirect } from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { redirectIfAuthenticated, requireAuth } from './route-guards'

function queryClientFor(result: Promise<unknown>) {
  return {
    ensureQueryData: vi.fn(() => result),
  } as never
}

describe('route guards', () => {
  it('redirects an unauthenticated visitor to login', async () => {
    const queryClient = queryClientFor(
      Promise.reject(new ApiError(401, 'Sign in first.')),
    )

    await expect(requireAuth({ context: { queryClient } })).rejects.toSatisfy(
      (error: unknown) =>
        isRedirect(error) && error.options.to === '/login',
    )
  })

  it('redirects an authenticated visitor away from login', async () => {
    const queryClient = queryClientFor(Promise.resolve({ id: 'member-1' }))

    await expect(
      redirectIfAuthenticated({ context: { queryClient } }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        isRedirect(error) && error.options.to === '/activity',
    )
  })
})
