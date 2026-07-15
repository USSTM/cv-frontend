import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { Item } from '@/types/item'

export const Route = createFileRoute('/catalog')({
  component: CatalogPage,
})

// Mock data, to replace with actual data pulled from a db/backend

const items: Item[] = [
  {
    id: '1',
    title: 'MacBook Charger',
    category: 'Electronics',
    description: 'USB-C 96W charger.',
    stock: 5,
    type: 'Borrow',
  },
  {
    id: '2',
    title: 'Scientific Calculator',
    category: 'School Supplies',
    description: 'TI-84 Plus CE',
    stock: 10,
    type: 'Borrow',
  },
  {
    id: '3',
    title: 'Winter Coat',
    category: 'Clothing',
    description: 'Available to take home.',
    stock: 3,
    type: 'Take',
  },
  {
    id: '4',
    title: 'Notebook Bundle',
    category: 'School Supplies',
    description: 'Pack of 5 notebooks.',
    stock: 20,
    type: 'Take',
  },
  {
    id: '5',
    title: 'Arduino Kit',
    category: 'Maker Space',
    description: 'Currently unavailable.',
    stock: 0,
    type: 'Request',
  },
]

function CatalogPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const categories = ['all', ...new Set(items.map((item) => item.category))]

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = category === 'all' || item.category === category

      return matchesSearch && matchesCategory
    })
  }, [search, category])

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="display-title text-3xl font-bold">Catalog</h1>
          <p className="mt-2 text-(--sea-ink-soft)">
            Browse items available to take, borrow, or request.
          </p>
        </div>

        <section className="island-shell rounded-2xl p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <Input placeholder="Search catalog..." className="flex-1" />

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Category" />
              </SelectTrigger>

              <SelectContent position="popper" side="bottom" align="start">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="island-shell rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="">
                <div className="mb-2  flex items-center justify-between ">
                  <h2 className="text-xl font-semibold">{item.title} </h2>
                  <Badge>{item.type}</Badge>
                </div>
                <p className="text-sm text-(--sea-ink-soft)">{item.category}</p>
                <div className="text-start">{item.stock} in stock</div>
              </div>

              <p className="mb-6 text-sm text-(--sea-ink-soft)">
                {item.description}
              </p>

              <Button className="btn-inv w-full">View Item</Button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
