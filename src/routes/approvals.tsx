import { createFileRoute } from '@tanstack/react-router'
import { Check, PackageCheck, ShieldCheck, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { useAvailabilityQuery } from '@/api/availability-queries'
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

function ApprovalsPage() {
  const pending = usePendingRequestsQuery()
  const [view, setView] = useState<View>('pending')
  const allRequests = useAllRequestsQuery(view === 'all')
  const availability = useAvailabilityQuery()
  const { data: member } = useCurrentMemberQuery()
  const review = useReviewRequestMutation()
  const [openId, setOpenId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const activeQuery = view === 'pending' ? pending : allRequests
  const requests = activeQuery.data?.data ?? []
  const ownAvailability = useMemo(
    () =>
      availability.data?.filter((entry) => entry.user_id === member?.id) ?? [],
    [availability.data, member?.id],
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
  request: RequestItemResponse
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
              Request {request.id}
            </h3>
            <Badge className={statusClass(request.status)}>
              {request.status}
            </Badge>
          </div>
          <p className="mt-1 break-all text-sm text-(--sea-ink-soft)">
            Item {request.item_id} · Qty. {request.quantity}
          </p>
        </div>
      </button>
      {open && (
        <div className="border-t border-(--line) bg-(--foam) px-5 py-5 sm:px-6">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_18rem]">
            <dl className="grid h-fit gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Requesting member</dt>
                <dd className="mt-1 break-all text-(--sea-ink-soft)">
                  {request.user_id}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Group</dt>
                <dd className="mt-1 break-all text-(--sea-ink-soft)">
                  {request.group_id}
                </dd>
              </div>
            </dl>
            {!pending ? (
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
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onApprove({
      status: 'approved',
      availability_id: String(form.get('availability_id')),
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
            disabled={isSubmitting || availability.length === 0}
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
        {availability.length === 0 && (
          <p className="text-sm text-red-700">
            Add an availability window before approving a Request.
          </p>
        )}
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
          disabled={isSubmitting || availability.length === 0}
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
