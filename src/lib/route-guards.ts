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
  if (
    !member ||
    (!hasRole(member, 'approver') && !hasRole(member, 'global_admin'))
  )
    throw redirect({ to: '/activity' })
}

async function currentMemberFor({
  context,
}: {
  context: { queryClient: QueryClient }
}) {
  await requireAuth({ context })
  return context.queryClient.ensureQueryData({
    queryKey: currentMemberQueryKey,
    queryFn: getCurrentMember,
  })
}

export async function requireGroupAdmin({
  context,
}: {
  context: { queryClient: QueryClient }
}) {
  const member = await currentMemberFor({ context })
  const managesAtLeastOneGroup = member.groups.some((group) =>
    group.roles.includes('group_admin'),
  )

  if (!managesAtLeastOneGroup) throw redirect({ to: '/activity' })
}

export async function requireGlobalAdmin({
  context,
}: {
  context: { queryClient: QueryClient }
}) {
  const member = await currentMemberFor({ context })

  if (!hasRole(member, 'global_admin')) throw redirect({ to: '/activity' })
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
