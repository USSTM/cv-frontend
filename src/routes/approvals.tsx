import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import {
  useAvailabilityQuery,
  useCreateAvailabilitiesMutation,
  useDeleteAvailabilityMutation,
  useTimeSlotsQuery,
} from '@/api/availability-queries'
import { useBookingsQuery } from '@/api/booking-queries'
import {
  useAllRequestsQuery,
  usePendingRequestsQuery,
  useReviewRequestMutation,
} from '@/api/request-queries'
import { useCurrentMemberQuery } from '@/api/session-queries'
import type { RequestItemResponse } from '@/api/generated/types.gen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { requireApprover } from '@/lib/route-guards'

export const Route = createFileRoute('/approvals')({
  beforeLoad: requireApprover,
  component: ApprovalsPage,
})

type ApprovalBody = {
  status: 'approved'
  availability_id: string
  pickup_location: string
  return_location: string
}
type View = 'pending' | 'all'
type DisplayRequest = RequestItemResponse & {
  sample?: boolean
}

const SAMPLE_REQUEST: DisplayRequest = {
  id: 'frontend-sample-request',
  user_id: 'sample-member',
  group_id: 'sample-group',
  item_id: 'sample-item',
  quantity: 1,
  status: 'pending',
  item_name: 'DSLR Camera Kit',
  requester_email: 'jordan.lee@example.com',
  group_name: 'Student Media',
  sample: true,
}

