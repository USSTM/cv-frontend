import { createFileRoute } from '@tanstack/react-router'

import LoginForm from '@/components/LoginForm'
import { redirectIfAuthenticated } from '@/lib/route-guards'

export const Route = createFileRoute('/login')({
  beforeLoad: redirectIfAuthenticated,
  component: LoginForm,
})
