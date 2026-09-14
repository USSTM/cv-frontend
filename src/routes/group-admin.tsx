import { createFileRoute } from '@tanstack/react-router'

import { requireGroupAdmin } from '@/lib/route-guards'
import { AdminPage } from './admin'

export const Route = createFileRoute('/group-admin')({
  beforeLoad: requireGroupAdmin,
  component: () => <AdminPage scope="group" />,
})
