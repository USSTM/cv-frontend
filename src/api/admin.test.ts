import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createGroup,
  deleteGroup,
  getAdminUsers,
  getGroupUsers,
  getUserRoleAssignments,
  updateGroup,
  updateMemberGroupMembership,
  updateMemberRoles,
} from './admin'

const fetchMock = vi.fn<typeof fetch>()

afterEach(() => {
  fetchMock.mockReset()
  vi.unstubAllGlobals()
})

function mockResponse(payload: unknown = {}) {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockImplementation(() =>
    Promise.resolve(new Response(JSON.stringify(payload))),
  )
}

describe('admin API', () => {
  it('loads the correct member collection for global and group administration', async () => {
    mockResponse([])

    await getAdminUsers()
    await getGroupUsers('group-1')

    expect(fetchMock.mock.calls[0]?.[0]).toEqual(
      new URL('/admin/users', 'http://localhost:8080'),
    )
    expect(fetchMock.mock.calls[1]?.[0]).toEqual(
      new URL('/admin/users/group/group-1', 'http://localhost:8080'),
    )
  })

  it('loads the full role assignments used by the global member view', async () => {
    mockResponse([])

    await getUserRoleAssignments('member-1')

    expect(fetchMock.mock.calls[0]?.[0]).toEqual(
      new URL('/admin/users/member-1/roles', 'http://localhost:8080'),
    )
  })

  it('replaces global member role assignments', async () => {
    mockResponse({ id: 'member-1' })
    const roles = [
      { role_name: 'group_admin', scope: 'group', scope_id: 'group-1' },
    ]

    await updateMemberRoles({ userId: 'member-1', roles })

    expect(fetchMock.mock.calls[0]).toEqual([
      new URL('/users/member-1', 'http://localhost:8080'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ roles }),
      }),
    ])
  })

  it('updates a member’s active-group membership', async () => {
    mockResponse()

    await updateMemberGroupMembership({
      userId: 'member-1',
      groupId: 'group-1',
      isMember: false,
    })

    expect(fetchMock.mock.calls[0]).toEqual([
      new URL('/users/member-1/groups/group-1', 'http://localhost:8080'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ is_member: false }),
      }),
    ])
  })

  it('creates, edits, and deletes groups', async () => {
    mockResponse({ id: 'group-1', name: 'Physics Society' })

    await createGroup({ name: 'Physics Society', description: 'Physics' })
    await updateGroup({
      groupId: 'group-1',
      name: 'Physics Association',
      description: 'Updated',
    })
    await deleteGroup('group-1')

    expect(fetchMock.mock.calls[0]).toEqual([
      new URL('/groups', 'http://localhost:8080'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Physics Society',
          description: 'Physics',
        }),
      }),
    ])
    expect(fetchMock.mock.calls[1]).toEqual([
      new URL('/groups/group-1', 'http://localhost:8080'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          name: 'Physics Association',
          description: 'Updated',
        }),
      }),
    ])
    expect(fetchMock.mock.calls[2]).toEqual([
      new URL('/groups/group-1', 'http://localhost:8080'),
      expect.objectContaining({ method: 'DELETE' }),
    ])
  })
})
