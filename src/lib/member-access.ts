import type { CurrentMember, MemberGroup } from '@/api/generated/types.gen'

export type NavigationItem = {
  label: string
  to:
    | '/activity'
    | '/catalog'
    | '/cart'
    | '/approvals'
    | '/group-admin'
    | '/global-admin'
  /**
   * Marks a link to a privileged, role-restricted page so the header can
   * show an indicator distinguishing it from ordinary member pages.
   */
  privileged?: boolean
}

const MEMBER_NAVIGATION: NavigationItem[] = [
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

export function isGroupAdminForActiveGroup(activeGroup: MemberGroup | null) {
  return activeGroup?.roles.includes('group_admin') === true
}

export function roleLabelForMember(
  member: CurrentMember,
  activeGroup: MemberGroup | null,
): string {
  if (hasRole(member, 'global_admin')) return 'Global Admin'
  if (activeGroup?.roles.includes('group_admin')) return 'Group Admin'
  if (hasRole(member, 'approver')) return 'Approver'
  return 'Member'
}

export function navigationForMember(
  member: CurrentMember,
  activeGroup: MemberGroup | null,
): NavigationItem[] {
  const navigation = [...MEMBER_NAVIGATION]

  if (hasRole(member, 'approver') || hasRole(member, 'global_admin')) {
    navigation.push({ label: 'Approvals', to: '/approvals', privileged: true })
  }

  if (activeGroup?.roles.includes('group_admin')) {
    navigation.push({ label: 'Group Admin', to: '/group-admin' })
  }

  if (hasRole(member, 'global_admin')) {
    navigation.push({
      label: 'Global Admin',
      to: '/global-admin',
      privileged: true,
    })
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
