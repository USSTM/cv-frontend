import type {
  CartItemResponse,
  CheckoutCartResponse,
  ItemImage,
  ItemPostRequest,
  ItemResponse,
  ItemType,
  PaginatedItemResponse,
  PreCheckoutConditionImage,
} from './generated/types.gen'
import { apiRequest } from './client'

const PAGE_SIZE = 100

type CatalogFilters = {
  query?: string
  type?: ItemType
  inStock?: boolean
}

export function getCatalogItems(filters: CatalogFilters = {}) {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) })

  if (filters.query) params.set('q', filters.query)
  if (filters.type) params.set('type', filters.type)
  if (filters.inStock) params.set('in_stock', 'true')

  return apiRequest<PaginatedItemResponse>(`/items?${params.toString()}`)
}

export function getCatalogItem(itemId: string) {
  return apiRequest<ItemResponse>(`/items/${encodeURIComponent(itemId)}`)
}

export function getItemImages(itemId: string) {
  return apiRequest<Array<ItemImage>>(
    `/items/${encodeURIComponent(itemId)}/images`,
  )
}

export function createCatalogItem(input: ItemPostRequest) {
  return apiRequest<ItemPostRequest>('/items', { method: 'POST', body: input })
}

export function updateCatalogItem(input: ItemPostRequest) {
  return apiRequest<ItemResponse>(`/items/${encodeURIComponent(input.id)}`, {
    method: 'PUT',
    body: input,
  })
}

export function deleteCatalogItem(itemId: string) {
  return apiRequest<void>(`/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  })
}

export function uploadCatalogItemImage(input: { itemId: string; image: File }) {
  const body = new FormData()
  body.append('image', input.image)

  return apiRequest<ItemImage>(
    `/items/${encodeURIComponent(input.itemId)}/images`,
    { method: 'POST', body },
  )
}

export function deleteCatalogItemImage(input: {
  itemId: string
  imageId: string
}) {
  return apiRequest<void>(
    `/items/${encodeURIComponent(input.itemId)}/images/${encodeURIComponent(input.imageId)}`,
    { method: 'DELETE' },
  )
}

export function getCart(groupId: string) {
  return apiRequest<Array<CartItemResponse>>(
    `/cart/${encodeURIComponent(groupId)}`,
  )
}

export function addItemToCart(input: {
  groupId: string
  itemId: string
  quantity: number
}) {
  return apiRequest<CartItemResponse>(
    `/cart/${encodeURIComponent(input.groupId)}/items`,
    { method: 'POST', body: input },
  )
}

export function updateCartItemQuantity(input: {
  groupId: string
  itemId: string
  quantity: number
}) {
  return apiRequest<CartItemResponse>(
    `/cart/${encodeURIComponent(input.groupId)}/items/${encodeURIComponent(input.itemId)}`,
    { method: 'PATCH', body: { quantity: input.quantity } },
  )
}

export function removeCartItem(input: { groupId: string; itemId: string }) {
  return apiRequest<void>(
    `/cart/${encodeURIComponent(input.groupId)}/items/${encodeURIComponent(input.itemId)}`,
    { method: 'DELETE' },
  )
}

export function uploadPreCheckoutConditionImage(input: {
  itemId: string
  image: File
}) {
  const body = new FormData()
  body.append('item_id', input.itemId)
  body.append('image', input.image)

  return apiRequest<PreCheckoutConditionImage>(
    '/borrowings/pre-checkout-condition-image',
    { method: 'POST', body },
  )
}

export function checkoutCart(input: {
  groupId: string
  dueDate: string
  beforeCondition: 'unusable' | 'damaged' | 'decent' | 'good' | 'pristine'
  beforeConditionUrl: string
}) {
  return apiRequest<CheckoutCartResponse>('/checkout', {
    method: 'POST',
    body: input,
  })
}
