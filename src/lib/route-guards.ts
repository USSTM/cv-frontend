import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import { ApiError } from '@/api/client'
import { getCurrentMember } from '@/api/member'
import { currentMemberQueryKey } from '@/api/session-queries'

export async function requireAuth({
  context,
}: {
  context: { queryClient: QueryClient }
}) {
  try {
    await context.queryClient.ensureQueryData({
      queryKey: currentMemberQueryKey,
      queryFn: getCurrentMember,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw redirect({ to: '/login' })
    }
    throw error
  }
}

export async function redirectIfAuthenticated({
  context,
}: {
  context: { queryClient: QueryClient }
}) {
  try {
    await context.queryClient.ensureQueryData({
      queryKey: currentMemberQueryKey,
      queryFn: getCurrentMember,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return
    }
    throw error
  }

  throw redirect({ to: '/' })
}
