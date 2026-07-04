type RoutePageProps = {
  title: string
  kicker: string
  description: string
  bullets: string[]
}

export default function RoutePage({
  title,
  kicker,
  description,
  bullets,
}: RoutePageProps) {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">{kicker}</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          {title}
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          {description}
        </p>

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.44)] p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">
            Baseline scope
          </h2>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}