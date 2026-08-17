import { createFileRoute } from '@tanstack/react-router'
import { Check, ShoppingCart } from 'lucide-react'
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
import { itemTypeClass, useDemo } from '@/demo/DemoContext'

export const Route = createFileRoute('/catalog')({ component: CatalogPage })

function CatalogPage() {
  const { activeGroup, items, cart, addToCart } = useDemo()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const categories = ['all', ...new Set(items.map((item) => item.category))]
  const filtered = useMemo(() => items.filter((item) => {
    const query = search.toLowerCase()
    return (item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))
      && (category === 'all' || item.category === category)
  }), [items, search, category])

  function handleAdd(id: string) {
    addToCart(id)
    setLastAdded(id)
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 text-(--kicker)!">Shared collection</p>
            <h1 className="display-title text-3xl font-bold">Catalog</h1>
            <p className="mt-2 max-w-2xl text-(--sea-ink-soft)">Browse items available to take, borrow, or request.</p>
          </div>
          <div className="rounded-xl border border-(--line) bg-white px-4 py-3 text-sm shadow-sm">
            <span className="font-semibold">{activeGroup}</span>
            <span className="ml-2 text-(--sea-ink-soft)">{cart.reduce((total, item) => total + item.quantity, 0)} in Cart</span>
          </div>
        </div>

        <section className="island-shell rounded-2xl p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search catalog..." className="flex-1" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent position="popper" side="bottom" align="start">
                {categories.map((entry) => <SelectItem key={entry} value={entry}>{entry === 'all' ? 'All Categories' : entry}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </section>

        {filtered.length > 0 ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const cartItem = cart.find((entry) => entry.id === item.id)
            const unavailable = item.stock === 0
            return <article key={item.id} className="island-shell rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div><h2 className="text-xl font-semibold">{item.title}</h2><p className="mt-1 text-sm text-(--sea-ink-soft)">{item.category}</p></div>
                <Badge className={itemTypeClass(item.type)}>{item.type}</Badge>
              </div>
              <p className="mb-3 text-sm text-(--sea-ink-soft)">{item.description}</p>
              <p className="mb-5 text-sm font-medium">{unavailable ? 'Currently unavailable' : `${item.stock} available`}</p>
              <Button className="btn-inv w-full" disabled={unavailable || cartItem?.quantity === item.stock} onClick={() => handleAdd(item.id)}>
                {lastAdded === item.id ? <Check aria-hidden="true" size={16} /> : <ShoppingCart aria-hidden="true" size={16} />}
                {unavailable ? 'Unavailable' : cartItem ? `Add another (${cartItem.quantity} selected)` : 'Add to Cart'}
              </Button>
            </article>
          })}
        </div> : <section className="island-shell rounded-2xl px-6 py-12 text-center"><h2 className="text-xl font-semibold">No catalog items found</h2><p className="mt-2 text-sm text-(--sea-ink-soft)">Try a different search or category.</p></section>}
      </section>
    </main>
  )
}
