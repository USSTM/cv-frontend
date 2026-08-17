import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { CartItem, Item, ItemType } from '@/types/item'

export type RequestStatus = 'Pending' | 'Approved' | 'Denied'

export type DemoRequest = {
  id: string
  member: string
  group: string
  item: string
  category: string
  quantity: number
  submitted: string
  pickup: string
  note: string
  status: RequestStatus
}

export type DemoBorrowing = {
  id: string
  title: string
  detail: string
  date: string
  status: 'Active' | 'Returned'
}

export type DemoBooking = {
  id: string
  title: string
  detail: string
  date: string
  status: 'Scheduled' | 'Upcoming'
}

export type DemoMember = {
  id: string
  name: string
  email: string
  role: 'Member' | 'Group Admin'
}

type DemoContextValue = {
  activeGroup: string
  currentMember: DemoMember | null
  session: DemoMember | null
  items: Item[]
  cart: CartItem[]
  requests: DemoRequest[]
  borrowings: DemoBorrowing[]
  bookings: DemoBooking[]
  members: DemoMember[]
  signIn: (email: string) => void
  signOut: () => void
  addToCart: (itemId: string) => void
  updateCartQuantity: (itemId: string, change: number) => void
  removeFromCart: (itemId: string) => void
  submitCheckout: () => void
  decideRequest: (id: string, status: Exclude<RequestStatus, 'Pending'>) => void
  returnBorrowing: (id: string) => void
  addMember: (name: string, email: string) => void
  resetDemo: () => void
}

const catalog: Item[] = [
  {
    id: 'macbook-charger',
    title: 'MacBook Charger',
    category: 'Electronics',
    description: 'USB-C 96W charger with a padded carrying case.',
    stock: 5,
    type: 'Borrow',
  },
  {
    id: 'scientific-calculator',
    title: 'Scientific Calculator',
    category: 'School Supplies',
    description: 'TI-84 Plus CE graphing calculator.',
    stock: 10,
    type: 'Borrow',
  },
  {
    id: 'winter-coat',
    title: 'Winter Coat',
    category: 'Clothing',
    description: 'Available to take home for the season.',
    stock: 3,
    type: 'Take',
  },
  {
    id: 'notebook-bundle',
    title: 'Notebook Bundle',
    category: 'School Supplies',
    description: 'Pack of five ruled notebooks.',
    stock: 20,
    type: 'Take',
  },
  {
    id: 'arduino-kit',
    title: 'Arduino Kit',
    category: 'Maker Space',
    description: 'Microcontroller, sensors, and starter components.',
    stock: 2,
    type: 'Request',
  },
]

const initialRequests: DemoRequest[] = [
  {
    id: 'camera-kit',
    member: 'Jordan Lee',
    group: 'Student Media',
    item: 'DSLR Camera Kit',
    category: 'Media Equipment',
    quantity: 1,
    submitted: 'Yesterday at 4:18 PM',
    pickup: 'Fri, Apr 18 · 11:00 AM–12:00 PM',
    note: 'For documenting the spring showcase and publishing the recap.',
    status: 'Pending',
  },
  {
    id: 'speaker-set',
    member: 'Noah Williams',
    group: 'Debate Society',
    item: 'Portable Speaker Set',
    category: 'Events',
    quantity: 1,
    submitted: 'Mon, Apr 14 at 1:07 PM',
    pickup: 'Mon, Apr 21 · 4:00–5:00 PM',
    note: 'For our final debate of the semester in the auditorium.',
    status: 'Pending',
  },
]

const initialBorrowings: DemoBorrowing[] = [
  {
    id: 'seed-charger',
    title: 'MacBook Charger',
    detail: 'Electronics · Borrowed Apr 11',
    date: 'Due Fri, Apr 25',
    status: 'Active',
  },
  {
    id: 'seed-calculator',
    title: 'Scientific Calculator',
    detail: 'School Supplies · Returned Mar 28',
    date: 'Returned on time',
    status: 'Returned',
  },
]

const initialBookings: DemoBooking[] = [
  {
    id: 'seed-pickup',
    title: 'Arduino Kit pickup',
    detail: 'Robotics Club · Vault desk',
    date: 'Thu, Apr 17 · 3:00–4:00 PM',
    status: 'Scheduled',
  },
  {
    id: 'seed-return',
    title: 'MacBook Charger return',
    detail: 'Electronics · Vault desk',
    date: 'Fri, Apr 25 · 12:00–1:00 PM',
    status: 'Upcoming',
  },
]

