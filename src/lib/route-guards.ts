import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import type { CurrentMember } from '@/api/generated/types.gen'
import { ApiError } from '@/api/client'
import { getCurrentMember } from '@/api/member'
import { currentMemberQueryKey } from '@/api/session-queries'
import { hasRole } from '@/lib/member-access'

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

export async function requireApprover({
  context,
}: {
  context: { queryClient: QueryClient }
}) {
  await requireAuth({ context })
  const member = context.queryClient.getQueryData<CurrentMember>(
    currentMemberQueryKey,
  )
  if (!member || !hasRole(member, 'approver'))
    throw redirect({ to: '/activity' })
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

  throw redirect({ to: '/activity' })
}
