import type { ItemType } from '@/api/generated/types.gen'

export const itemTypeLabels: Record<ItemType, string> = {
  low: 'Take Item',
  medium: 'Borrow Item',
  high: 'Request Item',
}

export const itemTypeDescriptions: Record<ItemType, string> = {
  low: 'Take this item without return tracking.',
  medium: 'Borrow this item and return it when you are done.',
  high: 'Request approval before accessing this item.',
}

export function itemTypeClass(type: ItemType) {
  return {
    low: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    medium: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
    high: 'bg-violet-100 text-violet-800 hover:bg-violet-100',
  }[type]
}
