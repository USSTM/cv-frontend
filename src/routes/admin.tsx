import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Boxes,
  Building2,
  CircleUserRound,
  Globe2,
  LockKeyhole,
  PackageCheck,
  Settings2,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useDemo } from '@/demo/DemoContext'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/admin')({
  beforeLoad: requireAuth,
  component: AdminPage,
})

type AdminView = 'members' | 'catalog' | 'group' | 'system'

type Member = {
  id: string
  name: string
  email: string
  role: 'Member' | 'Group Admin'
}

export const initialMembers: Member[] = [
  {
    id: 'maya-patel',
    name: 'Maya Patel',
    email: 'maya.patel@usstm.edu',
    role: 'Member',
  },
  {
    id: 'noah-williams',
    name: 'Noah Williams',
    email: 'noah.williams@usstm.edu',
    role: 'Member',
  },
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    email: 'jordan.lee@usstm.edu',
    role: 'Group Admin',
  },
]

export const catalogItems = [
  {
    id: 'macbook-charger',
    title: 'MacBook Charger',
    type: 'Borrow',
    stock: '5 available',
  },
  {
    id: 'arduino-kit',
    title: 'Arduino Kit',
    type: 'Request',
    stock: '1 available',
  },
  {
    id: 'notebook-bundle',
    title: 'Notebook Bundle',
    type: 'Take',
    stock: '20 available',
  },
]

const currentRole = 'Group Admin'

