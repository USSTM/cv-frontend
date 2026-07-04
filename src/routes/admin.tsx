import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  return (
    <RoutePage
      kicker="Administration"
      title="Admin"
      description="This route is the baseline entry point for admin-facing areas such as group management and system settings."
      bullets={[
        'Reserve room for group admin and global admin flows.',
        'Keep the shell role-aware as the app grows.',
        'Split additional admin areas into child routes later if needed.',
      ]}
    />
  )
}
