import { afterEach, describe, expect, it, vi } from 'vitest'
import { acceptInvitation, logout, verifyOtp } from './auth'
import { getCurrentMember } from './member'

const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

function mockJsonResponse(payload: unknown) {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

describe('cookie-session endpoints', () => {
  it('returns the cookie-session confirmation after OTP verification', async () => {
    mockJsonResponse({ message: 'Session established.' })

    await expect(
      verifyOtp({ email: 'member@example.com', code: '123456' }),
    ).resolves.toEqual({ message: 'Session established.' })
  })

  it('reads the current Member through the cookie-aware transport', async () => {
    mockJsonResponse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'member@example.com',
      roles: [{ name: 'member', scope: 'group' }],
      groups: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'USSTM',
          roles: ['member'],
        },
      ],
    })

    await getCurrentMember()

    const [url, options] = fetchMock.mock.calls[0] ?? []
    expect(url).toEqual(new URL('/members/me', 'http://localhost:8080'))
    expect(options).toMatchObject({ credentials: 'include' })
  })

  it('logs out without sending a refresh token in the request body', async () => {
    mockJsonResponse({ message: 'Logged out.' })

    await expect(logout()).resolves.toEqual({ message: 'Logged out.' })

    const [, options] = fetchMock.mock.calls[0] ?? []
    expect(options).toMatchObject({
      credentials: 'include',
      method: 'POST',
    })
    expect(options?.body).toBeUndefined()
  })

  it('accepts an invitation before the member signs in', async () => {
    mockJsonResponse({ message: 'Invitation accepted.' })

    await acceptInvitation({ code: 'a'.repeat(32) })

    expect(fetchMock.mock.calls[0]).toEqual([
      new URL('/auth/invitations/accept', 'http://localhost:8080'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: 'a'.repeat(32) }),
      }),
    ])
  })
})
