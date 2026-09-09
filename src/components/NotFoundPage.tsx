import { Link } from '@tanstack/react-router'
import { ArrowLeft, MapPinOff } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main
      id="not-found"
      className="page-wrap flex min-h-[calc(100vh-8rem)] items-center px-4 py-12 sm:px-6"
    >
      <section className="island-shell rise-in mx-auto w-full max-w-2xl overflow-hidden rounded-2xl p-8 text-center sm:p-12">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[rgba(79,184,178,0.16)] text-(--lagoon-deep)">
          <MapPinOff aria-hidden="true" size={28} />
        </div>
        <p className="mt-7 text-sm font-bold tracking-[0.18em] text-(--lagoon-deep) uppercase">
          Error 404
        </p>
        <h1 className="display-title mt-3 text-4xl font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
          This page can’t be found.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-(--sea-ink-soft)">
          The link may be out of date, or the page may have moved. Return to the
          Catalog to keep exploring Campus Vault.
        </p>
        <Link to="/catalog" className="btn-inv mt-8 gap-2">
          <ArrowLeft aria-hidden="true" size={17} />
          Go to the Catalog
        </Link>
      </section>
    </main>
  )
}
