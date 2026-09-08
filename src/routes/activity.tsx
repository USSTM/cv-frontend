import { Link, createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Send,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import type {
  BookingResponse,
  BorrowingResponse,
  ItemResponse,
  RequestItemResponse,
} from '@/api/generated/types.gen'
import {
  useActivityItemsQuery,
  useMemberBorrowingsQuery,
  useMemberRequestsQuery,
  useMyBookingsQuery,
} from '@/api/activity-queries'
import { useCurrentMemberQuery } from '@/api/session-queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useActiveGroup } from '@/lib/active-group'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/activity')({
  beforeLoad: requireAuth,
  component: ActivityPage,
})
type ActivityView = 'bookings' | 'borrowings' | 'requests'

function ActivityPage() {
  const [view, setView] = useState<ActivityView>('bookings')
  const { activeGroup } = useActiveGroup()
  const { data: member } = useCurrentMemberQuery()
  const bookings = useMyBookingsQuery()
  const borrowings = useMemberBorrowingsQuery(member?.id)
  const requests = useMemberRequestsQuery(member?.id)
  const items = useActivityItemsQuery()
  const itemNames = useMemo(
    () => new Map(items.data?.data.map((item) => [item.id, item.name])),
    [items.data],
  )
  const filteredBorrowings = (borrowings.data?.data ?? []).filter(
    (entry) => !activeGroup || entry.group_id === activeGroup.id,
  )
  const filteredRequests = (requests.data ?? []).filter(
    (entry) => !activeGroup || entry.group_id === activeGroup.id,
  )
  const entries = {
    bookings: bookings.data?.data ?? [],
    borrowings: filteredBorrowings,
    requests: filteredRequests,
  }
  const isLoading =
    bookings.isPending ||
    borrowings.isPending ||
    requests.isPending ||
    items.isPending
  const isError =
    bookings.isError || borrowings.isError || requests.isError || items.isError
  const activeBorrowings = filteredBorrowings.filter(
    (entry) => !entry.returned_at,
  ).length
  const pendingRequests = filteredRequests.filter(
    (entry) => entry.status === 'pending',
  ).length

  function retry() {
    void bookings.refetch()
    void borrowings.refetch()
    void requests.refetch()
    void items.refetch()
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 text-(--kicker)!">Member</p>
            <h1 className="display-title text-3xl font-bold">My Activity</h1>
            <p className="mt-2 max-w-2xl text-(--sea-ink-soft)">
              Track your bookings, borrowings, and item requests for your Active
              Group.
            </p>
          </div>
          <ActiveGroupCard name={activeGroup?.name} />
        </header>
        <section
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Activity summary"
        >
          <SummaryCard
            icon={CalendarDays}
            label="Bookings"
            value={isLoading ? '—' : String(entries.bookings.length)}
          />
          <SummaryCard
            icon={PackageCheck}
            label="Items borrowed"
            value={isLoading ? '—' : String(activeBorrowings)}
          />
          <SummaryCard
            icon={Clock3}
            label="Requests pending"
            value={isLoading ? '—' : String(pendingRequests)}
          />
        </section>
        <section className="island-shell overflow-hidden rounded-2xl">
          <div className="border-b border-(--line) px-5 pt-5 sm:px-6">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Activity type"
            >
              {(['bookings', 'borrowings', 'requests'] as const).map(
                (entry) => (
                  <Tab
                    key={entry}
                    active={view === entry}
                    count={entries[entry].length}
                    onClick={() => setView(entry)}
                  >
                    {entry[0].toUpperCase() + entry.slice(1)}
                  </Tab>
                ),
              )}
            </div>
          </div>
          <div className="px-5 py-5 sm:px-6">
            <Heading view={view} />
            {isLoading ? (
              <Loading />
            ) : isError ? (
              <ErrorState onRetry={retry} />
            ) : view === 'bookings' ? (
              <BookingsList entries={entries.bookings} />
            ) : view === 'borrowings' ? (
              <BorrowingsList
                entries={entries.borrowings}
                itemNames={itemNames}
              />
            ) : (
              <RequestsList entries={entries.requests} itemNames={itemNames} />
            )}
          </div>
        </section>
      </section>
    </main>
  )
}

