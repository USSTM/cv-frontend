import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  PackageSearch,
  ShoppingCart,
} from 'lucide-react'
import { useDemo } from '@/demo/DemoContext'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/')({
  beforeLoad: requireAuth,
  component: HomePage,
})

const itemTypes = [
  {
    title: 'Take Item',
    description: 'Pick it up and keep it—no return tracking required.',
    accent: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  {
    title: 'Borrow Item',
    description: 'Use it for now, then return it by the agreed due date.',
    accent: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
  {
    title: 'Request Item',
    description: 'Send a request when an Approver needs to review access.',
    accent: 'bg-violet-50 text-violet-800 ring-violet-200',
  },
]

const nextSteps = [
  {
    icon: PackageSearch,
    title: 'Browse the Catalog',
    description: 'Find shared items your group can take, borrow, or request.',
    to: '/catalog' as const,
    label: 'Open Catalog',
  },
  {
    icon: ShoppingCart,
    title: 'Review your Cart',
    description: 'Keep your selections together before Checkout Review.',
    to: '/cart' as const,
    label: 'View Cart',
  },
  {
    icon: ClipboardList,
    title: 'Track My Activity',
    description:
      'See bookings, borrowings, and requests for your Active Group.',
    to: '/activity' as const,
    label: 'View My Activity',
  },
]

function HomePage() {
  const { activeGroup } = useDemo()
  return (
    <main className="page-wrap px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.72fr)]">
        <div className="island-shell rise-in overflow-hidden rounded-2xl p-6 sm:p-9">
          <p className="mb-3 text-sm font-semibold tracking-wide text-(--lagoon-deep)">
            CAMPUS VAULT
          </p>
          <h1 className="display-title max-w-3xl text-4xl leading-tight font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
            Shared resources, ready when your group needs them.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-(--sea-ink-soft) sm:text-lg">
            Discover items in the Catalog, collect what you need in your Cart,
            and keep every pickup, return, and request on track.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalog" className="btn-inv gap-2">
              Browse the Catalog
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link
              to="/activity"
              className="inline-flex items-center gap-2 rounded-lg border border-(--line) bg-white px-5 py-3 text-sm font-semibold text-(--sea-ink) no-underline hover:border-(--lagoon-deep) hover:text-(--sea-ink)"
            >
              <CalendarDays aria-hidden="true" size={17} />
              My Activity
            </Link>
          </div>
        </div>

        <aside
          className="island-shell rise-in rounded-2xl p-6"
          style={{ animationDelay: '90ms' }}
          aria-labelledby="active-group-title"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.16)] text-(--lagoon-deep)">
            <CheckCircle2 aria-hidden="true" size={22} />
          </div>
          <p className="mt-5 text-xs font-bold tracking-[0.16em] text-(--sea-ink-soft) uppercase">
            Working in
          </p>
          <h2
            id="active-group-title"
            className="mt-2 text-xl font-bold text-(--sea-ink)"
          >
            {activeGroup}
          </h2>
          <p className="mt-3 text-sm leading-6 text-(--sea-ink-soft)">
            Your Cart, Checkout Review, bookings, borrowings, and requests are
            all recorded for the group you are acting within.
          </p>
          <Link
            to="/settings"
            className="mt-5 inline-flex text-sm font-semibold text-(--lagoon-deep) underline-offset-4 hover:text-(--header-bg) hover:underline"
          >
            Manage your settings
          </Link>
        </aside>
      </section>

      <section className="mt-10" aria-labelledby="start-here-title">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-(--lagoon-deep)">
              GET STARTED
            </p>
            <h2
              id="start-here-title"
              className="mt-1 text-2xl font-bold text-(--sea-ink)"
            >
              What would you like to do?
            </h2>
          </div>
          <p className="text-sm text-(--sea-ink-soft)">
            Everything is organized around your Active Group.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {nextSteps.map(
            ({ icon: Icon, title, description, to, label }, index) => (
              <article
                key={title}
                className="feature-card rise-in flex min-h-64 flex-col rounded-2xl border border-(--line) p-6"
                style={{ animationDelay: `${index * 80 + 140}ms` }}
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.16)] text-(--lagoon-deep)">
                  <Icon aria-hidden="true" size={21} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-(--sea-ink)">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-(--sea-ink-soft)">
                  {description}
                </p>
                <Link
                  to={to}
                  className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-semibold text-(--lagoon-deep) no-underline hover:text-(--header-bg)"
                >
                  {label}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        className="island-shell rise-in mt-10 rounded-2xl p-6 sm:p-8"
        style={{ animationDelay: '420ms' }}
        aria-labelledby="how-it-works-title"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-(--lagoon-deep)">
            HOW IT WORKS
          </p>
          <h2
            id="how-it-works-title"
            className="mt-1 text-2xl font-bold text-(--sea-ink)"
          >
            Access the right kind of shared item
          </h2>
          <p className="mt-3 text-sm leading-6 text-(--sea-ink-soft)">
            Campus Vault makes the next step clear before you check out.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {itemTypes.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-(--line) bg-white p-5"
            >
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${item.accent}`}
              >
                {item.title}
              </span>
              <p className="mt-4 text-sm leading-6 text-(--sea-ink-soft)">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
