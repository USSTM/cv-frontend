import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createGroup,
  getGroupMembers,
  getGroups,
  getSystemUsers,
  inviteMember,
} from './admin'

export const groupsQueryKey = ['groups'] as const
export const systemUsersQueryKey = ['admin', 'users'] as const
export const groupMembersQueryKey = (groupId: string) =>
  ['admin', 'groups', groupId, 'members'] as const

export function useGroupMembersQuery(groupId?: string, enabled = true) {
  return useQuery({
    queryKey: groupMembersQueryKey(groupId ?? 'none'),
    queryFn: () => getGroupMembers(groupId!),
    enabled: Boolean(groupId) && enabled,
  })
}

export function useSystemUsersQuery() {
  return useQuery({ queryKey: systemUsersQueryKey, queryFn: getSystemUsers })
}

export function useGroupsQuery() {
  return useQuery({ queryKey: groupsQueryKey, queryFn: getGroups })
}

export function useInviteMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inviteMember,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: groupMembersQueryKey(variables.scope_id ?? 'none'),
      })
      void queryClient.invalidateQueries({ queryKey: systemUsersQueryKey })
    },
  })
}

export function useCreateGroupMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupsQueryKey })
    },
  })
}
