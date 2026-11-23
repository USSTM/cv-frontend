import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  NETWORK_ERROR_CODE,
  NETWORK_ERROR_MESSAGE,
  NETWORK_ERROR_STATUS,
  apiRequest,
  describeHttpStatus,
} from './client'

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

  it('replaces the browser "Failed to fetch" error with a detailed network error', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    const request = apiRequest('/catalog/items')

    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({
      code: NETWORK_ERROR_CODE,
      message: NETWORK_ERROR_MESSAGE,
      status: NETWORK_ERROR_STATUS,
    })
  })

  it('passes aborted requests through unchanged', async () => {
    vi.stubGlobal('fetch', fetchMock)
    const abort = new DOMException('The operation was aborted.', 'AbortError')
    fetchMock.mockRejectedValue(abort)

    await expect(apiRequest('/catalog/items')).rejects.toBe(abort)
  })

  it('describes an HTML gateway error page by its status instead of showing the HTML', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response('<html><body><h1>502 Bad Gateway</h1></body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      }),
    )

    await expect(apiRequest('/catalog/items')).rejects.toMatchObject({
      message: describeHttpStatus(502),
      status: 502,
    })
  })

  it('describes an empty error response by its status', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }))

    await expect(apiRequest('/catalog/items')).rejects.toMatchObject({
      message: describeHttpStatus(500),
      status: 500,
    })
  })

  it('describes a JSON error response with no message by its status', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'nope' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(apiRequest('/admin/members')).rejects.toMatchObject({
      message: describeHttpStatus(403),
      status: 403,
    })
  })

  it('keeps a short plain-text error message from the API', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response('Item is already checked out.', { status: 409 }),
    )

    await expect(
      apiRequest('/requests', { method: 'POST' }),
    ).rejects.toMatchObject({
      message: 'Item is already checked out.',
      status: 409,
    })
  })

  it('accepts a successful plain-text response', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response('Availability created.', { status: 201 }),
    )

    await expect(apiRequest('/availability', { method: 'POST' })).resolves.toBe(
      'Availability created.',
    )
  })
})
