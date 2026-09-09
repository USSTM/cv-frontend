import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import {
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from '@/api/session-queries'

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return 'Please wait before requesting another code.'
    }
    return error.message || fallback
  }
  return fallback
}

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [passcode, setPasscode] = useState('')
  const [step, setStep] = useState<'email' | 'passcode'>('email')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const requestOtp = useRequestOtpMutation()
  const verifyOtp = useVerifyOtpMutation()

  async function sendPasscode() {
    setError(null)
    try {
      await requestOtp.mutateAsync({ email })
      setStep('passcode')
    } catch (err) {
      setError(errorMessage(err, 'Could not send a passcode. Try again.'))
    }
  }

  async function completeLogin() {
    setError(null)
    try {
      await verifyOtp.mutateAsync({ email, code: passcode })
      navigate({ to: '/activity' })
    } catch (err) {
      setError(errorMessage(err, 'That passcode is invalid or expired.'))
    }
  }

  return (
    <main className="page-wrap px-4 py-12 sm:px-6 lg:flex lg:min-h-[calc(100vh-4rem)] lg:flex-col lg:justify-center lg:px-8">
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

              {error && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={requestOtp.isPending}
                className="btn-inv w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {requestOtp.isPending ? 'Sending…' : 'Send passcode'}
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
                <p className="text-xs text-(--sea-ink-soft)">
                  No passcode? Check your spam folder. If it still hasn&apos;t
                  arrived, your email may not be registered. Contact USSTM for
                  access.
                </p>
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={verifyOtp.isPending}
                className="btn-inv w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck aria-hidden="true" size={17} />
                {verifyOtp.isPending ? 'Verifying…' : 'Verify and log in'}
              </button>
              <button
                type="button"
                className="mx-auto flex items-center gap-2 text-sm font-semibold text-(--lagoon-deep) hover:text-(--header-bg)"
                onClick={() => {
                  setStep('email')
                  setError(null)
                }}
              >
                <ArrowLeft aria-hidden="true" size={16} />
                Use a different email
              </button>
            </form>
          </>
        )}

        <p className="mt-2 pt-5 text-center text-xs text-(--sea-ink-soft)">
          &copy; {new Date().getFullYear()} USSTM
          {' · '}
          {/* <a
            href="https://portal.usstm.ca/privacy"
            className="font-medium text-(--sea-ink-soft) hover:text-(--lagoon-deep)"
          >
            Privacy Policy
          </a>
          {' · '}
          <a
            href="https://portal.usstm.ca/terms"
            className="font-medium text-(--sea-ink-soft) hover:text-(--lagoon-deep)"
          >
            Terms of Service
          </a> */}
        </p>
      </section>
    </main>
  )
}
