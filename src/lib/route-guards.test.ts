import { isRedirect } from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  beforeEach(() => {
    vi.stubGlobal('window', {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defers session checks during SSR', async () => {
    vi.stubGlobal('window', undefined)
    const ensureQueryData = vi.fn()

    await expect(
      requireAuth({ context: { queryClient: { ensureQueryData } as never } }),
    ).resolves.toBeUndefined()
    await expect(
      redirectIfAuthenticated({
        context: { queryClient: { ensureQueryData } as never },
      }),
    ).resolves.toBeUndefined()
    expect(ensureQueryData).not.toHaveBeenCalled()
  })

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
      (error: unknown) => isRedirect(error) && error.options.to === '/activity',
    )
  })

  it('allows only Group Admins into Group Admin routes', async () => {
    const queryClient = queryClientFor(
      Promise.resolve({
        id: 'member-1',
        roles: [],
        groups: [{ id: 'group-1', roles: ['group_admin'] }],
      }),
    )

    await expect(
      requireGroupAdmin({ context: { queryClient } }),
    ).resolves.toBeUndefined()
  })

  it('redirects members away from Group Admin routes', async () => {
    const queryClient = queryClientFor(
      Promise.resolve({
        id: 'member-1',
        roles: [],
        groups: [{ id: 'group-1', roles: ['member'] }],
      }),
    )

    await expect(
      requireGroupAdmin({ context: { queryClient } }),
    ).rejects.toSatisfy(
      (error: unknown) => isRedirect(error) && error.options.to === '/activity',
    )
  })

  it('allows Global Admins into Global Admin routes', async () => {
    const queryClient = queryClientFor(
      Promise.resolve({
        id: 'member-1',
        roles: [{ name: 'global_admin', scope: 'global' }],
        groups: [],
      }),
    )

    await expect(
      requireGlobalAdmin({ context: { queryClient } }),
    ).resolves.toBeUndefined()
  })

  it('redirects non-Global Admins away from Global Admin routes', async () => {
    const queryClient = queryClientFor(
      Promise.resolve({ id: 'member-1', roles: [], groups: [] }),
    )

    await expect(
      requireGlobalAdmin({ context: { queryClient } }),
    ).rejects.toSatisfy(
      (error: unknown) => isRedirect(error) && error.options.to === '/activity',
    )
  })
})
