import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { itemTypeClass, useDemo } from '@/demo/DemoContext'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/cart')({
  beforeLoad: requireAuth,
  component: CartPage,
})

function CartPage() {
  const { cart, activeGroup, updateCartQuantity, removeFromCart } = useDemo()
  const itemCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart],
  )
  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 !text-[var(--kicker)]">
              Checkout Prep
            </p>
            <h1 className="display-title text-3xl font-bold">Cart</h1>
            <p className="mt-2 text-(--sea-ink-soft)">
              Review the items you have selected before moving to Checkout
              Review.
            </p>
          </div>
          <ActiveGroup group={activeGroup} />
        </div>
        {cart.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section
              className="island-shell overflow-hidden rounded-2xl"
              aria-label="Cart items"
            >
              <div className="flex items-center justify-between border-b border-(--line) px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold">
                  Selected items{' '}
                  <span className="text-(--sea-ink-soft)">({itemCount})</span>
                </h2>
                <Link
                  to="/catalog"
                  className="text-sm font-semibold text-(--lagoon-deep)"
                >
                  Continue browsing
                </Link>
              </div>
              <ul className="divide-y divide-(--line)">
                {cart.map((item) => (
                  <li key={item.id} className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)">
                          <Package aria-hidden="true" size={21} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-(--sea-ink)">
                              {item.title}
                            </h3>
                            <Badge className={itemTypeClass(item.type)}>
                              {item.type}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-(--sea-ink-soft)">
                            {item.category} · {item.stock} available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div
                          className="flex items-center rounded-lg border border-(--line) bg-white"
                          aria-label={`Quantity for ${item.title}`}
                        >
                          <button
                            type="button"
                            className="flex size-9 items-center justify-center rounded-l-lg hover:bg-(--sand) disabled:opacity-40"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            disabled={item.quantity === 1}
                            aria-label={`Decrease quantity of ${item.title}`}
                          >
                            <Minus aria-hidden="true" size={16} />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="flex size-9 items-center justify-center rounded-r-lg hover:bg-(--sand) disabled:opacity-40"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            disabled={item.quantity === item.stock}
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            <Plus aria-hidden="true" size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="flex size-9 items-center justify-center rounded-lg text-(--sea-ink-soft) hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 aria-hidden="true" size={18} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <aside className="island-shell h-fit rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Ready to review?</h2>
              <p className="mt-2 text-sm leading-6 text-(--sea-ink-soft)">
                Checkout Review organizes items by whether they will be taken,
                borrowed, or requested.
              </p>
              <div className="my-5 border-t border-(--line)" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-(--sea-ink-soft)">Items selected</span>
                <span className="font-semibold">{itemCount}</span>
              </div>
              <Button asChild className="btn-inv mt-5 w-full">
                <Link to="/checkout">
                  Continue to checkout{' '}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </Button>
            </aside>
          </div>
        ) : (
          <section className="island-shell mx-auto max-w-xl rounded-2xl px-6 py-12 text-center sm:px-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)">
              <ShoppingCart aria-hidden="true" size={26} />
            </div>
            <h2 className="mt-5 text-xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-sm leading-6 text-(--sea-ink-soft)">
              Browse the Catalog to add items for your Active Group.
            </p>
            <Button asChild className="btn-inv mt-6">
              <Link to="/catalog">Browse the Catalog</Link>
            </Button>
          </section>
        )}
      </section>
    </main>
  )
}

function ActiveGroup({ group }: { group: string }) {
  return (
    <div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
        Active Group
      </p>
      <p className="mt-1 text-sm font-semibold text-(--sea-ink)">{group}</p>
    </div>
  )
}
