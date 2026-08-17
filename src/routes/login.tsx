import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { useDemo } from '@/demo/DemoContext'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [passcode, setPasscode] = useState('')
  const [step, setStep] = useState<'email' | 'passcode'>('email')
  const { signIn } = useDemo() as any
  const navigate = useNavigate()

  function sendPasscode() {
    setStep('passcode')
  }

  function completeLogin() {
    signIn(email)
    navigate({ to: '/' })
  }

  return (
    <main className="page-wrap px-4 py-12 sm:px-6 lg:px-8">
      <section className="island-shell rise-in mx-auto max-w-lg rounded-2xl p-6 sm:p-8">
        {step === 'email' ? (
          <>
            <div className="flex size-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.16)] text-(--lagoon-deep)">
              <Mail aria-hidden="true" size={22} />
            </div>
            <h1 className="display-title mt-5 text-2xl font-bold">Log in</h1>
            <p className="mt-3 text-base text-(--sea-ink-soft)">
              Enter your email and we&apos;ll send you a one-time passcode.
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                sendPasscode()
              }}
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-(--line) bg-white px-4 py-3 text-(--sea-ink) outline-none transition placeholder:text-(--sea-ink-soft) focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(62,137,137,0.2)]"
                />
              </div>

              <button type="submit" className="btn-inv w-full justify-center">
                Send passcode
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 aria-hidden="true" size={22} />
            </div>
            <h1 className="display-title mt-5 text-2xl font-bold">
              Check your email
            </h1>
            <p className="mt-3 text-base text-(--sea-ink-soft)">
              We sent a passcode to{' '}
              <span className="font-semibold text-(--sea-ink)">
                {email || 'your email address'}
              </span>
              .
            </p>

            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                completeLogin()
              }}
            >
              <div className="space-y-2">
                <label htmlFor="passcode" className="text-sm font-semibold">
                  One-time passcode
                </label>
                <input
                  id="passcode"
                  name="passcode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  className="w-full rounded-lg border border-(--line) bg-white px-4 py-3 text-(--sea-ink) outline-none transition placeholder:text-(--sea-ink-soft) focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(62,137,137,0.2)]"
                />
              </div>

              <button type="submit" className="btn-inv w-full justify-center">
                <ShieldCheck aria-hidden="true" size={17} />
                Verify and log in
              </button>
              <button
                type="button"
                className="mx-auto flex items-center gap-2 text-sm font-semibold text-(--lagoon-deep) hover:text-(--header-bg)"
                onClick={() => setStep('email')}
              >
                <ArrowLeft aria-hidden="true" size={16} />
                Use a different email
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}
