import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'

export const Route = createFileRoute('/approvals')({
  component: ApprovalsPage,
})

function ApprovalsPage() {
  return (
    <RoutePage
      kicker="Approver"
      title="Approvals"
      description="This route will expose pending requests for approvers to review, approve, or deny."
      bullets={[
        'List pending requests for approval.',
        'Keep approval-only actions separate from Group Admin views.',
        'Collect any booking fields needed for approval.',
      ]}
    />
  )
}
