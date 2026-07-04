import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  return (
    <RoutePage
      kicker="Review"
      title="Checkout Review"
      description="This is the baseline Campus Vault checkout page. It will eventually group items by take, borrow, and approval-required outcomes before submission."
      bullets={[
        'Keep the checkout scope tied to the current Active Group.',
        'Show take, borrow, and request outcomes in separate sections.',
        'Collect borrow-specific details and finalize submission here.',
      ]}
    />
  )
}