const initialMembers: DemoMember[] = [
  {
    id: 'maya-patel',
    name: 'Maya Patel',
    email: 'maya.patel@usstm.ca',
    role: 'Member',
  },
  {
    id: 'noah-williams',
    name: 'Noah Williams',
    email: 'noah.williams@usstm.ca',
    role: 'Member',
  },
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    email: 'jordan.lee@usstm.ca',
    role: 'Group Admin',
  },
]

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState(catalog)
  const [cart, setCart] = useState<CartItem[]>([])
  const [requests, setRequests] = useState(initialRequests)
  const [borrowings, setBorrowings] = useState(initialBorrowings)
  const [bookings, setBookings] = useState(initialBookings)
  const [members, setMembers] = useState(initialMembers)
  const [currentMember, setCurrentMember] = useState<DemoMember | null>(null)

  function signIn(email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const matchedMember = members.find(
      (member) => member.email.toLowerCase() === normalizedEmail,
    )

    if (matchedMember) {
      setCurrentMember(matchedMember)
      return
    }

    const fallbackName = normalizedEmail
      .split('@')[0]
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ')

    setCurrentMember({
      id: `member-${normalizedEmail || 'guest'}`,
      name: fallbackName || 'Campus Vault Member',
      email: email.trim(),
      role: 'Member',
    })
  }

  function signOut() {
    setCurrentMember(null)
  }

  function addToCart(itemId: string) {
    const item = items.find((candidate) => candidate.id === itemId)
    if (!item || item.stock === 0) return
    setCart((current) => {
      const existing = current.find((candidate) => candidate.id === itemId)
      if (existing) {
        return current.map((candidate) =>
          candidate.id === itemId
            ? {
                ...candidate,
                quantity: Math.min(candidate.quantity + 1, item.stock),
              }
            : candidate,
        )
      }
      return [...current, { ...item, quantity: 1 }]
    })
  }

  function updateCartQuantity(itemId: string, change: number) {
    const item = items.find((candidate) => candidate.id === itemId)
    if (!item) return
    setCart((current) =>
      current.map((candidate) =>
        candidate.id === itemId
          ? {
              ...candidate,
              quantity: Math.min(
                item.stock,
                Math.max(1, candidate.quantity + change),
              ),
            }
          : candidate,
      ),
    )
  }

  function removeFromCart(itemId: string) {
    setCart((current) => current.filter((item) => item.id !== itemId))
  }

  function submitCheckout() {
    const checkoutItems = cart
    if (checkoutItems.length === 0) return
    const submittedAt = 'Just now'
    setItems((current) =>
      current.map((item) => {
        const selected = checkoutItems.find(
          (cartItem) => cartItem.id === item.id,
        )
        return selected
          ? { ...item, stock: Math.max(0, item.stock - selected.quantity) }
          : item
      }),
    )
    const pickup = 'Next available Vault desk window'
    const requestItems = checkoutItems.filter((item) => item.type === 'Request')
    setRequests((current) => [
      ...requestItems.map((item) => ({
        id: `request-${item.id}-${Date.now()}`,
        member: 'Campus Vault Member',
        group: 'Robotics Club',
        item: item.title,
        category: item.category,
        quantity: item.quantity,
        submitted: submittedAt,
        pickup,
        note: 'Submitted through the Campus Vault demo checkout.',
        status: 'Pending' as const,
      })),
      ...current,
    ])
    setBorrowings((current) => [
      ...checkoutItems
        .filter((item) => item.type === 'Borrow')
        .map((item) => ({
          id: `borrowing-${item.id}-${Date.now()}`,
          title: item.title,
          detail: `${item.category} · Borrowed just now`,
          date: 'Due in 14 days',
          status: 'Active' as const,
        })),
      ...current,
    ])
    setBookings((current) => [
      ...checkoutItems
        .filter((item) => item.type !== 'Request')
        .map((item) => ({
          id: `booking-${item.id}-${Date.now()}`,
          title: `${item.title} pickup`,
          detail: 'Robotics Club · Vault desk',
          date: pickup,
          status: 'Scheduled' as const,
        })),
      ...current,
    ])
    setCart([])
  }

  function decideRequest(
    id: string,
    status: Exclude<RequestStatus, 'Pending'>,
  ) {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request,
      ),
    )
  }

  function returnBorrowing(id: string) {
    setBorrowings((current) =>
      current.map((borrowing) =>
        borrowing.id === id
          ? { ...borrowing, status: 'Returned', date: 'Returned just now' }
          : borrowing,
      ),
    )
  }

  function addMember(name: string, email: string) {
    setMembers((current) => [
      ...current,
      { id: `member-${email.toLowerCase()}`, name, email, role: 'Member' },
    ])
  }

  function resetDemo() {
    setItems(catalog)
    setCart([])
    setRequests(initialRequests)
    setBorrowings(initialBorrowings)
    setBookings(initialBookings)
    setMembers(initialMembers)
  }

  const value = useMemo(
    () => ({
      activeGroup: 'Computer Science Course Union (CSCU)',
      currentMember,
      session: currentMember,
      items,
      cart,
      requests,
      borrowings,
      bookings,
      members,
      signIn,
      signOut,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      submitCheckout,
      decideRequest,
      returnBorrowing,
      addMember,
      resetDemo,
    }),
    [currentMember, items, cart, requests, borrowings, bookings, members],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo must be used within DemoProvider')
  return context
}

export function itemTypeClass(type: ItemType) {
  return {
    Take: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Borrow: 'border-sky-200 bg-sky-50 text-sky-800',
    Request: 'border-violet-200 bg-violet-50 text-violet-800',
  }[type]
}
