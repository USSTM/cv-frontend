import { createFileRoute } from '@tanstack/react-router'

import { requireGlobalAdmin } from '@/lib/route-guards'
import { AdminPage } from './admin'

export const Route = createFileRoute('/global-admin')({
  beforeLoad: requireGlobalAdmin,
  component: () => <AdminPage scope="global" />,
})
