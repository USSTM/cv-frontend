import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/invite/')({
  component: InvitationCodePage,
})

function InvitationCodePage() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  function continueToInvitation() {
    const invitationCode = code.trim()
    if (!invitationCode) return

    navigate({ to: '/invite/$code', params: { code: invitationCode } })
  }

  return (
    <main className="page-wrap px-4 py-12 sm:px-6 lg:px-8">
      <section className="island-shell rise-in mx-auto max-w-lg rounded-2xl p-6 sm:p-8">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.16)] text-(--lagoon-deep)">
          <Ticket aria-hidden="true" size={22} />
        </div>
        <h1 className="display-title mt-5 text-2xl font-bold">
          Accept an invitation
        </h1>
        <p className="mt-3 text-base text-(--sea-ink-soft)">
          Enter the invitation code from your Campus Vault email. You can use
          this whether you are new or have already joined another group.
        </p>
        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            continueToInvitation()
          }}
        >
          <div>
            <label htmlFor="invitation-code" className="text-sm font-semibold">
              Invitation code
            </label>
            <Input
              id="invitation-code"
              className="mt-2"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <Button type="submit" className="btn-inv w-full justify-center">
            Continue
          </Button>
        </form>
      </section>
    </main>
  )
}
