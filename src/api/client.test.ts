import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './client'

const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('apiRequest', () => {
  it('sends cookie credentials and JSON request data', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'OTP sent.' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await apiRequest('/auth/request-otp', {
      method: 'POST',
      body: { email: 'member@example.com' },
    })

    const [url, options] = fetchMock.mock.calls[0] ?? []
    expect(url).toEqual(new URL('/auth/request-otp', 'http://localhost:8080'))
    expect(options).toMatchObject({
      body: JSON.stringify({ email: 'member@example.com' }),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })

  it('preserves API error status and details', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: 'AUTHENTICATION_REQUIRED', message: 'Sign in first.' },
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(apiRequest('/members/me')).rejects.toMatchObject({
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Sign in first.',
      status: 401,
    })
  })

  it('refreshes the cookie session and retries a protected request after a 401', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { code: 'AUTHENTICATION_REQUIRED', message: 'Expired.' },
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Session refreshed.' }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'member-1' }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    await expect(apiRequest('/members/me')).resolves.toEqual({ id: 'member-1' })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      new URL('/members/me', 'http://localhost:8080'),
      new URL('/auth/refresh', 'http://localhost:8080'),
      new URL('/members/me', 'http://localhost:8080'),
    ])
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      credentials: 'include',
      method: 'POST',
    })
  })

  it('returns undefined for an empty response', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(
      apiRequest<void>('/auth/logout', { method: 'POST' }),
    ).resolves.toBeUndefined()
  })
})
