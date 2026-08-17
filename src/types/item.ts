export type ItemType = 'Take' | 'Borrow' | 'Request'

export interface Item {
  id: string
  title: string
  category: string
  description: string
  stock: number
  type: ItemType
}

export interface CartItem extends Item {
  quantity: number
}