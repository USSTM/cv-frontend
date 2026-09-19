import { Navigate, createFileRoute } from '@tanstack/react-router'

import { useActiveGroup } from '@/lib/active-group'
import { isGroupAdminForActiveGroup } from '@/lib/member-access'
import { requireGroupAdmin } from '@/lib/route-guards'
import { AdminPage } from './admin'

export const Route = createFileRoute('/group-admin')({
  beforeLoad: requireGroupAdmin,
  component: GroupAdminPage,
})

function GroupAdminPage() {
  const { activeGroup } = useActiveGroup()

  if (!isGroupAdminForActiveGroup(activeGroup)) {
    return <Navigate to="/activity" replace />
  }

  return <AdminPage scope="group" />
}
