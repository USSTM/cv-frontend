import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import type { CurrentMember } from '@/api/generated/types.gen'
import { ApiError } from '@/api/client'
import { getCurrentMember } from '@/api/member'
import { currentMemberQueryKey } from '@/api/session-queries'
import { isGlobalAdmin, hasRole } from '@/lib/member-access'
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

export async function requireApprover({
  context,
}: {
  context: { queryClient: QueryClient }
}) {
  const member = await currentMemberFor({ context })

  if (!hasRole(member, 'approver')) {
    throw redirect({ to: '/' })
  }
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

  if (!managesAtLeastOneGroup) {
    throw redirect({ to: '/' })
  }
}

export async function requireGlobalAdmin({
  context,
}: {
  context: { queryClient: QueryClient }
}) {
  const member = await currentMemberFor({ context })

  if (!isGlobalAdmin(member)) {
    throw redirect({ to: '/' })
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
