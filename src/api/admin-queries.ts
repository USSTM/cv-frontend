import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { GroupUser, User, UserRoleAssignment } from './generated/types.gen'

import {
  createGroup,
  deleteGroup,
  getAdminUsers,
  getGroups,
  getGroupUsers,
  getUserRoleAssignments,
  inviteMember,
  updateMemberGroupMembership,
  updateMemberRoles,
  updateGroup,
} from './admin'

export const managedMembersQueryKey = (groupId?: string, global = false) =>
  ['admin', 'members', global ? 'global' : groupId] as const

export function useManagedMembersQuery(
  groupId: string | undefined,
  global: boolean,
) {
  return useQuery<Array<User> | Array<GroupUser>>({
    queryKey: managedMembersQueryKey(groupId, global),
    queryFn: () => (global ? getAdminUsers() : getGroupUsers(groupId!)),
    enabled: global || Boolean(groupId),
  })
}

export function useGroupsQuery(enabled: boolean) {
  return useQuery({ queryKey: ['groups'], queryFn: getGroups, enabled })
}

export function useCreateGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useDeleteGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useUpdateGroupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useMemberRolesQuery(
  userId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['admin', 'member-roles', userId],
    queryFn: () => getUserRoleAssignments(userId!),
    enabled: enabled && Boolean(userId),
  })
}

export function useMembersRolesQueries(
  memberIds: Array<string>,
  enabled: boolean,
) {
  return useQueries({
    queries: memberIds.map((memberId) => ({
      queryKey: ['admin', 'member-roles', memberId],
      queryFn: () => getUserRoleAssignments(memberId),
      enabled,
    })),
    combine: (results) => ({
      isLoading: results.some((result) => result.isLoading),
      assignments: new Map<string, Array<UserRoleAssignment>>(
        results.map((result, index) => [memberIds[index], result.data ?? []]),
      ),
    }),
  })
}

function useInvalidateMembers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['admin', 'members'] })
}

export function useInviteMemberMutation() {
  const invalidate = useInvalidateMembers()
  return useMutation({ mutationFn: inviteMember, onSuccess: invalidate })
}

export function useUpdateMemberRolesMutation() {
  const invalidate = useInvalidateMembers()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMemberRoles,
    onSuccess: async (_, input) => {
      await invalidate()
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'member-roles', input.userId],
      })
    },
  })
}

export function useUpdateMemberGroupMembershipMutation() {
  const invalidate = useInvalidateMembers()
  return useMutation({
    mutationFn: updateMemberGroupMembership,
    onSuccess: invalidate,
  })
}
