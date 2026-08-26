import { createFileRoute } from '@tanstack/react-router'
import { Building2, ChevronDown, Plus, UsersRound } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Group } from '@/api/generated/types.gen'

import {
  useCreateGroupMutation,
  useGroupMembersQuery,
  useGroupsQuery,
  useInviteMemberMutation,
  useSystemUsersQuery,
} from '@/api/admin-queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requireGlobalAdmin } from '@/lib/route-guards'

export const Route = createFileRoute('/global-admin')({
  beforeLoad: requireGlobalAdmin,
  component: GlobalAdminPage,
})

function GlobalAdminPage() {
  const users = useSystemUsersQuery()
  const groups = useGroupsQuery()
  const createGroup = useCreateGroupMutation()
  const invite = useInviteMemberMutation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [expandedGroupIds, setExpandedGroupIds] = useState<Array<string>>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<
    'member' | 'group_admin' | 'approver' | 'admin'
  >('member')
  const [inviteGroupId, setInviteGroupId] = useState('')
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const globalAdmins = users.data?.filter((user) => user.role === 'admin') ?? []
  const groupIds = groups.data?.map((group) => group.id) ?? []
  const allGroupsExpanded =
    groupIds.length > 0 && groupIds.every((id) => expandedGroupIds.includes(id))
  const canSubmitInvite =
    inviteEmail.trim().length > 0 &&
    (!isGroupScopedRole(inviteRole) || inviteGroupId.length > 0)
  const canCreateGroup = name.trim().length > 0

  function submitGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return

    createGroup.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setName('')
          setDescription('')
        },
      },
    )
  }

  function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      !inviteEmail.trim() ||
      (isGroupScopedRole(inviteRole) && !inviteGroupId)
    ) {
      return
    }

    invite.mutate(
      isGroupScopedRole(inviteRole)
        ? {
            email: inviteEmail.trim(),
            role_name: inviteRole,
            scope: 'group',
            scope_id: inviteGroupId,
          }
        : {
            email: inviteEmail.trim(),
            role_name: inviteRole,
            scope: 'global',
          },
      {
        onSuccess: (response) => {
          setInviteEmail('')
          setInviteGroupId('')
          setInviteCode(response.code ?? null)
        },
      },
    )
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="island-kicker mb-2 text-(--kicker)!">
            System administration
          </p>
          <h1 className="display-title text-3xl font-bold">Global Admin</h1>
          <p className="mt-2 text-(--sea-ink-soft)">
            Manage Campus Vault groups and view Global Admins.
          </p>
        </header>

        <section className="island-shell rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <UsersRound
              aria-hidden="true"
              className="text-(--lagoon-deep)"
              size={21}
            />
            <div>
              <h2 className="font-semibold">Invite a user</h2>
              <p className="text-sm text-(--sea-ink-soft)">
                Invite a member to a group or grant a global role.
              </p>
            </div>
          </div>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={submitInvite}
          >
            <Input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="member@example.com"
              required
              aria-label="User email"
            />
            <label className="sr-only" htmlFor="global-invite-role">
              Role
            </label>
            <select
              id="global-invite-role"
              value={inviteRole}
              onChange={(event) =>
                setInviteRole(
                  event.target.value as
                    'member' | 'group_admin' | 'approver' | 'admin',
                )
              }
              className="h-10 rounded-lg border border-(--line) bg-white px-3 text-sm"
            >
              <option value="member">Group Member</option>
              <option value="group_admin">Group Admin</option>
              <option value="approver">Approver</option>
              <option value="admin">Global Admin</option>
            </select>
            {isGroupScopedRole(inviteRole) && (
              <>
                <label className="sr-only" htmlFor="global-invite-group">
                  Group
                </label>
                <select
                  id="global-invite-group"
                  value={inviteGroupId}
                  onChange={(event) => setInviteGroupId(event.target.value)}
                  required
                  className="h-10 rounded-lg border border-(--line) bg-white px-3 text-sm"
                >
                  <option value="">Choose a group</option>
                  {groups.data?.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <div className="hidden sm:block" />
              </>
            )}
            <Button
              className="btn-inv sm:col-span-2 sm:justify-self-end"
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

        <section className="island-shell rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Plus
              aria-hidden="true"
              className="text-(--lagoon-deep)"
              size={21}
            />
            <div>
              <h2 className="font-semibold">Create a group</h2>
              <p className="text-sm text-(--sea-ink-soft)">
                Add a new Campus Vault group.
              </p>
            </div>
          </div>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={submitGroup}
          >
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Group name"
              required
              aria-label="Group name"
            />
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description (optional)"
              aria-label="Group description"
            />
            <Button
              className="btn-inv"
              disabled={createGroup.isPending || !canCreateGroup}
              type="submit"
            >
              {createGroup.isPending ? 'Creating…' : 'Create group'}
            </Button>
          </form>
          {createGroup.error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {createGroup.error.message}
            </p>
          )}
        </section>

        <div className="space-y-6">
          <Directory
            title="Groups"
            description="Expand a group to view its information."
            icon={<Building2 aria-hidden="true" size={21} />}
            loading={groups.isPending}
            error={groups.error?.message}
            empty="No groups found."
            hasResults={(groups.data?.length ?? 0) > 0}
            action={
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  disabled={groupIds.length === 0 || allGroupsExpanded}
                  onClick={() => setExpandedGroupIds(groupIds)}
                >
                  Expand all
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  disabled={expandedGroupIds.length === 0}
                  onClick={() => setExpandedGroupIds([])}
                >
                  Collapse all
                </Button>
              </div>
            }
          >
            {groups.data?.map((group) => (
              <GroupDirectoryRow
                key={group.id}
                group={group}
                expanded={expandedGroupIds.includes(group.id)}
                onExpandedChange={(expanded) =>
                  setExpandedGroupIds((current) =>
                    expanded
                      ? [...new Set([...current, group.id])]
                      : current.filter((id) => id !== group.id),
                  )
                }
              />
            ))}
          </Directory>
          <Directory
            title="Global Admins"
            description="All Global Administrators."
            icon={<UsersRound aria-hidden="true" size={21} />}
            loading={users.isPending}
            error={users.error?.message}
            empty="No Global Admins found."
            hasResults={globalAdmins.length > 0}
          >
            {globalAdmins.map((user) => (
              <li key={user.id} className="px-5 py-4">
                <p className="font-medium">{user.email}</p>
                <p className="mt-1 text-sm text-(--sea-ink-soft)">
                  Global Admin
                </p>
              </li>
            ))}
          </Directory>
        </div>
      </section>
    </main>
  )
}

