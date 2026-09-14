import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createCatalogItem,
  deleteCatalogItem,
  deleteCatalogItemImage,
  updateCatalogItem,
  uploadCatalogItemImage,
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

  it('uploads an image using multipart form data', async () => {
    mockResponse({ id: 'image-1' })
    const image = new File(['image-data'], 'camera.jpg', {
      type: 'image/jpeg',
    })

    await uploadCatalogItemImage({
      itemId: 'item-1',
      image,
    })

    const [url, options] = fetchMock.mock.calls[0] ?? []
    expect(url).toEqual(
      new URL('/items/item-1/images', 'http://localhost:8080'),
    )
    expect(options).toEqual(expect.objectContaining({ method: 'POST' }))
    expect(options?.body).toBeInstanceOf(FormData)
  })

  it('removes an image', async () => {
    mockResponse()

    await deleteCatalogItemImage({ itemId: 'item-1', imageId: 'image-1' })

    expect(fetchMock.mock.calls[0]).toEqual([
      new URL('/items/item-1/images/image-1', 'http://localhost:8080'),
      expect.objectContaining({ method: 'DELETE' }),
    ])
  })
})
