import { createFileRoute } from '@tanstack/react-router'
import RoutePage from '../components/RoutePage'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <RoutePage
      kicker="Authentication"
      title="Login"
      description="This route will host the email OTP sign-in flow and the session entry point for Campus Vault."
      bullets={[
        'Request and verify OTP credentials.',
        'Establish the browser session after successful verification.',
        'Redirect authenticated members into the app shell.',
      ]}
    />
  )
}