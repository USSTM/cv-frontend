import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <main className="page-wrap px-4 py-12 sm:px-6 lg:px-8">
      <section className="island-shell rise-in mx-auto max-w-lg rounded-2xl p-6 sm:p-8">
        <h1 className="display-title mb-3 text-2xl font-bold text-center">
          Login
        </h1>
        <p className="my-4 text-base ">
          A one-time passcode will be sent to your email address.
        </p>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold "
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-(--line) bg-white px-4 py-3 text-(--sea-ink) outline-none transition placeholder:text-(--sea-ink-soft) focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(62,137,137,0.2)]"
            />
          </div>

          <button type="submit" className="btn-inv w-full justify-center">
            Send OTP
          </button>
        </form>
      </section>
    </main>
  )
}
