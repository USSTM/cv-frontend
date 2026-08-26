import { createFileRoute } from '@tanstack/react-router'
import { Building2, Construction } from 'lucide-react'

import { useActiveGroup } from '@/lib/active-group'
import { requireGroupAdmin } from '@/lib/route-guards'

export const Route = createFileRoute('/group-admin')({
  beforeLoad: requireGroupAdmin,
  component: GroupAdminShell,
})

function GroupAdminShell() {
  const { activeGroup } = useActiveGroup()

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <div className="island-shell rounded-2xl p-6 sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.16)] text-(--lagoon-deep)">
            <Building2 aria-hidden="true" size={24} />
          </div>
          <p className="island-kicker mt-6 text-(--kicker)!">
            Group administration
          </p>
          <h1 className="display-title mt-2 text-3xl font-bold">Group Admin</h1>
          <p className="mt-3 max-w-2xl text-(--sea-ink-soft)">
            {activeGroup
              ? `Administration for ${activeGroup.name} will appear here.`
              : 'Group administration workflows will appear here.'}
          </p>
          <div className="mt-8 rounded-xl border border-dashed border-(--line) bg-(--foam) p-5">
            <Construction
              aria-hidden="true"
              className="text-(--lagoon-deep)"
              size={20}
            />
            <h2 className="mt-3 font-semibold">
              Reserved for future workflows
            </h2>
            <p className="mt-1 text-sm text-(--sea-ink-soft)">
              Member and group operational tools will be introduced here when
              they are connected to the backend.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
