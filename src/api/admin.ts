import type {
  Group,
  GroupCreateRequest,
  GroupUpdateRequest,
  GroupUser,
  InviteUserRequest,
  User,
  UserRoleAssignment,
} from './generated/types.gen'
import { apiRequest } from './client'

export function getAdminUsers() {
  return apiRequest<Array<User>>('/admin/users')
}

export function getGroupUsers(groupId: string) {
  return apiRequest<Array<GroupUser>>(
    `/admin/users/group/${encodeURIComponent(groupId)}`,
  )
}

export function getUserRoleAssignments(userId: string) {
  return apiRequest<Array<UserRoleAssignment>>(
    `/admin/users/${encodeURIComponent(userId)}/roles`,
  )
}

export function getGroups() {
  return apiRequest<Array<Group>>('/groups')
}

export function createGroup(input: GroupCreateRequest) {
  return apiRequest<Group>('/groups', { method: 'POST', body: input })
}

export function deleteGroup(groupId: string) {
  return apiRequest<void>(`/groups/${encodeURIComponent(groupId)}`, {
    method: 'DELETE',
  })
}

export function updateGroup(input: { groupId: string } & GroupUpdateRequest) {
  const { groupId, ...body } = input
  return apiRequest<Group>(`/groups/${encodeURIComponent(groupId)}`, {
    method: 'PUT',
    body,
  })
}

export function inviteMember(input: InviteUserRequest) {
  return apiRequest('/admin/invite', { method: 'POST', body: input })
}

export function updateMemberRoles(input: {
  userId: string
  roles: Array<UserRoleAssignment>
}) {
  return apiRequest(`/users/${encodeURIComponent(input.userId)}`, {
    method: 'PATCH',
    body: { roles: input.roles },
  })
}

export function updateMemberGroupMembership(input: {
  userId: string
  groupId: string
  isMember: boolean
}) {
  return apiRequest<void>(
    `/users/${encodeURIComponent(input.userId)}/groups/${encodeURIComponent(input.groupId)}`,
    { method: 'PATCH', body: { is_member: input.isMember } },
  )
}
