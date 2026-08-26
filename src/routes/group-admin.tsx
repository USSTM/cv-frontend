import { createFileRoute } from '@tanstack/react-router'
import { Building2, MailPlus, UsersRound } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  useGroupMembersQuery,
  useInviteMemberMutation,
} from '@/api/admin-queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useActiveGroup } from '@/lib/active-group'
import { requireGroupAdmin } from '@/lib/route-guards'

export const Route = createFileRoute('/group-admin')({
  beforeLoad: requireGroupAdmin,
  component: GroupAdminPage,
})

function GroupAdminPage() {
  const { activeGroup } = useActiveGroup()
  const canManageActiveGroup =
    activeGroup?.roles.includes('group_admin') === true
  const members = useGroupMembersQuery(activeGroup?.id, canManageActiveGroup)
  const invite = useInviteMemberMutation()
  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const canSubmitInvite = email.trim().length > 0

  function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeGroup || !email.trim()) return

    invite.mutate(
      {
        email: email.trim(),
        role_name: 'member',
        scope: 'group',
        scope_id: activeGroup.id,
      },
      {
        onSuccess: (response) => {
          setEmail('')
          setInviteCode(response.code ?? null)
        },
      },
    )
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="island-kicker mb-2 text-(--kicker)!">
            Group administration
          </p>
          <h1 className="display-title text-3xl font-bold">Group Admin</h1>
          <p className="mt-2 text-(--sea-ink-soft)">
            {activeGroup
              ? `Manage members for ${activeGroup.name}.`
              : 'Choose an Active Group to manage its members.'}
          </p>
        </header>

        {!canManageActiveGroup ? (
          <section className="island-shell rounded-2xl p-6">
            <Building2
              aria-hidden="true"
              className="text-(--lagoon-deep)"
              size={24}
            />
            <h2 className="mt-4 text-lg font-semibold">
              Select a group you administer
            </h2>
            <p className="mt-1 text-sm text-(--sea-ink-soft)">
              Your current Active Group does not grant Group Admin access.
            </p>
          </section>
        ) : (
          <>
            <section className="island-shell rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <MailPlus
                  aria-hidden="true"
                  className="text-(--lagoon-deep)"
                  size={21}
                />
                <div>
                  <h2 className="font-semibold">Invite a member</h2>
                  <p className="text-sm text-(--sea-ink-soft)">
                    Send a group-scoped member invitation.
                  </p>
                </div>
              </div>
              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row"
                onSubmit={submitInvite}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="member@example.com"
                  required
                  aria-label="Member email"
                />
                <Button
                  className="btn-inv shrink-0"
                  disabled={invite.isPending || !canSubmitInvite}
                  type="submit"
                >
                  {invite.isPending ? 'Sending…' : 'Send invite'}
                </Button>
              </form>
              {inviteCode && (
                <p className="mt-3 text-sm text-(--lagoon-deep)">
                  Invitation created. Code: <code>{inviteCode}</code>
                </p>
              )}
              {invite.error && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {invite.error.message}
                </p>
              )}
            </section>

            <section className="island-shell overflow-hidden rounded-2xl">
              <div className="flex items-center gap-3 border-b border-(--line) px-5 py-4 sm:px-6">
                <UsersRound
                  aria-hidden="true"
                  className="text-(--lagoon-deep)"
                  size={21}
                />
                <div>
                  <h2 className="font-semibold">Members</h2>
                  <p className="text-sm text-(--sea-ink-soft)">
                    Members assigned to this group.
                  </p>
                </div>
              </div>
              {members.isPending ? (
                <p className="px-6 py-10 text-sm text-(--sea-ink-soft)">
                  Loading members…
                </p>
              ) : members.isError ? (
                <p role="alert" className="px-6 py-10 text-sm text-red-700">
                  {members.error.message}
                </p>
              ) : members.data?.length ? (
                <ul className="divide-y divide-(--line)">
                  {members.data.map((member) => (
                    <li
                      key={`${member.id}-${member.scope_id ?? ''}`}
                      className="px-5 py-4 sm:px-6"
                    >
                      <p className="font-medium">{member.email}</p>
                      <p className="mt-1 text-sm text-(--sea-ink-soft)">
                        Role: {member.role_name}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 py-10 text-sm text-(--sea-ink-soft)">
                  No members found for this group.
                </p>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  )
}
