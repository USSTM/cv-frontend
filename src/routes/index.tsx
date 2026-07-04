import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Campus Vault Base Template</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Route out the Campus Vault foundation.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          This starter now includes the baseline Campus Vault routes for login,
          catalog, cart, checkout, activity, approvals, admin, and settings.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            ['Login', '/login'],
            ['Catalog', '/catalog'],
            ['Cart', '/cart'],
            ['Checkout', '/checkout'],
            ['Activity', '/activity'],
            ['Approvals', '/approvals'],
            ['Admin', '/admin'],
            ['Settings', '/settings'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Login', 'Email OTP session entry point.'],
          ['Catalog', 'Browse items and enter item detail flows.'],
          ['Checkout', 'Review grouped cart outcomes before submission.'],
          ['Admin', 'Reserve space for admin-facing areas.'],
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
          </article>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Baseline routes</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
          <li>
            Navigate to <code>/login</code>, <code>/catalog</code>,{' '}
            <code>/cart</code>, <code>/checkout</code>, <code>/activity</code>,{' '}
            <code>/approvals</code>, <code>/admin</code>, and{' '}
            <code>/settings</code>.
          </li>
          <li>
            Each route is a placeholder page for the issue scaffold and can be
            expanded later.
          </li>
          <li>
            The routes are wired into the home page for quick manual checks.
          </li>
        </ul>
      </section>
    </main>
  )
}
