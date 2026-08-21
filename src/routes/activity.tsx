import { Link, createFileRoute } from '@tanstack/react-router'
import { CalendarDays, CheckCircle2, Clock3, PackageCheck, RotateCcw, Send } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDemo } from '@/demo/DemoContext'
import { useActiveGroup } from '@/lib/active-group'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/activity')({
  beforeLoad: requireAuth,
  component: ActivityPage,
})
type ActivityView = 'bookings' | 'borrowings' | 'requests'

function ActivityPage() {
  const { bookings, borrowings, requests, returnBorrowing } = useDemo()
  const { activeGroup } = useActiveGroup()
  const [view, setView] = useState<ActivityView>('bookings')
  const activity = useMemo(() => ({ bookings, borrowings, requests })[view], [bookings, borrowings, requests, view])
  const pendingRequests = requests.filter((request) => request.status === 'Pending').length
  const activeBorrowings = borrowings.filter((borrowing) => borrowing.status === 'Active').length
  return <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8"><section className="mx-auto max-w-5xl space-y-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="island-kicker mb-2 text-(--kicker)!">Member</p><h1 className="display-title text-3xl font-bold">My Activity</h1><p className="mt-2 max-w-2xl text-(--sea-ink-soft)">Keep track of your upcoming bookings, borrowings, and item requests for your Active Group.</p></div><div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm"><p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">Active Group</p><p className="mt-1 text-sm font-semibold text-(--sea-ink)">{activeGroup?.name ?? 'No Active Group'}</p></div></div>
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Activity summary"><SummaryCard icon={CalendarDays} label="Upcoming bookings" value={String(bookings.length)} /><SummaryCard icon={PackageCheck} label="Items borrowed" value={String(activeBorrowings)} /><SummaryCard icon={Clock3} label="Requests pending" value={String(pendingRequests)} /></section>
    <section className="island-shell overflow-hidden rounded-2xl"><div className="border-b border-(--line) px-5 pt-5 sm:px-6"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Activity type">{(['bookings', 'borrowings', 'requests'] as const).map((entry) => <ActivityTab key={entry} active={view === entry} count={({ bookings, borrowings, requests })[entry].length} onClick={() => setView(entry)}>{entry[0].toUpperCase() + entry.slice(1)}</ActivityTab>)}</div></div><div className="px-5 py-5 sm:px-6"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-semibold">Your {view}</h2><p className="mt-1 text-sm text-(--sea-ink-soft)">{view === 'bookings' ? 'Pickup and return coordination for your items.' : view === 'borrowings' ? 'Items you currently have out and your return history.' : 'Request Items and their current approval status.'}</p></div>{view === 'requests' && <Button asChild className="btn-inv w-fit"><Link to="/catalog">Browse Catalog <Send aria-hidden="true" size={16} /></Link></Button>}</div>
      {activity.length > 0 ? <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">{activity.map((entry) => <li key={entry.id} className="p-4 sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-4"><ActivityIcon status={entry.status} /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-(--sea-ink)">{'item' in entry ? entry.item : entry.title}</h3><Badge className={statusStyle(entry.status)}>{entry.status}</Badge></div><p className="mt-1 text-sm text-(--sea-ink-soft)">{'item' in entry ? `${entry.category} · ${entry.submitted}` : entry.detail}</p></div></div><div className="flex shrink-0 items-center gap-3"><p className="text-sm font-medium text-(--sea-ink-soft)">{'pickup' in entry ? entry.pickup : entry.date}</p>{view === 'borrowings' && entry.status === 'Active' && <Button variant="outline" className="border-(--line)" onClick={() => returnBorrowing(entry.id)}>Mark returned</Button>}</div></div></li>)}</ul> : <div className="rounded-xl border border-dashed border-(--line) px-6 py-12 text-center"><h3 className="font-semibold">No {view} yet</h3><p className="mt-2 text-sm text-(--sea-ink-soft)">Your completed demo actions will appear here.</p></div>}</div></section>
  </section></main>
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="island-shell rounded-2xl p-5"><Icon aria-hidden="true" className="text-(--lagoon-deep)" size={21} /><p className="mt-5 text-2xl font-bold text-(--sea-ink)">{value}</p><p className="mt-1 text-sm text-(--sea-ink-soft)">{label}</p></div> }
function ActivityTab({ active, count, onClick, children }: { active: boolean; count: number; onClick: () => void; children: string }) { return <button type="button" role="tab" aria-selected={active} className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${active ? 'border-(--lagoon-deep) text-(--sea-ink)' : 'border-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)'}`} onClick={onClick}>{children} <span className="text-(--sea-ink-soft)">({count})</span></button> }
function ActivityIcon({ status }: { status: string }) { const Icon = status === 'Returned' ? RotateCcw : CheckCircle2; const className = status === 'Pending' ? 'bg-violet-50 text-violet-700' : status === 'Denied' ? 'bg-red-50 text-red-700' : 'bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)'; return <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${className}`}><Icon aria-hidden="true" size={21} /></div> }
function statusStyle(status: string) { return { Scheduled: 'border-sky-200 bg-sky-50 text-sky-800', Upcoming: 'border-sky-200 bg-sky-50 text-sky-800', Active: 'border-amber-200 bg-amber-50 text-amber-800', Returned: 'border-emerald-200 bg-emerald-50 text-emerald-800', Approved: 'border-emerald-200 bg-emerald-50 text-emerald-800', Pending: 'border-violet-200 bg-violet-50 text-violet-800', Denied: 'border-red-200 bg-red-50 text-red-800' }[status] }
