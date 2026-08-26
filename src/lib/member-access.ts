import type { CurrentMember, MemberGroup } from '@/api/generated/types.gen'

export type NavigationItem = {
  label: string
  to:
    | '/'
    | '/activity'
    | '/catalog'
    | '/cart'
    | '/approvals'
    | '/group-admin'
    | '/global-admin'
}

const MEMBER_NAVIGATION: NavigationItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Activity', to: '/activity' },
  { label: 'Catalog', to: '/catalog' },
  { label: 'Cart', to: '/cart' },
]

export function hasRole(member: CurrentMember, role: string) {
  return member.roles.some((assignment) => assignment.name === role)
}

export function canManageActiveGroup(
  member: CurrentMember,
  activeGroup: MemberGroup | null,
) {
  return (
    hasRole(member, 'global_admin') ||
    activeGroup?.roles.includes('group_admin') === true
  )
}

export function navigationForMember(
  member: CurrentMember,
  activeGroup: MemberGroup | null,
): NavigationItem[] {
  const navigation = [...MEMBER_NAVIGATION]

  if (hasRole(member, 'approver')) {
    navigation.push({ label: 'Approvals', to: '/approvals' })
  }

  if (activeGroup?.roles.includes('group_admin')) {
    navigation.push({ label: 'Group Admin', to: '/group-admin' })
  }

  if (hasRole(member, 'global_admin')) {
    navigation.push({ label: 'Global Admin', to: '/global-admin' })
  }

  return navigation
}

export function activeGroupFor(
  groups: Array<MemberGroup>,
  selectedGroupId: string | null,
) {
  const selectedGroup = groups.find((group) => group.id === selectedGroupId)
  if (selectedGroup) return selectedGroup

  return groups.length > 0 ? groups[0] : null
}
