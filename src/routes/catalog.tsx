import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'

export const Route = createFileRoute('/catalog')({
  component: CatalogPage,
})

function CatalogPage() {
  return (
    <RoutePage
      kicker="Catalog"
      title="Catalog"
      description="This route will present the global Campus Vault catalog with item browsing, search, and item detail entry points."
      bullets={[
        'Show the available Take Item, Borrow Item, and Request Item entries.',
        'Support search and filter basics.',
        'Link into item detail pages later.',
      ]}
    />
  )
}
