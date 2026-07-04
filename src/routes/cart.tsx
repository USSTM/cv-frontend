import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  return (
    <RoutePage
      kicker="Checkout Prep"
      title="Cart"
      description="This route will hold the member's Active Group cart before checkout review."
      bullets={[
        'Keep the cart scoped to the current Active Group.',
        'Show mixed item types in a single list.',
        'Prepare the selection for checkout review.',
      ]}
    />
  )
}
