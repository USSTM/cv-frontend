import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  const [conditionPhoto, setConditionPhoto] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const sections = useMemo(
    () =>
      [
        {
          type: 'Take',
          title: 'Items to take',
          description:
            'These items will be recorded as taken for your Active Group.',
          items: [
            { id: 'notebook-bundle', title: 'Notebook Bundle', quantity: 2 },
          ],
        },
        {
          type: 'Borrow',
          title: 'Items to borrow',
          description:
            'You will be responsible for returning these items in their recorded condition.',
          items: [
            { id: 'macbook-charger', title: 'MacBook Charger', quantity: 1 },
          ],
        },
        {
          type: 'Request',
          title: 'Items to request',
          description:
            'These items need approval before they can be collected.',
          items: [{ id: 'arduino-kit', title: 'Arduino Kit', quantity: 1 }],
        },
      ] as const,
    [],
  )

  const itemCount = sections.reduce(
    (count, section) =>
      count + section.items.reduce((total, item) => total + item.quantity, 0),
    0,
  )

  if (submitted) {
    return (
      <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
        <section className="island-shell mx-auto max-w-2xl rounded-2xl px-6 py-12 text-center sm:px-12">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={28} />
          </div>
          <p className="island-kicker mt-6 !text-[var(--kicker)]">Submitted</p>
          <h1 className="display-title mt-2 text-3xl font-bold">
            Checkout submitted
          </h1>
          <p className="mx-auto mt-3 max-w-lg leading-7 text-(--sea-ink-soft)">
            Your items have been recorded for your Active Group. The Arduino Kit
            will appear in My Activity while it awaits approval.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
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
          <div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
              Active Group
            </p>
            <p className="mt-1 text-sm font-semibold text-(--sea-ink)">
              Your checkout is recorded for this group
            </p>
          </div>
        </div>

        <ol
          className="grid gap-3 rounded-2xl border border-(--line) bg-white p-4 sm:grid-cols-3"
          aria-label="Checkout progress"
        >
          <li className="flex items-center gap-3 text-sm text-(--sea-ink-soft)">
            <span className="flex size-7 items-center justify-center rounded-full bg-(--sand) font-bold text-(--sea-ink)">
              1
            </span>
            Cart
          </li>
          <li className="flex items-center gap-3 text-sm font-semibold text-(--sea-ink)">
            <span className="flex size-7 items-center justify-center rounded-full bg-(--header-bg) font-bold text-white">
              2
            </span>
            Review
          </li>
          <li className="flex items-center gap-3 text-sm text-(--sea-ink-soft)">
            <span className="flex size-7 items-center justify-center rounded-full bg-(--sand) font-bold text-(--sea-ink)">
              3
            </span>
            Confirmation
          </li>
        </ol>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-5">
            {sections.map((section) => (
              <section
                key={section.type}
                className="island-shell overflow-hidden rounded-2xl"
              >
                <div className="border-b border-(--line) px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    <OutcomeBadge type={section.type} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-(--sea-ink-soft)">
                    {section.description}
                  </p>
                </div>
                <ul className="divide-y divide-(--line)">
                  {section.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                    >
                      <div className="flex items-center gap-3">
                        <PackageCheck
                          aria-hidden="true"
                          className="text-(--lagoon-deep)"
                          size={20}
                        />
                        <span className="font-semibold">{item.title}</span>
                      </div>
                      <span className="text-sm text-(--sea-ink-soft)">
                        Qty. {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
                {section.type === 'Borrow' && (
                  <div className="border-t border-(--line) bg-(--foam) px-5 py-5 sm:px-6">
                    <div className="flex gap-3">
                      <Camera
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-(--lagoon-deep)"
                        size={20}
                      />
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor="condition-photo"
                          className="font-semibold"
                        >
                          Condition photo required
                        </label>
                        <p className="mt-1 text-sm leading-6 text-(--sea-ink-soft)">
                          Upload a photo of the item before borrowing it.
                        </p>
                        <input
                          id="condition-photo"
                          type="file"
                          accept="image/*"
                          className="mt-3 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-(--header-bg) file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-(--button-bg)"
                          onChange={(event) =>
                            setConditionPhoto(event.target.files?.[0] ?? null)
                          }
                        />
                        {conditionPhoto && (
                          <p className="mt-2 text-sm font-medium text-emerald-700">
                            {conditionPhoto.name} attached
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
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
              <div className="flex justify-between">
                <span className="text-(--sea-ink-soft)">Items selected</span>
                <span className="font-semibold">{itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--sea-ink-soft)">To take</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--sea-ink-soft)">To borrow</span>
                <span className="font-semibold">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--sea-ink-soft)">To request</span>
                <span className="font-semibold">1</span>
              </div>
            </div>
            <div className="rounded-xl bg-(--sand) p-3 text-sm leading-5 text-(--sea-ink-soft)">
              <ShieldCheck
                aria-hidden="true"
                className="mr-2 inline text-(--palm)"
                size={17}
              />
              Your request item is not available until an Approver approves it.
            </div>
            <Button
              className="btn-inv mt-5 w-full"
              disabled={!conditionPhoto}
              onClick={() => setSubmitted(true)}
            >
              Submit checkout
              <Send aria-hidden="true" size={16} />
            </Button>
            {!conditionPhoto && (
              <p className="mt-3 text-center text-xs leading-5 text-(--sea-ink-soft)">
                Attach the borrow item condition photo to submit.
              </p>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

function OutcomeBadge({ type }: { type: 'Take' | 'Borrow' | 'Request' }) {
  const className = {
    Take: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Borrow: 'border-sky-200 bg-sky-50 text-sky-800',
    Request: 'border-violet-200 bg-violet-50 text-violet-800',
  }[type]

  return <Badge className={className}>{type}</Badge>
}