function GroupDirectoryRow({
  group,
  expanded,
  onExpandedChange,
}: {
  group: Group
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
}) {
  const members = useGroupMembersQuery(group.id, expanded)

  return (
    <li className="px-5 py-3">
      <details
        className="group"
        open={expanded}
        onToggle={(event) => onExpandedChange(event.currentTarget.open)}
      >
        <summary className="cursor-pointer list-none marker:hidden">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block font-medium">{group.name}</span>
              <span className="mt-1 block text-sm text-(--sea-ink-soft)">
                {group.description || 'No description provided.'}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="mt-1 shrink-0 text-(--lagoon-deep) transition-transform group-open:rotate-180"
              size={18}
            />
          </span>
        </summary>
        <div className="mt-4 border-t border-(--line) pt-4">
          <h3 className="text-sm font-semibold">Members</h3>
          {members.isPending ? (
            <p className="mt-2 text-sm text-(--sea-ink-soft)">
              Loading members…
            </p>
          ) : members.isError ? (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {members.error.message}
            </p>
          ) : members.data?.length ? (
            <ul className="mt-2 space-y-2">
              {members.data.map((member) => (
                <li
                  key={`${member.id}-${member.scope_id ?? ''}`}
                  className="text-sm"
                >
                  <span className="font-medium">{member.email}</span>
                  <span className="text-(--sea-ink-soft)">
                    {' '}
                    · {member.role_name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-(--sea-ink-soft)">
              No members found.
            </p>
          )}
        </div>
      </details>
    </li>
  )
}

function isGroupScopedRole(role: string) {
  return role === 'member' || role === 'group_admin'
}

function Directory({
  title,
  description,
  icon,
  loading,
  error,
  empty,
  hasResults,
  action,
  children,
}: {
  title: string
  description: string
  icon: ReactNode
  loading: boolean
  error?: string
  empty: string
  hasResults: boolean
  action?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="island-shell overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-(--line) px-5 py-4 text-(--lagoon-deep)">
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-(--sea-ink)">
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-(--sea-ink-soft)">{description}</p>
          </div>
        </div>
        {action}
      </div>
      {loading ? (
        <p className="px-5 py-10 text-sm text-(--sea-ink-soft)">Loading…</p>
      ) : error ? (
        <p role="alert" className="px-5 py-10 text-sm text-red-700">
          {error}
        </p>
      ) : hasResults ? (
        <ul className="divide-y divide-(--line)">{children}</ul>
      ) : (
        <p className="px-5 py-10 text-sm text-(--sea-ink-soft)">{empty}</p>
      )}
    </section>
  )
}
