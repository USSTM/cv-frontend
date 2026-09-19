import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { MemberGroup } from '@/api/generated/types.gen'
import { useCurrentMemberQuery } from '@/api/session-queries'
import { activeGroupFor } from './member-access'

type ActiveGroupContextValue = {
  activeGroup: MemberGroup | null
  groups: Array<MemberGroup>
  selectActiveGroup: (groupId: string) => void
}

const ActiveGroupContext = createContext<ActiveGroupContextValue | null>(null)

function activeGroupStorageKey(memberId: string) {
  return `campus-vault:active-group:${memberId}`
}

export function ActiveGroupProvider({ children }: { children: ReactNode }) {
  const { data: member } = useCurrentMemberQuery()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const groups = member?.groups ?? []

  useEffect(() => {
    if (!member) {
      setSelectedGroupId(null)
      return
    }

    const savedGroupId = window.localStorage.getItem(
      activeGroupStorageKey(member.id),
    )
    setSelectedGroupId(
      groups.some((group) => group.id === savedGroupId) ? savedGroupId : null,
    )
  }, [member, groups])

  const activeGroup = activeGroupFor(groups, selectedGroupId)

  const value = useMemo(
    () => ({
      activeGroup,
      groups,
      selectActiveGroup: (groupId: string) => {
        if (groups.some((group) => group.id === groupId)) {
          setSelectedGroupId(groupId)
          if (member) {
            window.localStorage.setItem(
              activeGroupStorageKey(member.id),
              groupId,
            )
          }
        }
      },
    }),
    [activeGroup, groups, member],
  )

  return (
    <ActiveGroupContext.Provider value={value}>
      {children}
    </ActiveGroupContext.Provider>
  )
}

export function useActiveGroup() {
  const context = useContext(ActiveGroupContext)
  if (!context) {
    throw new Error('useActiveGroup must be used within ActiveGroupProvider')
  }
  return context
}
