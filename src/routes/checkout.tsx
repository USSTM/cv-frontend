import { Link, createFileRoute } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { useCartQuery, useCheckoutCartMutation } from '@/api/catalog-queries'
import {
  type CheckoutCartResponse,
  type ItemType,
} from '@/api/generated/types.gen'
import { uploadPreCheckoutConditionImage } from '@/api/catalog'
import { ApiError } from '@/api/client'
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

export const Route = createFileRoute('/checkout')({
  beforeLoad: requireAuth,
  component: CheckoutPage,
})

type Condition = 'unusable' | 'damaged' | 'decent' | 'good' | 'pristine'

const sections: Array<{ type: ItemType; title: string; description: string }> =
  [
    {
      type: 'low',
      title: 'Ready to Take',
      description: 'These Take Items will be recorded for your Active Group.',
    },
    {
      type: 'medium',
      title: 'Borrowing',
      description:
        'These Borrow Items will be recorded as items you need to return.',
    },
    {
      type: 'high',
      title: 'Needs Approval',
      description:
        'These Request Items will remain pending until an Approver decides.',
    },
  ]

function CheckoutPage() {
  const { activeGroup } = useActiveGroup()
  const cartQuery = useCartQuery(activeGroup?.id)
  const checkout = useCheckoutCartMutation()
  const cart = cartQuery.data ?? []
  const [dueDate, setDueDate] = useState('')
  const [condition, setCondition] = useState<Condition>('good')
  const [conditionPhoto, setConditionPhoto] = useState<File | null>(null)
  const [result, setResult] = useState<CheckoutCartResponse | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const groupedCart = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        items: cart.filter((item) => item.itemType === section.type),
      })),
    [cart],
  )
  const hasBorrowing = groupedCart.some(
    (section) => section.type === 'medium' && section.items.length > 0,
  )
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0)
  const canSubmit =
    Boolean(activeGroup) &&
    !isUploadingPhoto &&
    !checkout.isPending &&
    (!hasBorrowing || Boolean(dueDate && conditionPhoto))

  async function handleSubmit() {
    if (!activeGroup) return
    setSubmitError(null)

    try {
      let beforeConditionUrl = ''
      if (hasBorrowing) {
        const firstBorrowItem = cart.find((item) => item.itemType === 'medium')
        if (!firstBorrowItem || !conditionPhoto) return
        setIsUploadingPhoto(true)
        const uploaded = await uploadPreCheckoutConditionImage({
          itemId: firstBorrowItem.itemId,
          image: conditionPhoto,
        }).finally(() => setIsUploadingPhoto(false))
        beforeConditionUrl = uploaded.beforeConditionUrl
      }

      const checkoutResult = await checkout.mutateAsync({
        groupId: activeGroup.id,
        // The API requires a date-time for every checkout, although it ignores
        // this value when the Cart has no Borrow Items.
        dueDate: hasBorrowing
          ? `${dueDate}T12:00:00.000Z`
          : new Date().toISOString(),
        beforeCondition: condition,
        beforeConditionUrl,
      })
      setResult(checkoutResult)
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Checkout could not be completed. Please try again.',
      )
    }
  }

  if (cartQuery.isLoading) return <CheckoutLoading />
  if (cartQuery.isError)
    return <CheckoutError onRetry={() => cartQuery.refetch()} />
  if (result)
    return <Confirmation result={result} groupName={activeGroup?.name} />
  if (!activeGroup || cart.length === 0) return <EmptyCheckout />

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold text-(--lagoon-deep)"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Back to Cart
            </Link>
            <p className="island-kicker mb-2 mt-5 !text-[var(--kicker)]">
              Checkout Review
            </p>
            <h1 className="display-title text-3xl font-bold">
              Confirm your items
            </h1>
            <p className="mt-2 text-(--sea-ink-soft)">
              Review what will happen to each item before submitting.
            </p>
          </div>
          <ActiveGroup name={activeGroup.name} />
        </div>

        <ol
          className="grid gap-3 rounded-2xl border border-(--line) bg-white p-4 sm:grid-cols-3"
          aria-label="Checkout progress"
        >
          <li className="flex items-center gap-3 text-sm text-(--sea-ink-soft)">
            <span className="flex size-7 items-center justify-center rounded-full bg-(--sand) font-bold">
              1
            </span>
            Cart
          </li>
          <li className="flex items-center gap-3 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-full bg-(--header-bg) font-bold text-white">
              2
            </span>
            Review
          </li>
          <li className="flex items-center gap-3 text-sm text-(--sea-ink-soft)">
            <span className="flex size-7 items-center justify-center rounded-full bg-(--sand) font-bold">
              3
            </span>
            Confirmation
          </li>
        </ol>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            {groupedCart
              .filter((section) => section.items.length > 0)
              .map((section) => (
                <section
                  key={section.type}
                  className="island-shell overflow-hidden rounded-2xl"
                >
                  <div className="border-b border-(--line) px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold">{section.title}</h2>
                      <Badge className={itemTypeClass(section.type)}>
                        {itemTypeLabels[section.type]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-(--sea-ink-soft)">
                      {section.description}
                    </p>
                  </div>
                  <ul className="divide-y divide-(--line)">
                    {section.items.map((item) => (
                      <li
                        key={item.itemId}
                        className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                      >
                        <div className="flex items-center gap-3">
                          <PackageCheck
                            aria-hidden="true"
                            className="text-(--lagoon-deep)"
                            size={20}
                          />
                          <span className="font-semibold">{item.itemName}</span>
                        </div>
                        <span className="text-sm text-(--sea-ink-soft)">
                          Qty. {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {section.type === 'medium' && (
                    <BorrowingDetails
                      dueDate={dueDate}
                      condition={condition}
                      conditionPhoto={conditionPhoto}
                      onDueDateChange={setDueDate}
                      onConditionChange={setCondition}
                      onPhotoChange={setConditionPhoto}
                    />
                  )}
                </section>
              ))}
          </div>

          <aside className="island-shell h-fit rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ClipboardCheck
                aria-hidden="true"
                className="text-(--lagoon-deep)"
                size={20}
              />
              <h2 className="text-lg font-semibold">Review summary</h2>
            </div>
            <div className="my-5 space-y-3 text-sm">
              <Summary label="Items selected" value={itemCount} />
              {groupedCart.map((section) => (
                <Summary
                  key={section.type}
                  label={section.title}
                  value={section.items.reduce(
                    (total, item) => total + item.quantity,
                    0,
                  )}
                />
              ))}
            </div>
            {groupedCart.some(
              (section) => section.type === 'high' && section.items.length > 0,
            ) && (
              <div className="rounded-xl bg-(--sand) p-3 text-sm leading-5 text-(--sea-ink-soft)">
                <ShieldCheck
                  aria-hidden="true"
                  className="mr-2 inline text-(--palm)"
                  size={17}
                />
                Request Items stay pending until an Approver makes a decision.
              </div>
            )}
            {submitError && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {submitError}
              </p>
            )}
            <Button
              className="btn-inv mt-5 w-full"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {isUploadingPhoto
                ? 'Uploading photo…'
                : checkout.isPending
                  ? 'Submitting…'
                  : 'Submit checkout'}{' '}
              <Send aria-hidden="true" size={16} />
            </Button>
            {hasBorrowing && !dueDate && (
              <p className="mt-3 text-center text-xs leading-5 text-(--sea-ink-soft)">
                Choose a return due date to submit.
              </p>
            )}
            {hasBorrowing && !conditionPhoto && (
              <p className="mt-3 text-center text-xs leading-5 text-(--sea-ink-soft)">
                Attach a condition photo to submit.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

function BorrowingDetails({
  dueDate,
  condition,
  conditionPhoto,
  onDueDateChange,
  onConditionChange,
  onPhotoChange,
}: {
  dueDate: string
  condition: Condition
  conditionPhoto: File | null
  onDueDateChange: (value: string) => void
  onConditionChange: (value: Condition) => void
  onPhotoChange: (file: File | null) => void
}) {
  return (
    <div className="border-t border-(--line) bg-(--foam) px-5 py-5 sm:px-6">
      <div className="flex gap-3">
        <Camera
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-(--lagoon-deep)"
          size={20}
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">Borrowing details</h3>
          <p className="mt-1 text-sm leading-6 text-(--sea-ink-soft)">
            These details are recorded for every Borrow Item in this checkout.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Due date
              <Input
                className="mt-2 h-11 cursor-pointer border-(--line) bg-(--sand) text-(--sea-ink) [color-scheme:light]"
                type="date"
                value={dueDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => onDueDateChange(event.target.value)}
                onClick={(event) => event.currentTarget.showPicker?.()}
              />
            </label>
            <label className="text-sm font-semibold">
              Current condition
              <Select
                value={condition}
                onValueChange={(value) => onConditionChange(value as Condition)}
              >
                <SelectTrigger className="mt-2 w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      'pristine',
                      'good',
                      'decent',
                      'damaged',
                      'unusable',
                    ] as const
                  ).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value[0].toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="mt-4 block text-sm font-semibold">
            Condition photo
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-(--header-bg) file:px-3 file:py-2 file:font-semibold file:text-white"
              onChange={(event) =>
                onPhotoChange(event.target.files?.[0] ?? null)
              }
            />
          </label>
          {conditionPhoto && (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              {conditionPhoto.name} attached
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Confirmation({
  result,
  groupName,
}: {
  result: CheckoutCartResponse
  groupName?: string
}) {
  const buckets = [
    { title: 'Ready to Take', items: result.lowItemsProcessed },
    { title: 'Borrowing', items: result.mediumItemsBorrowed },
    { title: 'Needs Approval', items: result.highItemsRequested },
  ]
  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="island-shell mx-auto max-w-2xl rounded-2xl px-6 py-12 sm:px-12">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={28} />
          </div>
          <p className="island-kicker mt-6 !text-[var(--kicker)]">
            Checkout result
          </p>
          <h1 className="display-title mt-2 text-3xl font-bold">
            Checkout submitted
          </h1>
          <p className="mx-auto mt-3 max-w-lg leading-7 text-(--sea-ink-soft)">
            Results for {groupName ?? 'your Active Group'} are shown below.
          </p>
        </div>
        <div className="mt-8 space-y-5">
          {buckets
            .filter((bucket) => bucket.items.length > 0)
            .map((bucket) => (
              <section key={bucket.title}>
                <h2 className="font-semibold">{bucket.title}</h2>
                <ul className="mt-2 space-y-2">
                  {bucket.items.map((item) => (
                    <li
                      key={item.itemId}
                      className="rounded-xl bg-(--foam) px-4 py-3 text-sm"
                    >
                      <span className="font-semibold">{item.itemName}</span>
                      <span className="float-right text-(--sea-ink-soft)">
                        Qty. {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          {result.errors.length > 0 && (
            <section className="rounded-xl bg-red-50 p-4">
              <div className="flex gap-2 text-red-700">
                <AlertCircle aria-hidden="true" size={20} />
                <div>
                  <h2 className="font-semibold">Some items need attention</h2>
                  <ul className="mt-2 space-y-1 text-sm">
                    {result.errors.map((error) => (
                      <li key={error.itemId}>
                        {error.itemName ?? 'Item'}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="btn-inv">
            <Link to="/activity">View My Activity</Link>
          </Button>
          <Button asChild variant="outline" className="border-(--line)">
            <Link to="/catalog">Return to Catalog</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

function EmptyCheckout() {
  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="island-shell mx-auto max-w-xl rounded-2xl px-6 py-12 text-center">
        <h1 className="display-title text-3xl font-bold">Nothing to review</h1>
        <p className="mt-3 text-(--sea-ink-soft)">
          Add Catalog items to your Active Group’s Cart before starting Checkout
          Review.
        </p>
        <Button asChild className="btn-inv mt-6">
          <Link to="/catalog">Browse the Catalog</Link>
        </Button>
      </section>
    </main>
  )
}
function CheckoutLoading() {
  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl animate-pulse space-y-5">
        <div className="h-24 rounded-2xl bg-(--foam)" />
        <div className="h-48 rounded-2xl bg-(--foam)" />
        <div className="h-48 rounded-2xl bg-(--foam)" />
      </section>
    </main>
  )
}
function CheckoutError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="island-shell mx-auto max-w-xl rounded-2xl px-6 py-12 text-center">
        <h1 className="text-xl font-semibold">Checkout unavailable</h1>
        <p className="mt-2 text-sm text-(--sea-ink-soft)">
          We could not load this Active Group’s Cart.
        </p>
        <Button className="btn-inv mt-5" onClick={onRetry}>
          Try again
        </Button>
      </section>
    </main>
  )
}
function ActiveGroup({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
        Active Group
      </p>
      <p className="mt-1 text-sm font-semibold text-(--sea-ink)">{name}</p>
    </div>
  )
}
function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-(--sea-ink-soft)">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
