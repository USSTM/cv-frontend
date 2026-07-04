import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'

export const Route = createFileRoute('/activity')({
  component: ActivityPage,
})

function ActivityPage() {
  return (
    <RoutePage
      kicker="Member"
      title="My Activity"
      description="This route will surface the member's bookings, borrowings, and requests in one place."
      bullets={[
        'Add tabs for bookings, borrowings, and requests.',
        'Show active and returned borrowings clearly.',
        'Provide polished loading and empty states.',
      ]}
    />
  )
}