function Heading({ view }: { view: ActivityView }) {
  const text = {
    bookings: 'Pickup and return coordination for your items.',
    borrowings: 'Items you currently have out and your return history.',
    requests: 'Request Items and their current approval status.',
  }[view]
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold">Your {view}</h2>
        <p className="mt-1 text-sm text-(--sea-ink-soft)">{text}</p>
      </div>
      {view === 'requests' && (
        <Button asChild className="btn-inv w-fit">
          <Link to="/catalog">
            Browse Catalog <Send aria-hidden="true" size={16} />
          </Link>
        </Button>
      )}
    </div>
  )
}
function BookingsList({ entries }: { entries: BookingResponse[] }) {
  return entries.length ? (
    <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
      {entries.map((entry) => (
        <ActivityRow
          key={entry.id}
          title={entry.item_name ?? 'Item booking'}
          status={entry.status}
          detail={`${entry.pick_up_location} · Pickup ${formatDate(entry.pick_up_date)}`}
          date={`Return ${formatDate(entry.return_date)}`}
        />
      ))}
    </ul>
  ) : (
    <Empty view="bookings" />
  )
}
function BorrowingsList({
  entries,
  itemNames,
}: {
  entries: BorrowingResponse[]
  itemNames: Map<string, string>
}) {
  return entries.length ? (
    <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
      {entries.map((entry) => {
        const returned = Boolean(entry.returned_at)
        return (
          <ActivityRow
            key={entry.id}
            title={itemNames.get(entry.item_id) ?? 'Catalog item'}
            status={returned ? 'returned' : 'active'}
            detail={`Borrowed ${formatDate(entry.borrowed_at)} · Due ${formatDate(entry.due_date)}`}
            date={
              returned
                ? `Returned ${formatDate(entry.returned_at!)}`
                : `Due ${formatDate(entry.due_date)}`
            }
          />
        )
      })}
    </ul>
  ) : (
    <Empty view="borrowings" />
  )
}
function RequestsList({
  entries,
  itemNames,
}: {
  entries: RequestItemResponse[]
  itemNames: Map<string, string>
}) {
  return entries.length ? (
    <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
      {entries.map((entry) => (
        <ActivityRow
          key={entry.id}
          title={itemNames.get(entry.item_id) ?? 'Catalog item'}
          status={entry.status}
          detail={`Quantity: ${entry.quantity} · Submitted request`}
          date={
            entry.reviewed_at
              ? `Reviewed ${formatDate(entry.reviewed_at)}`
              : 'Awaiting review'
          }
        />
      ))}
    </ul>
  ) : (
    <Empty view="requests" />
  )
}
function ActivityRow({
  title,
  status,
  detail,
  date,
}: {
  title: string
  status: string
  detail: string
  date: string
}) {
  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${status === 'pending' ? 'bg-violet-50 text-violet-700' : status === 'denied' ? 'bg-red-50 text-red-700' : 'bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)'}`}
          >
            <CheckCircle2 aria-hidden="true" size={21} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-(--sea-ink)">{title}</h3>
              <Badge className={statusStyle(status)}>
                {statusLabel(status)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-(--sea-ink-soft)">{detail}</p>
          </div>
        </div>
        <p className="shrink-0 text-sm font-medium text-(--sea-ink-soft)">
          {date}
        </p>
      </div>
    </li>
  )
}
function Empty({ view }: { view: ActivityView }) {
  return (
    <div className="rounded-xl border border-dashed border-(--line) px-6 py-12 text-center">
      <h3 className="font-semibold">No {view} yet</h3>
      <p className="mt-2 text-sm text-(--sea-ink-soft)">
        New {view} for your Active Group will appear here.
      </p>
    </div>
  )
}
function Loading() {
  return (
    <div className="space-y-3" aria-label="Loading activity">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-xl bg-(--foam)" />
      ))}
    </div>
  )
}
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-(--line) px-6 py-12 text-center">
      <h3 className="font-semibold">Activity could not be loaded</h3>
      <p className="mt-2 text-sm text-(--sea-ink-soft)">
        Please try again in a moment.
      </p>
      <Button
        variant="outline"
        className="mt-5 border-(--line)"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  )
}
function ActiveGroupCard({ name }: { name?: string }) {
  return (
    <div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
        Active Group
      </p>
      <p className="mt-1 text-sm font-semibold text-(--sea-ink)">
        {name ?? 'No Active Group'}
      </p>
    </div>
  )
}
function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="island-shell rounded-2xl p-5">
      <Icon aria-hidden="true" className="text-(--lagoon-deep)" size={21} />
      <p className="mt-5 text-2xl font-bold text-(--sea-ink)">{value}</p>
      <p className="mt-1 text-sm text-(--sea-ink-soft)">{label}</p>
    </div>
  )
}
function Tab({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean
  count: number
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${active ? 'border-(--lagoon-deep) text-(--sea-ink)' : 'border-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)'}`}
      onClick={onClick}
    >
      {children} <span className="text-(--sea-ink-soft)">({count})</span>
    </button>
  )
}
function statusStyle(status: string) {
  return (
    {
      active: 'border-amber-200 bg-amber-50 text-amber-800',
      returned: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      pending: 'border-violet-200 bg-violet-50 text-violet-800',
      denied: 'border-red-200 bg-red-50 text-red-800',
      confirmed: 'border-sky-200 bg-sky-50 text-sky-800',
      pending_confirmation: 'border-sky-200 bg-sky-50 text-sky-800',
      fulfilled: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      cancelled: 'border-slate-200 bg-slate-50 text-slate-700',
      expired: 'border-slate-200 bg-slate-50 text-slate-700',
      no_show: 'border-slate-200 bg-slate-50 text-slate-700',
    }[status] ?? 'border-slate-200 bg-slate-50 text-slate-700'
  )
}
function statusLabel(status: string) {
  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}
