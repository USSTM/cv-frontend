import { describe, expect, it } from 'vitest'
import type { CurrentMember, MemberGroup } from '@/api/generated/types.gen'
import {
  activeGroupFor,
  canManageActiveGroup,
  isGlobalAdmin,
  navigationForMember,
} from './member-access'

const groups: Array<MemberGroup> = [
  { id: 'group-a', name: 'Group A', roles: ['member'] },
  { id: 'group-b', name: 'Group B', roles: ['group_admin'] },
]

function memberWithRoles(...roles: Array<string>): CurrentMember {
  return {
    id: 'member-1',
    email: 'member@example.com',
    groups,
    roles: roles.map((name) => ({ name, scope: 'global' })),
  }
}

describe('member access', () => {
  it('adapts navigation for each Campus Vault role', () => {
    expect(
      navigationForMember(memberWithRoles('member'), groups[0]).map(
        (item) => item.label,
      ),
    ).toEqual(['Home', 'Activity', 'Catalog', 'Cart'])
    expect(
      navigationForMember(memberWithRoles('group_admin'), groups[1]).map(
        (item) => item.label,
      ),

).toContain('Group Admin')
expect(
  navigationForMember(memberWithRoles('group_admin'), groups[1]).map(
    (item) => item.label,
  ),
).not.toContain('Approvals')
expect(
  navigationForMember(memberWithRoles('approver'), groups[0]).map(
    (item) => item.label,
  ),
).toContain('Approvals')
expect(
  navigationForMember(memberWithRoles('admin'), groups[0]).map(
    (item) => item.label,
  ),
).not.toContain('Group Admin')
expect(
  navigationForMember(memberWithRoles('admin'), groups[0]).map(
    (item) => item.label,
  ),
).toContain('Global Admin')
  })

  it('selects the only group by default and honours a valid selected group', () => {
    expect(activeGroupFor([groups[0]], null)).toEqual(groups[0])
    expect(activeGroupFor(groups, 'group-b')).toEqual(groups[1])
  })

  it('limits Group Admin access to the active group while Global Admin access remains global', () => {
    expect(
      canManageActiveGroup(memberWithRoles('group_admin'), groups[0]),
    ).toBe(false)
    expect(
      canManageActiveGroup(memberWithRoles('group_admin'), groups[1]),
    ).toBe(true)
expect(canManageActiveGroup(memberWithRoles('admin'), groups[0])).toBe(true)
})

it('recognizes both current-member Global Admin role values during migration', () => {
  expect(isGlobalAdmin(memberWithRoles('admin'))).toBe(true)
  expect(isGlobalAdmin(memberWithRoles('global_admin'))).toBe(true)
})
  })
})
