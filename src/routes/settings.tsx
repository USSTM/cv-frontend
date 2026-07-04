import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <RoutePage
      kicker="Preferences"
      title="Settings"
      description="This route will hold member and app settings for the Campus Vault experience."
      bullets={[
        'Store app preferences and profile-related controls.',
        'Leave space for group-specific settings later.',
        'Keep the layout consistent with the rest of the shell.',
      ]}
    />
  )
}