function ApprovalsPage() {
  const pending = usePendingRequestsQuery()
  const [view, setView] = useState<View>('pending')
  const allRequests = useAllRequestsQuery(view === 'all')
  const availability = useAvailabilityQuery()
  const bookings = useBookingsQuery()
  const { data: member } = useCurrentMemberQuery()
  const review = useReviewRequestMutation()
  const [openId, setOpenId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const activeQuery = view === 'pending' ? pending : allRequests
  const requests: DisplayRequest[] = [
    ...(activeQuery.data?.data ?? []),
    SAMPLE_REQUEST,
  ]
  const ownAvailability = useMemo(
    () =>
      availability.data?.filter((entry) => entry.user_id === member?.id) ?? [],
    [availability.data, member?.id],
  )
  const referencedAvailabilityIds = useMemo(
    () =>
      new Set(
        bookings.data?.data.map((booking) => booking.availability_id) ?? [],
      ),
    [bookings.data],
  )

  function submit(id: string, body: ApprovalBody | { status: 'denied' }) {
    review.mutate(
      { requestId: id, body },
      {
        onSuccess: () => {
          setApprovingId(null)
          setOpenId(null)
        },
      },
    )
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="island-kicker mb-2 text-(--kicker)!">
            Approver workspace
          </p>
          <h1 className="display-title text-3xl font-bold">Approvals</h1>
          <p className="mt-2 text-(--sea-ink-soft)">
            Review Requests and schedule approved item collection.
          </p>
        </div>
        <AvailabilityPanel
          availability={ownAvailability}
          referencedAvailabilityIds={referencedAvailabilityIds}
        />
        <section className="island-shell overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--line) px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">
                {view === 'pending' ? 'Pending Requests' : 'All Requests'}
              </h2>
              <p className="mt-1 text-sm text-(--sea-ink-soft)">
                {view === 'pending'
                  ? `${requests.length} awaiting your decision`
                  : `${requests.length} total Requests`}
              </p>
            </div>
            <div
              className="flex rounded-lg bg-(--sand) p-1"
              aria-label="Request filter"
            >
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${view === 'pending' ? 'bg-white shadow-sm' : 'text-(--sea-ink-soft)'}`}
                onClick={() => {
                  setView('pending')
                  setOpenId(null)
                }}
              >
                Pending
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${view === 'all' ? 'bg-white shadow-sm' : 'text-(--sea-ink-soft)'}`}
                onClick={() => {
                  setView('all')
                  setOpenId(null)
                }}
              >
                All Requests
              </button>
            </div>
          </div>
          {activeQuery.isPending ? (
            <p className="px-6 py-12 text-center text-sm text-(--sea-ink-soft)">
              Loading pending Requests…
            </p>
          ) : activeQuery.isError ? (
            <p
              role="alert"
              className="px-6 py-12 text-center text-sm text-red-700"
            >
              Unable to load pending Requests. Please try again.
            </p>
          ) : requests.length === 0 ? (
            <EmptyQueue />
          ) : (
            <ul className="divide-y divide-(--line)">
              {requests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  open={openId === request.id}
                  approving={view === 'pending' && approvingId === request.id}
                  pending={request.status === 'pending'}
                  availability={ownAvailability}
                  isSubmitting={review.isPending}
                  error={review.error?.message}
                  onToggle={() =>
                    setOpenId((current) =>
                      current === request.id ? null : request.id,
                    )
                  }
                  onApprove={(body) => submit(request.id, body)}
                  onDeny={() => submit(request.id, { status: 'denied' })}
                  onStart={() => setApprovingId(request.id)}
                  onCancel={() => setApprovingId(null)}
                />
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

function AvailabilityPanel({
  availability,
  referencedAvailabilityIds,
}: {
  availability: Array<{
    id: string
    time_slot_id: string
    date: string
    start_time: string
    end_time: string
  }>
  referencedAvailabilityIds: Set<string>
}) {
  const [date, setDate] = useState(() => dateValue(new Date()))
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [showExtendedHours, setShowExtendedHours] = useState(false)
  const timeSlots = useTimeSlotsQuery()
  const createAvailability = useCreateAvailabilitiesMutation()
  const deleteAvailability = useDeleteAvailabilityMutation()
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  )
  const selectedSlots = availability.filter((slot) => slot.date === date)
  const visibleTimeSlots = useMemo(
    () =>
      (timeSlots.data ?? []).filter(
        (slot) =>
          showExtendedHours ||
          (timeValue(slot.start_time) >= 7 * 60 &&
            timeValue(slot.end_time) <= 21 * 60),
      ),
    [showExtendedHours, timeSlots.data],
  )
  const startMinutes = startTime ? timeValue(startTime) : null
  const endMinutes = endTime ? timeValue(endTime) : null
  const hasValidRange =
    startMinutes !== null &&
    endMinutes !== null &&
    startMinutes < endMinutes &&
    startMinutes % 15 === 0 &&
    endMinutes % 15 === 0
  const timeSlotIds = useMemo(
    () =>
      !hasValidRange
        ? []
        : visibleTimeSlots
            .filter(
              (slot) =>
                timeValue(slot.start_time) >= startMinutes &&
                timeValue(slot.end_time) <= endMinutes,
            )
            .filter(
              (slot) =>
                !selectedSlots.some(
                  (availabilitySlot) =>
                    availabilitySlot.time_slot_id === slot.id,
                ),
            )
            .map((slot) => slot.id),
    [endMinutes, hasValidRange, selectedSlots, startMinutes, visibleTimeSlots],
  )

  function addAvailability() {
    if (!date || timeSlotIds.length === 0) return
    createAvailability.mutate(
      { date, timeSlotIds },
      {
        onSuccess: () => {
          setStartTime('')
          setEndTime('')
        },
      },
    )
  }

  return (
    <section className="island-shell rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <CalendarDays
          aria-hidden="true"
          className="mt-0.5 text-(--lagoon-deep)"
          size={20}
        />
        <div>
          <h2 className="text-lg font-semibold">My availability</h2>
          <p className="mt-1 text-sm text-(--sea-ink-soft)">
            Choose a date to view or add collection windows.
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-(--line) bg-(--foam) p-3">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            className="size-8 p-0"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            aria-label="Previous week"
          >
            <ChevronLeft aria-hidden="true" size={17} />
          </Button>
          <p className="text-sm font-semibold">
            {formatWeekRange(days[0]!, days[6]!)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="size-8 p-0"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            aria-label="Next week"
          >
            <ChevronRight aria-hidden="true" size={17} />
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const value = dateValue(day)
            const selected = value === date
            const available = availability.some((slot) => slot.date === value)
            return (
              <button
                key={value}
                type="button"
                onClick={() => setDate(value)}
                aria-pressed={selected}
                className={`relative flex min-h-14 flex-col items-center justify-center rounded-lg text-xs font-semibold ${selected ? 'bg-(--lagoon-deep) text-white' : 'bg-white text-(--sea-ink)'}`}
              >
                <span className="text-[10px] uppercase opacity-70">
                  {new Intl.DateTimeFormat('en-US', {
                    weekday: 'short',
                  }).format(day)}
                </span>
                <span className="mt-1 text-sm">{day.getDate()}</span>
                {available && (
                  <span
                    className={`mt-1 size-1.5 rounded-full ${selected ? 'bg-white' : 'bg-(--lagoon-deep)'}`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-(--line) bg-white p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
              Schedule for
            </p>
            <h3 className="mt-1 font-semibold">
              {formatAvailabilityDate(date)}
            </h3>
          </div>
          <p className="text-xs text-(--sea-ink-soft)">
            {selectedSlots.length}{' '}
            {selectedSlots.length === 1 ? 'window' : 'windows'} added
          </p>
        </div>
        <div className="mt-3">
          <p className="text-xs font-semibold text-(--sea-ink-soft)">
            Current availability
          </p>
          {selectedSlots.length ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {selectedSlots.map((slot) => (
                <span
                  key={slot.id}
                  className={`inline-flex items-center gap-1 rounded-full py-1 pl-2.5 pr-1 text-xs font-semibold ${referencedAvailabilityIds.has(slot.id) ? 'bg-violet-100 text-violet-800' : 'bg-[rgba(79,184,178,0.16)] text-(--lagoon-deep)'}`}
                >
                  {formatAvailabilityTime(slot.start_time)}–
                  {formatAvailabilityTime(slot.end_time)}
                  {referencedAvailabilityIds.has(slot.id) ? (
                    <span className="ml-1 text-[10px]">Booked</span>
                  ) : (
                    <button
                      type="button"
                      className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full hover:bg-[rgba(79,184,178,0.28)]"
                      onClick={() => deleteAvailability.mutate(slot.id)}
                      disabled={deleteAvailability.isPending}
                      aria-label={`Remove ${formatAvailabilityTime(slot.start_time)} availability`}
                    >
                      <X aria-hidden="true" size={13} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-(--sea-ink-soft)">
              No collection windows added.
            </p>
          )}
        </div>
        {timeSlots.isPending ? (
          <p className="mt-2 text-sm text-(--sea-ink-soft)">
            Loading time slots…
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Start time
              <input
                type="time"
                step="900"
                min={showExtendedHours ? undefined : '07:00'}
                max={showExtendedHours ? undefined : '21:00'}
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="mt-1 block h-11 w-full rounded-lg border border-(--line) bg-white px-3"
              />
            </label>
            <label className="text-sm font-medium">
              End time
              <input
                type="time"
                step="900"
                min={showExtendedHours ? undefined : '07:00'}
                max={showExtendedHours ? undefined : '21:00'}
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="mt-1 block h-11 w-full rounded-lg border border-(--line) bg-white px-3"
              />
            </label>
          </div>
        )}
        {startTime && endTime && !hasValidRange && (
          <p className="mt-3 text-sm text-red-700">
            Choose an end time after the start time, using 15-minute intervals.
          </p>
        )}
        {hasValidRange && (
          <p className="mt-3 text-sm text-(--sea-ink-soft)">
            {timeSlotIds.length > 0
              ? `${timeSlotIds.length} collection ${timeSlotIds.length === 1 ? 'window will' : 'windows will'} be added.`
              : 'All collection windows in this range have already been added.'}
          </p>
        )}
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-(--lagoon-deep)"
          onClick={() => setShowExtendedHours((current) => !current)}
        >
          {showExtendedHours ? 'Filter to 7am–9pm' : 'Show extended hours'}
        </button>
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            className="btn-inv"
            disabled={
              !date ||
              !hasValidRange ||
              timeSlotIds.length === 0 ||
              createAvailability.isPending
            }
            onClick={addAvailability}
          >
            {createAvailability.isPending
              ? 'Adding…'
              : `Add ${timeSlotIds.length || ''} ${timeSlotIds.length === 1 ? 'collection window' : 'collection windows'}`}
          </Button>
        </div>
      </div>
      {createAvailability.error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {createAvailability.error.message}
        </p>
      )}
      {deleteAvailability.error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {deleteAvailability.error.message}
        </p>
      )}
    </section>
  )
}

function formatAvailabilityDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatAvailabilityTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(`1970-01-01T${value}`))
}

function timeValue(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function dateValue(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function startOfWeek(value: Date) {
  const result = new Date(value)
  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - result.getDay())
  return result
}

function addDays(value: Date, days: number) {
  const result = new Date(value)
  result.setDate(result.getDate() + days)
  return result
}

function formatWeekRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${formatter.format(start)}–${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(end)}`
}

function RequestRow({
  request,
  open,
  approving,
  pending,
  availability,
  isSubmitting,
  error,
  onToggle,
  onApprove,
  onDeny,
  onStart,
  onCancel,
}: {
  request: DisplayRequest
  open: boolean
  approving: boolean
  pending: boolean
  availability: Array<{
    id: string
    date: string
    start_time: string
    end_time: string
  }>
  isSubmitting: boolean
  error?: string
  onToggle: () => void
  onApprove: (body: ApprovalBody) => void
  onDeny: () => void
  onStart: () => void
  onCancel: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-4 px-5 py-5 text-left hover:bg-(--foam) sm:px-6"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)">
          <PackageCheck aria-hidden="true" size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-(--sea-ink)">
              {request.item_name ?? `Request ${request.id}`}
            </h3>
            <Badge className={statusClass(request.status)}>
              {request.status}
            </Badge>
          </div>
          <p className="mt-1 break-all text-sm text-(--sea-ink-soft)">
            {request.requester_email ?? `Member ${request.user_id}`} ·{' '}
            {request.group_name ?? `Group ${request.group_id}`} · Qty.{' '}
            {request.quantity}
          </p>
          {request.sample && (
            <p className="mt-1 text-xs font-medium text-(--sea-ink-soft)">
              Frontend-only sample
            </p>
          )}
        </div>
      </button>
      {open && (
        <div className="border-t border-(--line) bg-(--foam) px-5 py-5 sm:px-6">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem]">
            <dl className="grid h-fit gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Requesting member</dt>
                <dd className="mt-1 break-all text-(--sea-ink-soft)">
                  {request.requester_email ?? request.user_id}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Group</dt>
                <dd className="mt-1 break-all text-(--sea-ink-soft)">
                  {request.group_name ?? request.group_id}
                </dd>
              </div>
            </dl>
            {request.sample ? (
              <p className="rounded-xl border border-(--line) bg-white p-4 text-sm text-(--sea-ink-soft)">
                This is a frontend-only sample and cannot be approved or denied.
              </p>
            ) : !pending ? (
              <p className="rounded-xl border border-(--line) bg-white p-4 text-sm text-(--sea-ink-soft)">
                This Request has already been {request.status}.
              </p>
            ) : approving ? (
              <ApprovalForm
                availability={availability}
                isSubmitting={isSubmitting}
                error={error}
                onApprove={onApprove}
                onCancel={onCancel}
              />
            ) : (
              <div className="flex flex-col justify-end gap-3">
                <Button
                  className="btn-inv w-full"
                  disabled={isSubmitting}
                  onClick={onStart}
                >
                  <Check aria-hidden="true" size={16} />
                  Approve Request
                </Button>
                <Button
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full border-red-200 text-red-700"
                  onClick={onDeny}
                >
                  <X aria-hidden="true" size={16} />
                  Deny Request
                </Button>
                {error && (
                  <p role="alert" className="text-sm text-red-700">
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

function ApprovalForm({
  availability,
  isSubmitting,
  error,
  onApprove,
  onCancel,
}: {
  availability: Array<{
    id: string
    date: string
    start_time: string
    end_time: string
  }>
  isSubmitting: boolean
  error?: string
  onApprove: (body: ApprovalBody) => void
  onCancel: () => void
}) {
  const [availabilityId, setAvailabilityId] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onApprove({
      status: 'approved',
      availability_id: availabilityId,
      pickup_location: String(form.get('pickup_location')),
      return_location: String(form.get('return_location')),
    })
  }
  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-(--line) bg-white p-4"
    >
      <h3 className="font-semibold">Booking details</h3>
      <p className="mt-1 text-sm text-(--sea-ink-soft)">
        All booking fields are required to approve a Request.
      </p>
      <div className="mt-4 space-y-3">
        <label className="block text-sm font-medium">
          Your availability
          <select
            required
            name="availability_id"
            value={availabilityId}
            onChange={(event) => setAvailabilityId(event.target.value)}
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg border border-(--line) bg-white px-3 py-2"
          >
            <option value="">Select a collection window</option>
            {availability.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.date} · {slot.start_time}–{slot.end_time}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Pickup location
          <input
            required
            name="pickup_location"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg border border-(--line) px-3 py-2"
            placeholder="Vault desk"
          />
        </label>
        <label className="block text-sm font-medium">
          Return location
          <input
            required
            name="return_location"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-lg border border-(--line) px-3 py-2"
            placeholder="Vault desk"
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3">
        <Button
          type="submit"
          className="btn-inv w-full"
          disabled={isSubmitting || !availabilityId}
        >
          <Check aria-hidden="true" size={16} />
          {isSubmitting ? 'Saving…' : 'Confirm approval'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

function EmptyQueue() {
  return (
    <div className="px-6 py-12 text-center">
      <ShieldCheck
        aria-hidden="true"
        className="mx-auto text-emerald-700"
        size={27}
      />
      <h3 className="mt-5 text-xl font-semibold">You’re all caught up</h3>
      <p className="mt-2 text-sm text-(--sea-ink-soft)">
        There are no Requests waiting for your decision.
      </p>
    </div>
  )
}

function statusClass(status: RequestItemResponse['status']) {
  return {
    pending: 'border-violet-200 bg-violet-50 text-violet-800',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    denied: 'border-red-200 bg-red-50 text-red-800',
    fulfilled: 'border-sky-200 bg-sky-50 text-sky-800',
    pending_confirmation: 'border-amber-200 bg-amber-50 text-amber-800',
    confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    expired: 'border-slate-200 bg-slate-50 text-slate-800',
    no_show: 'border-red-200 bg-red-50 text-red-800',
    cancelled: 'border-slate-200 bg-slate-50 text-slate-800',
  }[status]
}
