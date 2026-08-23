import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Check, ImageOff, ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  useAddItemToCartMutation,
  useCartQuery,
  useCatalogItemQuery,
  useItemImagesQuery,
} from '@/api/catalog-queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useActiveGroup } from '@/lib/active-group'
import {
  itemTypeClass,
  itemTypeDescriptions,
  itemTypeLabels,
} from '@/lib/item-type'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/catalog/$itemId')({
  beforeLoad: requireAuth,
  component: ItemDetailPage,
})

function ItemDetailPage() {
  const { itemId } = Route.useParams()
  const { activeGroup } = useActiveGroup()
  const itemQuery = useCatalogItemQuery(itemId)
  const imagesQuery = useItemImagesQuery(itemId)
  const cartQuery = useCartQuery(activeGroup?.id)
  const addToCart = useAddItemToCartMutation()
  const [selectedImage, setSelectedImage] = useState(0)
  const images = useMemo(() => {
    const fromImageService =
      imagesQuery.data
        ?.slice()
        ?.sort((a, b) => a.display_order - b.display_order)
        .map((image) => image.url) ?? []
    return fromImageService.length > 0
      ? fromImageService
      : (itemQuery.data?.urls ?? [])
  }, [imagesQuery.data, itemQuery.data?.urls])
  const item = itemQuery.data
  const cartItem = cartQuery.data?.find((entry) => entry.itemId === itemId)

  if (itemQuery.isLoading) return <ItemLoading />
  if (itemQuery.isError || !item)
    return <ItemError onRetry={() => itemQuery.refetch()} />

  const unavailable = item.stock === 0
  const isAdding = addToCart.isPending
  function addItem() {
    if (!activeGroup) return
    addToCart.mutate({ groupId: activeGroup.id, itemId: item.id, quantity: 1 })
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-(--lagoon-deep)"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to Catalog
        </Link>
        <article className="island-shell grid gap-8 rounded-2xl p-6 lg:grid-cols-2 lg:p-8">
          <div>
            {images.length ? (
              <img
                src={images[selectedImage]}
                alt={item.name}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl bg-(--foam) text-(--sea-ink-soft)">
                <ImageOff aria-hidden="true" size={44} />
              </div>
            )}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImage === index ? 'border-(--lagoon-deep)' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start">
            <Badge className={itemTypeClass(item.type)}>
              {itemTypeLabels[item.type]}
            </Badge>
            <h1 className="display-title mt-4 text-3xl font-bold">
              {item.name}
            </h1>
            <p className="mt-5 text-base leading-7 text-(--sea-ink-soft)">
              {item.description ??
                'No description has been provided for this item.'}
            </p>
            <div className="mt-6 rounded-xl bg-(--foam) px-4 py-3 text-sm">
              <span className="font-semibold">
                {unavailable
                  ? 'Currently unavailable'
                  : `${item.stock} available`}
              </span>
              <span className="ml-2 text-(--sea-ink-soft)">
                {itemTypeDescriptions[item.type]}
              </span>
            </div>
            <div className="mt-auto w-full pt-8">
              <p className="mb-3 text-sm text-(--sea-ink-soft)">
                Adding this item will use{' '}
                <span className="font-semibold text-(--sea-ink)">
                  {activeGroup?.name ?? 'your Active Group'}
                </span>
                .
              </p>
              <Button
                className="btn-inv w-full"
                disabled={
                  !activeGroup ||
                  unavailable ||
                  isAdding ||
                  cartItem?.quantity === item.stock
                }
                onClick={addItem}
              >
                {isAdding ? (
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
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}

function ItemLoading() {
  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl animate-pulse">
        <div className="h-5 w-32 rounded bg-(--foam)" />
        <div className="island-shell mt-6 grid gap-8 rounded-2xl p-6 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-(--foam)" />
          <div className="space-y-4">
            <div className="h-6 w-28 rounded bg-(--foam)" />
            <div className="h-10 w-3/4 rounded bg-(--foam)" />
            <div className="h-24 rounded bg-(--foam)" />
          </div>
        </div>
      </section>
    </main>
  )
}

function ItemError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="island-shell mx-auto max-w-xl rounded-2xl px-6 py-12 text-center">
        <h1 className="text-xl font-semibold">Item unavailable</h1>
        <p className="mt-2 text-sm text-(--sea-ink-soft)">
          We could not load this item. It may no longer be in the Catalog.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/catalog">Back to Catalog</Link>
          </Button>
          <Button className="btn-inv" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </section>
    </main>
  )
}