function AdminPage() {
  const {
    activeGroup,
    members: memberList,
    addMember: addDemoMember,
    items,
    borrowings,
  } = useDemo()
  const [view, setView] = useState<AdminView>('members')
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [newMember, setNewMember] = useState({ name: '', email: '' })

  function addMember() {
    const name = newMember.name.trim()
    const email = newMember.email.trim()

    if (!name || !email) return

    addDemoMember(name, email)
    setNewMember({ name: '', email: '' })
    setAddMemberOpen(false)
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 text-(--kicker)!">
              Group administration
            </p>
            <h1 className="display-title text-3xl font-bold">Admin</h1>
            <p className="mt-2 max-w-2xl text-(--sea-ink-soft)">
              Manage the members and operational data for your Active Group.
            </p>
          </div>
          <div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
              Active Group
            </p>
            <p className="mt-1 text-sm font-semibold text-(--sea-ink)">
              {activeGroup}
            </p>
            <Badge className="mt-2 border-sky-200 bg-sky-50 text-sky-800">
              {currentRole}
            </Badge>
          </div>
        </div>

        <section
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Group summary"
        >
          <SummaryCard
            icon={UsersRound}
            label="Active members"
            value={String(memberList.length)}
          />
          <SummaryCard
            icon={Boxes}
            label="Catalog items"
            value={String(items.length)}
          />
          <SummaryCard
            icon={PackageCheck}
            label="Items currently out"
            value={String(
              borrowings.filter((borrowing) => borrowing.status === 'Active')
                .length,
            )}
          />
        </section>

        <section className="island-shell overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-4 border-b border-(--line) px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Group management</h2>
              <p className="mt-1 text-sm text-(--sea-ink-soft)">
                Maintain your group’s access and catalog information. Additional
                areas can move into dedicated routes as workflows grow.
              </p>
            </div>
            <Button asChild className="btn-inv w-fit">
              <Link to="/catalog">View Catalog</Link>
            </Button>
          </div>

          <div className="border-b border-(--line) px-5 sm:px-6">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Admin sections"
            >
              <AdminTab
                active={view === 'members'}
                onClick={() => setView('members')}
              >
                Members
              </AdminTab>
              <AdminTab
                active={view === 'catalog'}
                onClick={() => setView('catalog')}
              >
                Catalog
              </AdminTab>
              <AdminTab
                active={view === 'group'}
                onClick={() => setView('group')}
              >
                Group details
              </AdminTab>
              <AdminTab
                active={view === 'system'}
                onClick={() => setView('system')}
              >
                System settings
              </AdminTab>
            </div>
          </div>

          {view === 'members' && (
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Group members</h3>
                  <p className="mt-1 text-sm text-(--sea-ink-soft)">
                    Members who can access this group’s Catalog.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-(--line)"
                  onClick={() => setAddMemberOpen(true)}
                >
                  Add member
                </Button>
              </div>
              <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
                {memberList.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-4 p-4 sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)">
                        <CircleUserRound aria-hidden="true" size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-(--sea-ink)">
                          {member.name}
                        </p>
                        <p className="truncate text-sm text-(--sea-ink-soft)">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        member.role === 'Group Admin'
                          ? 'border-sky-200 bg-sky-50 text-sky-800'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      }
                    >
                      {member.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view === 'catalog' && (
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-5">
                <h3 className="font-semibold">Catalog overview</h3>
                <p className="mt-1 text-sm text-(--sea-ink-soft)">
                  Availability for items managed by your group.
                </p>
              </div>
              <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4 sm:p-5"
                  >
                    <div>
                      <p className="font-semibold text-(--sea-ink)">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-(--sea-ink-soft)">
                        {item.stock} available
                      </p>
                    </div>
                    <Badge className={itemTypeStyle(item.type)}>
                      {item.type}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view === 'group' && (
            <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
              <GroupDetail
                icon={Building2}
                label="Group name"
                value={activeGroup}
              />
              <GroupDetail
                icon={UsersRound}
                label="Membership"
                value={`${memberList.length} active members`}
              />
              <GroupDetail
                icon={Settings2}
                label="Administrator access"
                value="2 Group Admins"
              />
              <GroupDetail
                icon={PackageCheck}
                label="Approval workflow"
                value="Managed by Approvers"
              />
              <GroupDetail
                icon={Globe2}
                label="System administration"
                value="Available to Global Admins"
              />
            </div>
          )}

          {view === 'system' && (
            <div className="px-5 py-5 sm:px-6">
              <div className="rounded-xl border border-(--line) bg-(--foam) p-5 sm:p-6">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-(--lagoon-deep)">
                    <LockKeyhole aria-hidden="true" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Global Admin settings</h3>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-(--sea-ink-soft)">
                      System-wide configuration, group provisioning, and
                      permission management are reserved for Global Admins.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add group member</DialogTitle>
            <DialogDescription>
              Add a member to the current group.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              addMember()
            }}
          >
            <div>
              <label htmlFor="member-name" className="text-sm font-semibold">
                Name
              </label>
              <Input
                id="member-name"
                className="mt-2"
                value={newMember.name}
                onChange={(event) =>
                  setNewMember((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label htmlFor="member-email" className="text-sm font-semibold">
                Student email
              </label>
              <Input
                id="member-email"
                type="email"
                className="mt-2"
                value={newMember.email}
                onChange={(event) =>
                  setNewMember((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-(--line)">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="btn-inv">
                Add member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound
  label: string
  value: string
}) {
  return (
    <div className="island-shell rounded-2xl p-5">
      <Icon aria-hidden="true" className="text-(--lagoon-deep)" size={21} />
      <p className="mt-5 text-2xl font-bold text-(--sea-ink)">{value}</p>
      <p className="mt-1 text-sm text-(--sea-ink-soft)">{label}</p>
    </div>
  )
}

function AdminTab({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${active ? 'border-(--lagoon-deep) text-(--sea-ink)' : 'border-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function GroupDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-(--line) bg-(--foam) p-4">
      <Icon
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-(--lagoon-deep)"
        size={19}
      />
      <div>
        <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-(--sea-ink)">{value}</p>
      </div>
    </div>
  )
}

function itemTypeStyle(type: string) {
  return {
    Take: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Borrow: 'border-sky-200 bg-sky-50 text-sky-800',
    Request: 'border-violet-200 bg-violet-50 text-violet-800',
  }[type]
}
