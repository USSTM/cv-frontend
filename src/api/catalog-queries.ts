import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CartItemResponse, ItemType } from './generated/types.gen'
import {
  addItemToCart,
  getCart,
  getCatalogItem,
  getCatalogItems,
  getItemImages,
  removeCartItem,
  updateCartItemQuantity,
} from './catalog'

type CatalogFilters = { query?: string; type?: ItemType; inStock?: boolean }

export const cartQueryKey = (groupId: string | undefined) =>
  ['cart', groupId] as const

export function useCatalogItemsQuery(filters: CatalogFilters) {
  return useQuery({
    queryKey: ['catalog', 'items', filters],
    queryFn: () => getCatalogItems(filters),
  })
}

export function useCatalogItemQuery(itemId: string) {
  return useQuery({
    queryKey: ['catalog', 'item', itemId],
    queryFn: () => getCatalogItem(itemId),
  })
}

export function useItemImagesQuery(itemId: string) {
  return useQuery({
    queryKey: ['catalog', 'item-images', itemId],
    queryFn: () => getItemImages(itemId),
  })
}

export function useCartQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: cartQueryKey(groupId),
    queryFn: () => getCart(groupId!),
    enabled: Boolean(groupId),
  })
}

export function useAddItemToCartMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addItemToCart,
    onSuccess: (item) => {
      queryClient.setQueryData<Array<CartItemResponse>>(
        cartQueryKey(item.groupId),
        (current = []) => {
          const existing = current.find((entry) => entry.itemId === item.itemId)
          return existing
            ? current.map((entry) =>
                entry.itemId === item.itemId ? item : entry,
              )
            : [...current, item]
        },
      )
    },
  })
}

export function useUpdateCartItemQuantityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCartItemQuantity,
    onSuccess: (item) => {
      queryClient.setQueryData<Array<CartItemResponse>>(
        cartQueryKey(item.groupId),
        (current = []) =>
          current.map((entry) => (entry.itemId === item.itemId ? item : entry)),
      )
    },
  })
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: (_, input) => {
      queryClient.setQueryData<Array<CartItemResponse>>(
        cartQueryKey(input.groupId),
        (current = []) =>
          current.filter((entry) => entry.itemId !== input.itemId),
      )
    },
  })
}
