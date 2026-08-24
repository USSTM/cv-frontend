import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { ArrowRight, Check, ImageOff, ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  useAddItemToCartMutation,
  useCartQuery,
  useCatalogItemsQuery,
} from '@/api/catalog-queries'
import type { ItemType } from '@/api/generated/types.gen'
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
import { useActiveGroup } from '@/lib/active-group'
import { itemTypeClass, itemTypeLabels } from '@/lib/item-type'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/catalog')({
  beforeLoad: requireAuth,
  component: CatalogRoute,
})

function CatalogRoute() {
  const location = useLocation()

  // This route is also the parent for /catalog/$itemId. Render the child
  // route instead of the Catalog list when an item detail URL is matched.
  if (location.pathname !== '/catalog') {
    return <Outlet />
  }

  return <CatalogPage />
}

function CatalogPage() {
  const { activeGroup } = useActiveGroup()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ItemType | undefined>()
  const [inStock, setInStock] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const itemsQuery = useCatalogItemsQuery({ type, inStock })
  const cartQuery = useCartQuery(activeGroup?.id)
  const addToCart = useAddItemToCartMutation()
  const cart = cartQuery.data ?? []
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return itemsQuery.data?.data ?? []

    return (itemsQuery.data?.data ?? []).filter((item) =>
      `${item.name} ${item.description ?? ''}`
        .toLocaleLowerCase()
        .includes(query),
    )
  }, [itemsQuery.data?.data, search])

  function addItem(itemId: string) {
    if (!activeGroup) return
    addToCart.mutate(
      { groupId: activeGroup.id, itemId, quantity: 1 },
      { onSuccess: () => setLastAdded(itemId) },
    )
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 text-(--kicker)!">
              Shared collection
            </p>
            <h1 className="display-title text-3xl font-bold">Catalog</h1>
            <p className="mt-2 max-w-2xl text-(--sea-ink-soft)">
              Browse items available to take, borrow, or request.
            </p>
          </div>
          <div className="rounded-xl border border-(--line) bg-white px-4 py-3 text-sm shadow-sm">
            <span className="font-semibold">
              {activeGroup?.name ?? 'No Active Group'}
            </span>
            <span className="ml-2 text-(--sea-ink-soft)">
              {itemCount} in Cart
            </span>
          </div>
        </div>

        <section className="island-shell rounded-2xl p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search catalog..."
              className="flex-1"
            />
            <Select
              value={type ?? 'all'}
              onValueChange={(value) =>
                setType(value === 'all' ? undefined : (value as ItemType))
              }
            >
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Item type" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" align="start">
                <SelectItem value="all">All item types</SelectItem>
                {(
                  Object.entries(itemTypeLabels) as Array<[ItemType, string]>
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={inStock ? 'default' : 'outline'}
              className={inStock ? 'btn-inv' : ''}
              onClick={() => setInStock((value) => !value)}
            >
              {inStock ? 'In stock only' : 'Show in stock'}
            </Button>
          </div>
        </section>

        {itemsQuery.isLoading ? (
          <CatalogLoading />
        ) : itemsQuery.isError ? (
          <CatalogError onRetry={() => itemsQuery.refetch()} />
        ) : filteredItems.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const cartItem = cart.find((entry) => entry.itemId === item.id)
              const unavailable = item.stock === 0
              const isAdding =
                addToCart.isPending && addToCart.variables.itemId === item.id
              return (
                <article
                  key={item.id}
                  className="island-shell overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link
                    to="/catalog/$itemId"
                    params={{ itemId: item.id }}
                    className="block p-6 no-underline"
                  >
                    {item.urls?.[0] ? (
                      <img
                        src={item.urls[0]}
                        alt=""
                        className="mb-5 aspect-[16/9] w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="mb-5 flex aspect-[16/9] items-center justify-center rounded-xl bg-(--foam) text-(--sea-ink-soft)">
                        <ImageOff aria-hidden="true" size={28} />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold">{item.name}</h2>
                      <Badge className={itemTypeClass(item.type)}>
                        {itemTypeLabels[item.type]}
                      </Badge>
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm text-(--sea-ink-soft)">
                      {item.description ?? 'No description provided.'}
                    </p>
                    <p className="mt-4 text-sm font-medium">
                      {unavailable
                        ? 'Currently unavailable'
                        : `${item.stock} available`}
                    </p>
                  </Link>
                  <div className="border-t border-(--line) bg-[rgba(79,184,178,0.05)] px-6 py-5">
                    <Button
                      className="btn-inv min-h-10 w-full whitespace-normal"
                      disabled={
                        !activeGroup ||
                        unavailable ||
                        isAdding ||
                        cartItem?.quantity === item.stock
                      }
                      onClick={() => addItem(item.id)}
                    >
                      {isAdding || lastAdded === item.id ? (
                        <Check aria-hidden="true" size={16} />
                      ) : (
                        <ShoppingCart aria-hidden="true" size={16} />
                      )}
                      {!activeGroup
                        ? 'Choose an Active Group'
                        : unavailable
                          ? 'Unavailable'
                          : isAdding
                            ? 'Adding…'
                            : cartItem
                              ? `Add another (${cartItem.quantity} selected)`
                              : 'Add to Cart'}
                    </Button>
                    <button
                      type="button"
                      className="mx-auto mt-3 inline-flex w-full items-center justify-center gap-1 text-sm font-semibold text-(--lagoon-deep) transition-colors hover:text-(--header-bg)"
                      onClick={() =>
                        navigate({
                          to: '/catalog/$itemId',
                          params: { itemId: item.id },
                        })
                      }
                    >
                      View item details{' '}
                      <ArrowRight aria-hidden="true" size={15} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <section className="island-shell rounded-2xl px-6 py-12 text-center">
            <h2 className="text-xl font-semibold">No catalog items found</h2>
            <p className="mt-2 text-sm text-(--sea-ink-soft)">
              Try a different search or filter.
            </p>
          </section>
        )}
      </section>
    </main>
  )
}

function CatalogLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="island-shell animate-pulse rounded-2xl p-6">
          <div className="aspect-[16/9] rounded-xl bg-(--foam)" />
          <div className="mt-5 h-6 w-2/3 rounded bg-(--foam)" />
          <div className="mt-3 h-4 rounded bg-(--foam)" />
          <div className="mt-2 h-4 w-4/5 rounded bg-(--foam)" />
          <div className="mt-6 h-9 rounded bg-(--foam)" />
        </div>
      ))}
    </div>
  )
}

function CatalogError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="island-shell rounded-2xl px-6 py-12 text-center">
      <h2 className="text-xl font-semibold">Catalog unavailable</h2>
      <p className="mt-2 text-sm text-(--sea-ink-soft)">
        We could not load the Catalog. Please try again.
      </p>
      <Button className="btn-inv mt-5" onClick={onRetry}>
        Try again
      </Button>
    </section>
  )
}
