import { describe, expect, it } from 'vitest'
import type { CurrentMember, MemberGroup } from '@/api/generated/types.gen'
import { activeGroupFor, navigationForMember } from './member-access'

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
    expect(navigationForMember(memberWithRoles('member'), groups[0]).map((item) => item.label)).toEqual([
      'Home',
      'Activity',
      'Catalog',
      'Cart',
    ])
    expect(navigationForMember(memberWithRoles('group_admin'), groups[1]).map((item) => item.label)).toContain('Admin')
    expect(navigationForMember(memberWithRoles('approver'), groups[0]).map((item) => item.label)).toContain('Approvals')
    expect(navigationForMember(memberWithRoles('global_admin'), groups[0]).map((item) => item.label)).toContain('Admin')
  })

  it('selects the only group by default and honours a valid selected group', () => {
    expect(activeGroupFor([groups[0]], null)).toEqual(groups[0])
    expect(activeGroupFor(groups, 'group-b')).toEqual(groups[1])
  })
})
