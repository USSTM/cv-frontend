import { Link, createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RotateCcw,
  Send,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/activity')({
  component: ActivityPage,
})

type ActivityView = 'bookings' | 'borrowings' | 'requests'

const bookings = [
  {
    id: 'pickup-arduino',
    title: 'Arduino Kit pickup',
    detail: 'Robotics Club · Vault desk',
    date: 'Thu, Apr 17 · 3:00–4:00 PM',
    status: 'Scheduled',
  },
  {
    id: 'return-charger',
    title: 'MacBook Charger return',
    detail: 'Electronics · Vault desk',
    date: 'Fri, Apr 25 · 12:00–1:00 PM',
    status: 'Upcoming',
  },
]

const borrowings = [
  {
    id: 'macbook-charger',
    title: 'MacBook Charger',
    detail: 'Electronics · Borrowed Apr 11',
    date: 'Due Fri, Apr 25',
    status: 'Active',
  },
  {
    id: 'scientific-calculator',
    title: 'Scientific Calculator',
    detail: 'School Supplies · Returned Mar 28',
    date: 'Returned on time',
    status: 'Returned',
  },
]

const requests = [
  {
    id: 'arduino-kit',
    title: 'Arduino Kit',
    detail: 'Maker Space · Requested today',
    date: 'Pickup booked for Thu, Apr 17',
    status: 'Approved',
  },
  {
    id: 'camera-kit',
    title: 'DSLR Camera Kit',
    detail: 'Media Equipment · Requested Apr 14',
    date: 'Awaiting an Approver',
    status: 'Pending',
  },
  {
    id: 'speaker-set',
    title: 'Portable Speaker Set',
    detail: 'Events · Requested Mar 30',
    date: 'This request was not approved',
    status: 'Denied',
  },
]

function ActivityPage() {
  const [view, setView] = useState<ActivityView>('bookings')

  const activity = useMemo(
    () => ({ bookings, borrowings, requests })[view],
    [view],
  )

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 text-(--kicker)!">Member</p>
            <h1 className="display-title text-3xl font-bold">My Activity</h1>
            <p className="mt-2 max-w-2xl text-(--sea-ink-soft)">
              Keep track of your upcoming bookings, borrowings, and item
              requests for your Active Group.
            </p>
          </div>
          <div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
              Active Group
            </p>
            <p className="mt-1 text-sm font-semibold text-(--sea-ink)">
              Your activity is scoped to this group
            </p>
          </div>
        </div>

        <section
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Activity summary"
        >
          <SummaryCard
            icon={CalendarDays}
            label="Upcoming bookings"
            value="2"
          />
          <SummaryCard icon={PackageCheck} label="Items borrowed" value="1" />
          <SummaryCard icon={Clock3} label="Requests pending" value="1" />
        </section>

        <section className="island-shell overflow-hidden rounded-2xl">
          <div className="border-b border-(--line) px-5 pt-5 sm:px-6">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Activity type"
            >
              <ActivityTab
                active={view === 'bookings'}
                count={bookings.length}
                onClick={() => setView('bookings')}
              >
                Bookings
              </ActivityTab>
              <ActivityTab
                active={view === 'borrowings'}
                count={borrowings.length}
                onClick={() => setView('borrowings')}
              >
                Borrowings
              </ActivityTab>
              <ActivityTab
                active={view === 'requests'}
                count={requests.length}
                onClick={() => setView('requests')}
              >
                Requests
              </ActivityTab>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{viewTitle(view)}</h2>
                <p className="mt-1 text-sm text-(--sea-ink-soft)">
                  {viewDescription(view)}
                </p>
              </div>
              {view === 'requests' && (
                <Button asChild className="btn-inv w-fit">
                  <Link to="/catalog">
                    Browse Catalog
                    <Send aria-hidden="true" size={16} />
                  </Link>
                </Button>
              )}
            </div>

            <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
              {activity.map((entry) => (
                <li key={entry.id} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <ActivityIcon status={entry.status} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-(--sea-ink)">
                            {entry.title}
                          </h3>
                          <Badge className={statusStyle(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-(--sea-ink-soft)">
                          {entry.detail}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-(--sea-ink-soft)">
                      {entry.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </main>
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

function ActivityTab({
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
      className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
        active
          ? 'border-(--lagoon-deep) text-(--sea-ink)'
          : 'border-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)'
      }`}
      onClick={onClick}
    >
      {children} <span className="text-(--sea-ink-soft)">({count})</span>
    </button>
  )
}

function ActivityIcon({ status }: { status: string }) {
  const Icon = status === 'Returned' ? RotateCcw : CheckCircle2
  const className =
    status === 'Pending'
      ? 'bg-violet-50 text-violet-700'
      : status === 'Denied'
        ? 'bg-red-50 text-red-700'
        : 'bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)'

  return (
    <div
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${className}`}
    >
      <Icon aria-hidden="true" size={21} />
    </div>
  )
}

function viewTitle(view: ActivityView) {
  return {
    bookings: 'Your bookings',
    borrowings: 'Your borrowings',
    requests: 'Your requests',
  }[view]
}

function viewDescription(view: ActivityView) {
  return {
    bookings: 'Pickup and return coordination for your items.',
    borrowings: 'Items you currently have out and your return history.',
    requests: 'Request Items and their current approval status.',
  }[view]
}

function statusStyle(status: string) {
  return {
    Scheduled: 'border-sky-200 bg-sky-50 text-sky-800',
    Upcoming: 'border-sky-200 bg-sky-50 text-sky-800',
    Active: 'border-amber-200 bg-amber-50 text-amber-800',
    Returned: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Pending: 'border-violet-200 bg-violet-50 text-violet-800',
    Denied: 'border-red-200 bg-red-50 text-red-800',
  }[status]
}
