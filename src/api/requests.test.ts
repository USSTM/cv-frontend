import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPendingRequests, reviewRequest } from './requests'

const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

describe('request API', () => {
  it('loads the pending Request queue', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: [], meta: {} })),
    )

    await getPendingRequests()

    expect(fetchMock.mock.calls[0]?.[0]).toEqual(
      new URL('/requests/pending', 'http://localhost:8080'),
    )
  })

  it('submits the approval payload expected by the backend', async () => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: 'request-1' })),
    )

    await reviewRequest('request-1', {
      status: 'approved',
      availability_id: 'availability-1',
      pickup_location: 'Vault desk',
      return_location: 'Vault desk',
    })

    expect(fetchMock.mock.calls[0]).toEqual([
      new URL('/requests/request-1/review', 'http://localhost:8080'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          status: 'approved',
          availability_id: 'availability-1',
          pickup_location: 'Vault desk',
          return_location: 'Vault desk',
        }),
      }),
    ])
  })
})
