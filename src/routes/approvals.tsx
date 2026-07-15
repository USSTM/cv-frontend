import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  PackageCheck,
  Pencil,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/approvals')({
  component: ApprovalsPage,
})

type RequestStatus = 'Pending' | 'Approved' | 'Denied'

interface ApprovalRequest {
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

const initialRequests: ApprovalRequest[] = [
  {
    id: 'arduino-kit',
    member: 'Maya Patel',
    group: 'Robotics Club',
    item: 'Arduino Kit',
    category: 'Maker Space',
    quantity: 1,
    submitted: 'Today at 9:42 AM',
    pickup: 'Thu, Apr 17 · 3:00–4:00 PM',
    note: 'Needed to test the sensor setup before our regional competition.',
    status: 'Pending',
  },
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

function ApprovalsPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [openRequestId, setOpenRequestId] = useState<string | null>(
    initialRequests[0].id,
  )
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null)
  const [view, setView] = useState<'pending' | 'all'>('pending')

  const displayedRequests = useMemo(
    () =>
      view === 'pending'
        ? requests.filter((request) => request.status === 'Pending')
        : requests,
    [requests, view],
  )
  const pendingCount = requests.filter(
    (request) => request.status === 'Pending',
  ).length

  function decide(
    id: string,
    status: Extract<RequestStatus, 'Approved' | 'Denied'>,
  ) {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request,
      ),
    )
    setEditingRequestId(null)
    setOpenRequestId(null)
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 text-(--kicker)!">
              Approver workspace
            </p>
            <h1 className="display-title text-3xl font-bold">Approvals</h1>
            <p className="mt-2 max-w-2xl text-(--sea-ink-soft)">
              Review Request Items and coordinate collection for members across
              Campus Vault groups.
            </p>
          </div>
          <div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
              Awaiting your decision
            </p>
            <p className="mt-1 text-sm font-semibold text-(--sea-ink)">
              {pendingCount} {pendingCount === 1 ? 'request' : 'requests'}{' '}
              pending
            </p>
          </div>
        </div>

        <section className="island-shell overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-4 border-b border-(--line) px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Request queue</h2>
              <p className="mt-1 text-sm text-(--sea-ink-soft)">
                Approval actions are available only to Approvers.
              </p>
            </div>
            <div
              className="flex w-fit rounded-lg bg-(--sand) p-1"
              aria-label="Request queue filter"
            >
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                  view === 'pending'
                    ? 'bg-white text-(--sea-ink) shadow-sm'
                    : 'text-(--sea-ink-soft)'
                }`}
                onClick={() => setView('pending')}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                  view === 'all'
                    ? 'bg-white text-(--sea-ink) shadow-sm'
                    : 'text-(--sea-ink-soft)'
                }`}
                onClick={() => setView('all')}
              >
                All requests
              </button>
            </div>
          </div>

          {displayedRequests.length > 0 ? (
            <ul className="divide-y divide-(--line)">
              {displayedRequests.map((request) => {
                const isOpen = openRequestId === request.id
                const isPending = request.status === 'Pending'
                const isEditing = editingRequestId === request.id

                return (
                  <li key={request.id}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-4 px-5 py-5 text-left hover:bg-(--foam) sm:px-6"
                      onClick={() =>
                        setOpenRequestId((current) => {
                          const next =
                            current === request.id ? null : request.id
                          if (next === null) setEditingRequestId(null)
                          return next
                        })
                      }
                      aria-expanded={isOpen}
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)">
                        <PackageCheck aria-hidden="true" size={21} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-(--sea-ink)">
                            {request.item}
                          </h3>
                          <Badge className={statusStyle(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-(--sea-ink-soft)">
                          {request.member} · {request.group}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden text-right text-sm text-(--sea-ink-soft) sm:block">
                          {request.submitted}
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={`text-(--sea-ink-soft) transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          size={18}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-(--line) bg-(--foam) px-5 py-5 sm:px-6">
                        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_15rem]">
                          <div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Detail icon={UserRound} label="Requested by">
                                {request.member} · {request.group}
                              </Detail>
                              <Detail
                                icon={CalendarDays}
                                label="Collection window"
                              >
                                {request.pickup}
                              </Detail>
                              <Detail
                                icon={PackageCheck}
                                label="Request details"
                              >
                                {request.category} · Qty. {request.quantity}
                              </Detail>
                              <Detail icon={Clock3} label="Submitted">
                                {request.submitted}
                              </Detail>
                            </div>
                            <div className="mt-5 rounded-xl border border-(--line) bg-white p-4">
                              <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
                                Member note
                              </p>
                              <p className="mt-2 text-sm leading-6 text-(--sea-ink-soft)">
                                {request.note}
                              </p>
                            </div>
                          </div>

                          {isPending || isEditing ? (
                            <div className="flex flex-col justify-end gap-3">
                              {isEditing && (
                                <p className="text-sm font-medium text-(--sea-ink-soft)">
                                  Update this decision
                                </p>
                              )}
                              <Button
                                className="btn-inv w-full"
                                onClick={() => decide(request.id, 'Approved')}
                                disabled={request.status === 'Approved'}
                              >
                                <Check aria-hidden="true" size={16} />
                                {isEditing
                                  ? 'Change to approved'
                                  : 'Approve request'}
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                onClick={() => decide(request.id, 'Denied')}
                                disabled={request.status === 'Denied'}
                              >
                                <X aria-hidden="true" size={16} />
                                {isEditing
                                  ? 'Change to denied'
                                  : 'Deny request'}
                              </Button>
                              {isEditing && (
                                <button
                                  type="button"
                                  className="text-sm font-semibold text-(--lagoon-deep)"
                                  onClick={() => setEditingRequestId(null)}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex min-h-32 flex-col justify-between rounded-xl border border-(--line) bg-white p-4">
                              <p className="text-sm leading-6 text-(--sea-ink-soft)">
                                This request has been{' '}
                                {request.status.toLowerCase()}.
                              </p>
                              <button
                                type="button"
                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-(--lagoon-deep)"
                                onClick={() => setEditingRequestId(request.id)}
                              >
                                <Pencil aria-hidden="true" size={15} />
                                Edit decision
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <ShieldCheck aria-hidden="true" size={27} />
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                You’re all caught up
              </h3>
              <p className="mt-2 text-sm text-(--sea-ink-soft)">
                There are no requests waiting for your decision.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserRound
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex gap-3">
      <Icon
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-(--lagoon-deep)"
        size={18}
      />
      <div>
        <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-5 text-(--sea-ink)">
          {children}
        </p>
      </div>
    </div>
  )
}

function statusStyle(status: RequestStatus) {
  return {
    Pending: 'border-violet-200 bg-violet-50 text-violet-800',
    Approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Denied: 'border-red-200 bg-red-50 text-red-800',
  }[status]
}
