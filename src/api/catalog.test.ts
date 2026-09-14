import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createCatalogItem,
  deleteCatalogItem,
  updateCatalogItem,
} from './catalog'

const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

function mockResponse(payload: unknown = {}) {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(() =>
    Promise.resolve(new Response(JSON.stringify(payload))),
  )
}

describe('catalog API', () => {
  it('creates, updates, and deletes Catalog items', async () => {
    const item = {
      id: 'item-1',
      name: 'Camera',
      description: 'Mirrorless camera',
      type: 'medium' as const,
      stock: 3,
    }
    mockResponse(item)

    await createCatalogItem(item)
    await updateCatalogItem({ ...item, stock: 2 })
    await deleteCatalogItem(item.id)

    expect(fetchMock.mock.calls[0]).toEqual([
      new URL('/items', 'http://localhost:8080'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(item) }),
    ])
    expect(fetchMock.mock.calls[1]).toEqual([
      new URL('/items/item-1', 'http://localhost:8080'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ ...item, stock: 2 }),
      }),
    ])
    expect(fetchMock.mock.calls[2]).toEqual([
      new URL('/items/item-1', 'http://localhost:8080'),
      expect.objectContaining({ method: 'DELETE' }),
    ])
  })
})
