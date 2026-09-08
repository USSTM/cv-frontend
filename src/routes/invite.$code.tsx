import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Ticket } from 'lucide-react'
import { useState } from 'react'

import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/button'
import { useAcceptInvitationMutation } from '@/api/session-queries'

export const Route = createFileRoute('/invite/$code')({
  component: InvitationPage,
})

function InvitationPage() {
  const { code } = Route.useParams()
  const acceptInvitation = useAcceptInvitationMutation()
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function accept() {
    setError(null)
    acceptInvitation.mutate(
      { code },
      {
        onSuccess: () => setAccepted(true),
        onError: (reason) =>
          setError(
            reason instanceof ApiError
              ? reason.message
              : 'Unable to accept this invitation. Please try again.',
          ),
      },
    )
  }

  return (
    <main className="page-wrap px-4 py-12 sm:px-6 lg:px-8">
      <section className="island-shell rise-in mx-auto max-w-lg rounded-2xl p-6 sm:p-8">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.16)] text-(--lagoon-deep)">
          {accepted ? (
            <CheckCircle2 aria-hidden="true" size={22} />
          ) : (
            <Ticket aria-hidden="true" size={22} />
          )}
        </div>
        <h1 className="display-title mt-5 text-2xl font-bold">
          {accepted ? 'Invitation accepted' : 'Join Campus Vault'}
        </h1>
        <p className="mt-3 text-base text-(--sea-ink-soft)">
          {accepted
            ? 'Your access has been updated. Sign in with your email to continue.'
            : 'Accept this invitation to join Campus Vault or gain access to an additional group.'}
        </p>
        {error && (
          <p role="alert" className="mt-5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        {accepted ? (
          <Button asChild className="btn-inv mt-6 w-full justify-center">
            <Link to="/login">Go to log in</Link>
          </Button>
        ) : (
          <Button
            className="btn-inv mt-6 w-full justify-center"
            onClick={accept}
            disabled={acceptInvitation.isPending}
          >
            {acceptInvitation.isPending ? 'Accepting…' : 'Accept invitation'}
          </Button>
        )}
      </section>
    </main>
  )
}
