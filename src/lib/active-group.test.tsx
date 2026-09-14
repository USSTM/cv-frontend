// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CurrentMember } from '@/api/generated/types.gen'
import { ActiveGroupProvider, useActiveGroup } from './active-group'

const mocks = vi.hoisted(() => ({ useCurrentMemberQuery: vi.fn() }))

vi.mock('@/api/session-queries', () => ({
  useCurrentMemberQuery: mocks.useCurrentMemberQuery,
}))

const member: CurrentMember = {
  id: 'member-1',
  email: 'member@example.com',
  roles: [],
  groups: [
    { id: 'group-a', name: 'Group A', roles: ['member'] },
    { id: 'group-b', name: 'Group B', roles: ['group_admin'] },
  ],
}

function ActiveGroupProbe() {
  const { activeGroup, selectActiveGroup } = useActiveGroup()

  return (
    <>
      <p>{activeGroup?.name}</p>
      <button type="button" onClick={() => selectActiveGroup('group-b')}>
        Select Group B
      </button>
    </>
  )
}

describe('ActiveGroupProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mocks.useCurrentMemberQuery.mockReturnValue({ data: member })
  })

  it('restores a valid selected group and persists a new selection', async () => {
    window.localStorage.setItem('campus-vault:active-group:member-1', 'group-b')

    render(
      <ActiveGroupProvider>
        <ActiveGroupProbe />
      </ActiveGroupProvider>,
    )

    await waitFor(() => expect(screen.getByText('Group B')).toBeTruthy())

    fireEvent.click(screen.getByRole('button', { name: 'Select Group B' }))

    expect(
      window.localStorage.getItem('campus-vault:active-group:member-1'),
    ).toBe('group-b')
  })

  it('falls back to the first available group when the saved group is invalid', async () => {
    window.localStorage.setItem('campus-vault:active-group:member-1', 'removed')

    render(
      <ActiveGroupProvider>
        <ActiveGroupProbe />
      </ActiveGroupProvider>,
    )

    await waitFor(() => expect(screen.getByText('Group A')).toBeTruthy())
  })
})
