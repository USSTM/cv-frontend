import { isRedirect } from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import {
  redirectIfAuthenticated,
  requireAuth,
  requireGlobalAdmin,
  requireGroupAdmin,
} from './route-guards'

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
      (error: unknown) => isRedirect(error) && error.options.to === '/login',
    )
  })

  it('redirects an authenticated visitor away from login', async () => {
    const queryClient = queryClientFor(Promise.resolve({ id: 'member-1' }))

    await expect(
      redirectIfAuthenticated({ context: { queryClient } }),
    ).rejects.toSatisfy(
      (error: unknown) => isRedirect(error) && error.options.to === '/',
    )
  })

  it('keeps admin shells restricted to their respective roles', async () => {
    const groupAdmin = {
      id: 'member-1',
      roles: [],
      groups: [{ id: 'group-1', name: 'Group 1', roles: ['group_admin'] }],
    }
    const globalAdmin = {
      id: 'member-2',
      roles: [{ name: 'global_admin', scope: 'global' }],
      groups: [],
    }

    await expect(
      requireGroupAdmin({
        context: { queryClient: queryClientFor(Promise.resolve(groupAdmin)) },
      }),
    ).resolves.toBeUndefined()
    await expect(
      requireGlobalAdmin({
        context: { queryClient: queryClientFor(Promise.resolve(globalAdmin)) },
      }),
    ).resolves.toBeUndefined()
    await expect(
      requireGlobalAdmin({
        context: { queryClient: queryClientFor(Promise.resolve(groupAdmin)) },
      }),
    ).rejects.toSatisfy(
      (error: unknown) => isRedirect(error) && error.options.to === '/',
    )
  })
})
