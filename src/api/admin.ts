import type {
  Group,
  GroupCreateRequest,
  GroupUser,
  InviteUserRequest,
  InviteUserResponse,
  User,
} from './generated/types.gen'
import { apiRequest } from './client'

export function getGroupMembers(groupId: string) {
  return apiRequest<Array<GroupUser>>(`/admin/users/group/${groupId}`)
}

export function getSystemUsers() {
  return apiRequest<Array<User>>('/admin/users')
}

export function getGroups() {
  return apiRequest<Array<Group>>('/groups')
}

export function inviteMember(body: InviteUserRequest) {
  return apiRequest<InviteUserResponse>('/admin/invite', {
    method: 'POST',
    body,
  })
}

export function createGroup(body: GroupCreateRequest) {
  return apiRequest<Group>('/groups', {
    method: 'POST',
    body,
  })
}
