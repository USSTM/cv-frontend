import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import {
  Boxes,
  CircleUserRound,
  Pencil,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  useCreateGroupMutation,
  useDeleteMemberMutation,
  useDeleteGroupMutation,
  useGroupQuery,
  useGroupsQuery,
  useInviteMemberMutation,
  useManagedMembersQuery,
  useMemberRolesQuery,
  useMembersRolesQueries,
  useUpdateMemberGroupMembershipMutation,
  useUpdateMemberRolesMutation,
  useUpdateGroupMutation,
} from '@/api/admin-queries'
import type {
  Group,
  GroupUser,
  ItemPostRequest,
  ItemResponse,
  ItemType,
  User,
  UserRoleAssignment,
} from '@/api/generated/types.gen'
import { useCurrentMemberQuery } from '@/api/session-queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  useCatalogItemsQuery,
  useCreateCatalogItemMutation,
  useDeleteCatalogItemMutation,
  useDeleteCatalogItemImageMutation,
  useItemImagesQuery,
  useUpdateCatalogItemMutation,
  useUploadCatalogItemImageMutation,
} from '@/api/catalog-queries'
import { useActiveGroup } from '@/lib/active-group'
import { itemTypeClass, itemTypeLabels } from '@/lib/item-type'
import { requireGlobalAdmin } from '@/lib/route-guards'

export const Route = createFileRoute('/admin')({
  beforeLoad: async (options) => {
    await requireGlobalAdmin(options)
    throw redirect({ to: '/global-admin' })
  },
  component: () => null,
})
type AdminView = 'members' | 'groups' | 'catalog'
type ManagedMember = { id: string; email: string; role: string }
type AdminScope = 'global' | 'group'
type CatalogItemDraft = Omit<ItemPostRequest, 'id' | 'urls'>

const emptyCatalogItem: CatalogItemDraft = {
  name: '',
  description: '',
  type: 'low',
  stock: 0,
}

export function AdminPage({ scope }: { scope: AdminScope }) {
  const catalogItemsQuery = useCatalogItemsQuery({})
  const catalogItems = catalogItemsQuery.data?.data ?? []
  const { activeGroup } = useActiveGroup()
  const { data: currentMember } = useCurrentMemberQuery()
  const isGlobalAdmin = scope === 'global'
  const {
    data: users = [],
    isLoading,
    error,
  } = useManagedMembersQuery(activeGroup?.id, isGlobalAdmin)
  const members = toManagedMembers(users)
  const [view, setView] = useState<AdminView>('members')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<ManagedMember | null>(null)
  const [email, setEmail] = useState('')
  const [isMember, setIsMember] = useState(true)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null)
  const [newGroup, setNewGroup] = useState({ name: '', description: '' })
  const [editedGroup, setEditedGroup] = useState({ name: '', description: '' })
  const [catalogItemToEdit, setCatalogItemToEdit] =
    useState<ItemResponse | null>(null)
  const [catalogItemToDelete, setCatalogItemToDelete] =
    useState<ItemResponse | null>(null)
  const [creatingCatalogItem, setCreatingCatalogItem] = useState(false)
  const [catalogItemDraft, setCatalogItemDraft] =
    useState<CatalogItemDraft>(emptyCatalogItem)
  const invite = useInviteMemberMutation()
  const updateMembership = useUpdateMemberGroupMembershipMutation()
  const groupsQuery = useGroupsQuery(isGlobalAdmin)
  const activeGroupQuery = useGroupQuery(
    activeGroup?.id,
    !isGlobalAdmin && Boolean(activeGroup),
  )
  const memberRolesQuery = useMembersRolesQueries(
    members.map((member) => member.id),
    isGlobalAdmin,
  )
  const createGroup = useCreateGroupMutation()
  const deleteGroup = useDeleteGroupMutation()
  const updateGroup = useUpdateGroupMutation()
  const createCatalogItem = useCreateCatalogItemMutation()
  const updateCatalogItem = useUpdateCatalogItemMutation()
  const deleteCatalogItem = useDeleteCatalogItemMutation()
  const title = isGlobalAdmin ? 'Global administration' : 'Group administration'

  function addMember() {
    if (!email.trim()) return
    invite.mutate(
      {
        email: email.trim(),
        role_name: 'member',
        scope: isGlobalAdmin ? 'global' : 'group',
        scope_id: isGlobalAdmin ? undefined : activeGroup?.id,
      },
      {
        onSuccess: () => {
          setEmail('')
          setAdding(false)
        },
      },
    )
  }
  function saveMembership() {
    if (!editing || !activeGroup) return
    updateMembership.mutate(
      { userId: editing.id, groupId: activeGroup.id, isMember },
      { onSuccess: () => setEditing(null) },
    )
  }

  function openCatalogItemEditor(item?: ItemResponse) {
    setCatalogItemToEdit(item ?? null)
    setCreatingCatalogItem(!item)
    setCatalogItemDraft(
      item
        ? {
            name: item.name,
            description: item.description ?? '',
            type: item.type,
            stock: item.stock,
          }
        : emptyCatalogItem,
    )
  }

  function saveCatalogItem() {
    const input: ItemPostRequest = {
      id: catalogItemToEdit?.id ?? crypto.randomUUID(),
      name: catalogItemDraft.name.trim(),
      description: catalogItemDraft.description?.trim() || undefined,
      type: catalogItemDraft.type,
      stock: catalogItemDraft.stock,
    }
    if (!input.name) return

    const mutation = catalogItemToEdit ? updateCatalogItem : createCatalogItem
    mutation.mutate(input, {
      onSuccess: () => {
        setCatalogItemToEdit(null)
        setCreatingCatalogItem(false)
        setCatalogItemDraft(emptyCatalogItem)
      },
    })
  }
  function saveGroup() {
    const name = newGroup.name.trim()
    if (!name) return
    createGroup.mutate(
      { name, description: newGroup.description.trim() || undefined },
      {
        onSuccess: () => {
          setNewGroup({ name: '', description: '' })
          setCreatingGroup(false)
        },
      },
    )
  }
  function saveEditedGroup() {
    if (!groupToEdit || !editedGroup.name.trim()) return
    updateGroup.mutate(
      {
        groupId: groupToEdit.id,
        name: editedGroup.name.trim(),
        description: editedGroup.description.trim() || undefined,
      },
      { onSuccess: () => setGroupToEdit(null) },
    )
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 text-(--kicker)!">
              {isGlobalAdmin ? title : 'Group administration'}
            </p>
            <h1 className="display-title text-3xl font-bold">
              {isGlobalAdmin
                ? 'Global Admin'
                : (activeGroup?.name ?? 'Group Admin')}
            </h1>
            <p className="mt-2 max-w-2xl text-(--sea-ink-soft)">
              {isGlobalAdmin
                ? 'Manage member access and roles across Campus Vault.'
                : (activeGroupQuery.data?.description ??
                  'Manage members and operational data for your Active Group.')}
            </p>
          </div>
          <div className="rounded-xl border border-(--line) bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
              {isGlobalAdmin ? 'Access level' : 'Active Group'}
            </p>
            <p className="mt-1 text-sm font-semibold text-(--sea-ink)">
              {isGlobalAdmin
                ? 'All groups'
                : (activeGroup?.name ?? 'No Active Group')}
            </p>
            <Badge className="mt-2 border-sky-200 bg-sky-50 text-sky-800">
              {isGlobalAdmin ? 'Global Admin' : 'Group Admin'}
            </Badge>
          </div>
        </div>
        <section className="grid gap-4 sm:grid-cols-2">
          <SummaryCard
            icon={UsersRound}
            label={isGlobalAdmin ? 'Managed members' : 'Active members'}
            value={String(members.length)}
          />
          <SummaryCard
            icon={Boxes}
            label="Catalog items"
            value={String(catalogItems.length)}
          />
        </section>
        <section className="island-shell overflow-hidden rounded-2xl">
          <div className="flex flex-col gap-4 border-b border-(--line) px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">
                {isGlobalAdmin ? 'Member management' : 'Group management'}
              </h2>
              <p className="mt-1 text-sm text-(--sea-ink-soft)">
                {isGlobalAdmin
                  ? 'Update member roles and group access.'
                  : 'Maintain your group’s access and catalog information.'}
              </p>
            </div>
            <Button asChild className="btn-inv w-fit">
              <Link to="/catalog">View Catalog</Link>
            </Button>
          </div>
          <div className="border-b border-(--line) px-5 sm:px-6">
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Admin sections"
            >
              <AdminTab
                active={view === 'members'}
                onClick={() => setView('members')}
              >
                Members
              </AdminTab>
              {isGlobalAdmin && (
                <AdminTab
                  active={view === 'groups'}
                  onClick={() => setView('groups')}
                >
                  Groups
                </AdminTab>
              )}
              <AdminTab
                active={view === 'catalog'}
                onClick={() => setView('catalog')}
              >
                Catalog
              </AdminTab>
            </div>
          </div>
          {view === 'members' && (
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">
                    {isGlobalAdmin ? 'All members' : 'Group members'}
                  </h3>
                  <p className="mt-1 text-sm text-(--sea-ink-soft)">
                    {isGlobalAdmin
                      ? 'Global Admins can edit role assignments and access.'
                      : 'Edit membership for the current group.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-(--line)"
                  onClick={() => setAdding(true)}
                  disabled={!isGlobalAdmin && !activeGroup}
                >
                  Add member
                </Button>
              </div>
              {isGlobalAdmin ? (
                <GlobalMemberLists
                  members={members}
                  loading={isLoading || memberRolesQuery.isLoading}
                  error={error}
                  currentMemberId={currentMember?.id}
                  assignments={memberRolesQuery.assignments}
                  groups={groupsQuery.data ?? []}
                  onEdit={(member) => {
                    if (member.id === currentMember?.id) return
                    setEditing(member)
                  }}
                />
              ) : (
                <MemberList
                  members={members}
                  loading={isLoading}
                  error={error}
                  canEdit={(member) => member.role !== 'group_admin'}
                  onEdit={(member) => {
                    if (member.role === 'group_admin') return
                    setIsMember(true)
                    setEditing(member)
                  }}
                  emptyMessage="Group has no members"
                />
              )}
            </div>
          )}
          {view === 'groups' && isGlobalAdmin && (
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">All groups</h3>
                  <p className="mt-1 text-sm text-(--sea-ink-soft)">
                    Create and remove Campus Vault groups.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-(--line)"
                  onClick={() => setCreatingGroup(true)}
                >
                  Create group
                </Button>
              </div>
              {groupsQuery.isLoading ? (
                <p className="text-sm text-(--sea-ink-soft)">Loading groups…</p>
              ) : groupsQuery.error ? (
                <ErrorText error={groupsQuery.error} />
              ) : (
                <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
                  {(groupsQuery.data ?? []).map((group) => (
                    <li
                      key={group.id}
                      className="flex items-center justify-between gap-4 p-4 sm:p-5"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-(--sea-ink)">
                          {group.name}
                        </p>
                        {group.description && (
                          <p className="mt-1 truncate text-sm text-(--sea-ink-soft)">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="border-(--line)"
                          aria-label={`Edit ${group.name}`}
                          onClick={() => {
                            setEditedGroup({
                              name: group.name,
                              description: group.description ?? '',
                            })
                            setGroupToEdit(group)
                          }}
                        >
                          <Pencil aria-hidden="true" size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          aria-label={`Delete ${group.name}`}
                          onClick={() => setGroupToDelete(group)}
                        >
                          <Trash2 aria-hidden="true" size={16} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {view === 'catalog' && (
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Catalog overview</h3>
                  <p className="mt-1 text-sm text-(--sea-ink-soft)">
                    {isGlobalAdmin
                      ? 'Add, edit, or remove Catalog items.'
                      : 'Browse Catalog items available to your group.'}
                  </p>
                </div>
                {isGlobalAdmin && (
                  <Button
                    variant="outline"
                    className="border-(--line)"
                    onClick={() => openCatalogItemEditor()}
                  >
                    Add item
                  </Button>
                )}
              </div>
              {catalogItemsQuery.isLoading ? (
                <p className="text-sm text-(--sea-ink-soft)">
                  Loading catalog…
                </p>
              ) : catalogItemsQuery.isError ? (
                <p className="text-sm text-red-700">
                  Could not load the catalog. Try again.
                </p>
              ) : catalogItems.length === 0 ? (
                <p className="text-sm text-(--sea-ink-soft)">
                  No catalog items yet.
                </p>
              ) : (
                <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
                  {catalogItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-4 sm:p-5"
                    >
                      <div>
                        <p className="font-semibold text-(--sea-ink)">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm text-(--sea-ink-soft)">
                          {item.stock} available
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={itemTypeClass(item.type)}>
                          {itemTypeLabels[item.type]}
                        </Badge>
                        {isGlobalAdmin && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="border-(--line)"
                              aria-label={`Edit ${item.name}`}
                              onClick={() => openCatalogItemEditor(item)}
                            >
                              <Pencil aria-hidden="true" size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              aria-label={`Delete ${item.name}`}
                              onClick={() => setCatalogItemToDelete(item)}
                            >
                              <Trash2 aria-hidden="true" size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Dialog
                open={isGlobalAdmin && Boolean(catalogItemToEdit)}
                onOpenChange={(open) => !open && setCatalogItemToEdit(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Catalog item</DialogTitle>
                    <DialogDescription>
                      Update the item details available in Campus Vault.
                    </DialogDescription>
                  </DialogHeader>
                  <CatalogItemForm
                    itemId={catalogItemToEdit?.id}
                    draft={catalogItemDraft}
                    onChange={setCatalogItemDraft}
                    onSubmit={saveCatalogItem}
                    error={updateCatalogItem.error}
                    submitting={updateCatalogItem.isPending}
                    submitLabel="Save changes"
                  />
                </DialogContent>
              </Dialog>
              <Dialog
                open={isGlobalAdmin && creatingCatalogItem}
                onOpenChange={(open) => {
                  if (!open) {
                    setCreatingCatalogItem(false)
                    setCatalogItemDraft(emptyCatalogItem)
                  }
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Catalog item</DialogTitle>
                    <DialogDescription>
                      Add an item to the Campus Vault Catalog.
                    </DialogDescription>
                  </DialogHeader>
                  <CatalogItemForm
                    draft={catalogItemDraft}
                    onChange={setCatalogItemDraft}
                    onSubmit={saveCatalogItem}
                    error={createCatalogItem.error}
                    submitting={createCatalogItem.isPending}
                    submitLabel="Add item"
                  />
                </DialogContent>
              </Dialog>
              <Dialog
                open={Boolean(catalogItemToDelete)}
                onOpenChange={(open) => !open && setCatalogItemToDelete(null)}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Catalog item</DialogTitle>
                    <DialogDescription>
                      Delete {catalogItemToDelete?.name}? This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  {deleteCatalogItem.error && (
                    <ErrorText error={deleteCatalogItem.error} />
                  )}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="border-(--line)">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() =>
                        catalogItemToDelete &&
                        deleteCatalogItem.mutate(catalogItemToDelete.id, {
                          onSuccess: () => setCatalogItemToDelete(null),
                        })
                      }
                      disabled={deleteCatalogItem.isPending}
                    >
                      {deleteCatalogItem.isPending
                        ? 'Deleting…'
                        : 'Delete item'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </section>
      </section>
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              {isGlobalAdmin
                ? 'Invite a member to Campus Vault.'
                : `Invite a member to ${activeGroup?.name ?? 'the current group'}.`}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              addMember()
            }}
          >
            <div>
              <label htmlFor="member-email" className="text-sm font-semibold">
                Email
              </label>
              <Input
                id="member-email"
                type="email"
                className="mt-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {invite.error && <ErrorText error={invite.error} />}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-(--line)">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="btn-inv"
                disabled={invite.isPending}
              >
                {invite.isPending ? 'Inviting…' : 'Invite member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={creatingGroup} onOpenChange={setCreatingGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create group</DialogTitle>
            <DialogDescription>
              Create a new group for Campus Vault members and Catalog items.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              saveGroup()
            }}
          >
            <div>
              <label htmlFor="group-name" className="text-sm font-semibold">
                Group name
              </label>
              <Input
                id="group-name"
                className="mt-2"
                value={newGroup.name}
                onChange={(event) =>
                  setNewGroup((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label
                htmlFor="group-description"
                className="text-sm font-semibold"
              >
                Expanded Name <span className="font-normal">(optional)</span>
              </label>
              <Input
                id="group-description"
                className="mt-2"
                value={newGroup.description}
                onChange={(event) =>
                  setNewGroup((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            {createGroup.error && <ErrorText error={createGroup.error} />}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-(--line)">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="btn-inv"
                disabled={createGroup.isPending}
              >
                {createGroup.isPending ? 'Creating…' : 'Create group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(groupToDelete)}
        onOpenChange={(open) => !open && setGroupToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete group</DialogTitle>
            <DialogDescription>
              Delete {groupToDelete?.name}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteGroup.error && <ErrorText error={deleteGroup.error} />}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-(--line)">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() =>
                groupToDelete &&
                deleteGroup.mutate(groupToDelete.id, {
                  onSuccess: () => setGroupToDelete(null),
                })
              }
              disabled={deleteGroup.isPending}
            >
              {deleteGroup.isPending ? 'Deleting…' : 'Delete group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(groupToEdit)}
        onOpenChange={(open) => !open && setGroupToEdit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
            <DialogDescription>
              Update this group’s name or description.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              saveEditedGroup()
            }}
          >
            <div>
              <label
                htmlFor="edit-group-name"
                className="text-sm font-semibold"
              >
                Group name
              </label>
              <Input
                id="edit-group-name"
                className="mt-2"
                value={editedGroup.name}
                onChange={(event) =>
                  setEditedGroup((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label
                htmlFor="edit-group-description"
                className="text-sm font-semibold"
              >
                Expanded Name <span className="font-normal">(optional)</span>
              </label>
              <Input
                id="edit-group-description"
                className="mt-2"
                value={editedGroup.description}
                onChange={(event) =>
                  setEditedGroup((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            {updateGroup.error && <ErrorText error={updateGroup.error} />}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-(--line)"
                onClick={() => setGroupToEdit(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-inv"
                disabled={updateGroup.isPending}
              >
                {updateGroup.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {isGlobalAdmin ? (
        <GlobalEditor member={editing} onClose={() => setEditing(null)} />
      ) : (
        <Dialog
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit group membership</DialogTitle>
              <DialogDescription>
                Control {editing?.email}’s access to{' '}
                {activeGroup?.name ?? 'this group'}.
              </DialogDescription>
            </DialogHeader>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={isMember}
                onChange={(e) => setIsMember(e.target.checked)}
              />
              Member has access to this group
            </label>
            {updateMembership.error && (
              <ErrorText error={updateMembership.error} />
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-(--line)">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="btn-inv"
                onClick={saveMembership}
                disabled={updateMembership.isPending}
              >
                {updateMembership.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </main>
  )
}

function scopeForRole(roleName: string) {
  return roleName === 'member' || roleName === 'group_admin'
    ? 'group'
    : 'global'
}

function sameRoleAssignment(
  left: UserRoleAssignment,
  right: UserRoleAssignment,
) {
  return (
    left.role_name === right.role_name &&
    left.scope === right.scope &&
    left.scope_id === right.scope_id
  )
}

function GlobalEditor({
  member,
  onClose,
}: {
  member: ManagedMember | null
  onClose: () => void
}) {
  const { data: groups = [] } = useGroupsQuery(Boolean(member))
  const rolesQuery = useMemberRolesQuery(member?.id, Boolean(member))
  const updateRoles = useUpdateMemberRolesMutation()
  const deleteMember = useDeleteMemberMutation()
  const [roles, setRoles] = useState<Array<UserRoleAssignment>>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [initialRoles, setInitialRoles] = useState<Array<UserRoleAssignment>>(
    [],
  )
  useEffect(() => {
    const normalizedRoles = (rolesQuery.data ?? []).map((role) => {
      const scope = role.scope ?? scopeForRole(role.role_name)
      return {
        ...role,
        scope,
        scope_id: scope === 'group' ? role.scope_id : undefined,
      }
    })
    setInitialRoles(normalizedRoles)
    setRoles(normalizedRoles)
  }, [rolesQuery.data, member?.id])
  const update = (index: number, patch: Partial<UserRoleAssignment>) =>
    setRoles((current) =>
      current.map((role, i) => (i === index ? { ...role, ...patch } : role)),
    )
  const updateRoleName = (index: number, roleName: string) => {
    const scope = scopeForRole(roleName)
    const currentRole = roles[index]
    update(index, {
      role_name: roleName,
      scope,
      scope_id:
        scope === 'group'
          ? (currentRole?.scope_id ?? groups[0]?.id)
          : undefined,
    })
  }
  const changes = roles.flatMap((replacement, index) => {
    const current = initialRoles[index]
    return current && !sameRoleAssignment(current, replacement)
      ? [{ current, replacement }]
      : []
  })
  return (
    <Dialog open={Boolean(member)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit member roles</DialogTitle>
          <DialogDescription>
            Update existing role assignments. Group roles require a group.
          </DialogDescription>
        </DialogHeader>
        {rolesQuery.isLoading ? (
          <p className="text-sm text-(--sea-ink-soft)">
            Loading role assignments…
          </p>
        ) : (
          <div className="space-y-3">
            {roles.map((role, index) => (
              <div
                key={`${index}-${role.role_name}`}
                className="grid gap-2 rounded-lg border border-(--line) p-3 sm:grid-cols-2"
              >
                <select
                  aria-label="Role"
                  className="h-9 rounded-md border border-(--line) bg-white px-2 text-sm"
                  value={role.role_name}
                  onChange={(e) => updateRoleName(index, e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="group_admin">Group Admin</option>
                  <option value="approver">Approver</option>
                  <option value="global_admin">Global Admin</option>
                </select>
                {role.scope === 'group' ? (
                  <select
                    aria-label="Group"
                    className="h-9 rounded-md border border-(--line) bg-white px-2 text-sm"
                    value={role.scope_id ?? ''}
                    onChange={(e) =>
                      update(index, { scope_id: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select group
                    </option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        )}
        {updateRoles.error && <ErrorText error={updateRoles.error} />}
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:mr-auto"
            onClick={() => setConfirmDelete(true)}
          >
            Delete member
          </Button>
          <Button
            variant="outline"
            className="border-(--line)"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="btn-inv"
            onClick={() => {
              if (!member || changes.length === 0) {
                onClose()
                return
              }
              updateRoles.mutate(
                { userId: member.id, changes },
                { onSuccess: onClose },
              )
            }}
            disabled={
              rolesQuery.isLoading ||
              updateRoles.isPending ||
              changes.length === 0 ||
              roles.some((role) => role.scope === 'group' && !role.scope_id)
            }
          >
            {updateRoles.isPending ? 'Saving…' : 'Save roles'}
          </Button>
        </DialogFooter>
      </DialogContent>
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete member</DialogTitle>
            <DialogDescription>
              Delete {member?.email}? This permanently removes their Campus
              Vault account and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteMember.error && <ErrorText error={deleteMember.error} />}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-(--line)"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() =>
                member &&
                deleteMember.mutate(member.id, {
                  onSuccess: () => {
                    setConfirmDelete(false)
                    onClose()
                  },
                })
              }
              disabled={deleteMember.isPending}
            >
              {deleteMember.isPending ? 'Deleting…' : 'Delete member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

function toManagedMembers(users: Array<User> | Array<GroupUser>) {
  const byId = new Map<string, ManagedMember>()
  users.forEach((user) => {
    const role = 'role_name' in user ? user.role_name : user.role
    const existing = byId.get(user.id)
    byId.set(
      user.id,
      !existing || priority(role) > priority(existing.role)
        ? { id: user.id, email: user.email, role }
        : existing,
    )
  })
  return [...byId.values()]
}
function priority(role: string) {
  return ['member', 'group_admin', 'approver', 'admin', 'global_admin'].indexOf(
    role,
  )
}
function label(role: string) {
  return (
    (
      {
        member: 'Member',
        group_admin: 'Group Admin',
        approver: 'Approver',
        admin: 'Global Admin',
        global_admin: 'Global Admin',
      } as Record<string, string>
    )[role] ?? role
  )
}
function ErrorText({ error }: { error: unknown }) {
  return (
    <p className="text-sm text-red-700">
      {error instanceof Error ? error.message : 'Unable to save changes.'}
    </p>
  )
}

function CatalogItemForm({
  itemId,
  draft,
  onChange,
  onSubmit,
  error,
  submitting,
  submitLabel,
}: {
  itemId?: string
  draft: CatalogItemDraft
  onChange: (draft: CatalogItemDraft) => void
  onSubmit: () => void
  error: unknown
  submitting: boolean
  submitLabel: string
}) {
  const imagesQuery = useItemImagesQuery(itemId)
  const uploadImage = useUploadCatalogItemImageMutation()
  const deleteImage = useDeleteCatalogItemImageMutation()

  function uploadImages(files: FileList | null) {
    if (!itemId || !files?.length) return

    Array.from(files).forEach((image) => {
      uploadImage.mutate({
        itemId,
        image,
      })
    })
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div>
        <label htmlFor="catalog-item-name" className="text-sm font-semibold">
          Name
        </label>
        <Input
          id="catalog-item-name"
          className="mt-2"
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          required
        />
      </div>
      <div>
        <label
          htmlFor="catalog-item-description"
          className="text-sm font-semibold"
        >
          Description <span className="font-normal">(optional)</span>
        </label>
        <Input
          id="catalog-item-description"
          className="mt-2"
          value={draft.description ?? ''}
          onChange={(event) =>
            onChange({ ...draft, description: event.target.value })
          }
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Item type
          <select
            className="mt-2 h-10 w-full rounded-md border border-(--line) bg-white px-3 text-sm"
            value={draft.type}
            onChange={(event) =>
              onChange({ ...draft, type: event.target.value as ItemType })
            }
          >
            <option value="low">Take Item</option>
            <option value="medium">Borrow Item</option>
            <option value="high">Request Item</option>
          </select>
        </label>
        <label htmlFor="catalog-item-stock" className="text-sm font-semibold">
          Stock
          <Input
            id="catalog-item-stock"
            className="mt-2"
            type="number"
            min="0"
            value={draft.stock}
            onFocus={(event) => event.target.select()}
            onChange={(event) =>
              onChange({
                ...draft,
                stock: Math.max(0, Number(event.target.value) || 0),
              })
            }
            required
          />
        </label>
      </div>
      {itemId ? (
        <div>
          <label
            htmlFor="catalog-item-images"
            className="text-sm font-semibold"
          >
            Item images
          </label>
          <Input
            id="catalog-item-images"
            className="mt-2 cursor-pointer file:mr-3 file:cursor-pointer file:rounded-md file:bg-(--header-bg) file:px-3 file:font-semibold file:text-white file:transition-colors hover:file:bg-(--header-bg)/80"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              uploadImages(event.target.files)
              event.target.value = ''
            }}
            disabled={uploadImage.isPending}
          />
          <p className="mt-1 text-xs text-(--sea-ink-soft)">
            Upload one or more images for this Catalog item.
          </p>
          {imagesQuery.data && imagesQuery.data.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imagesQuery.data.map((image) => (
                <div key={image.id} className="group/image space-y-1">
                  <div className="relative">
                    <img
                      src={image.thumbnail_url}
                      alt="Catalog item"
                      className="size-16 rounded-lg border border-(--line) object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute -right-2 -top-2 size-6 border-red-200 bg-white p-0 text-red-700 opacity-0 shadow-sm transition-opacity hover:bg-red-50 group-hover/image:opacity-100 group-focus-within/image:opacity-100"
                      aria-label="Remove Catalog item image"
                      onClick={() =>
                        deleteImage.mutate({ itemId, imageId: image.id })
                      }
                      disabled={deleteImage.isPending}
                    >
                      <X aria-hidden="true" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {uploadImage.error && <ErrorText error={uploadImage.error} />}
          {deleteImage.error && <ErrorText error={deleteImage.error} />}
        </div>
      ) : (
        <p className="text-sm text-(--sea-ink-soft)">
          Save the item before uploading images.
        </p>
      )}
      {error ? <ErrorText error={error} /> : null}
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" className="border-(--line)">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" className="btn-inv" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

function GlobalMemberLists({
  members,
  loading,
  error,
  currentMemberId,
  assignments,
  groups,
  onEdit,
}: {
  members: Array<ManagedMember>
  loading: boolean
  error: unknown
  currentMemberId?: string
  assignments: Map<string, Array<UserRoleAssignment>>
  groups: Array<Group>
  onEdit: (member: ManagedMember) => void
}) {
  const groupNamesByMember = new Map<string, Array<string>>()
  for (const member of members) {
    const groupNames = (assignments.get(member.id) ?? [])
      .filter((assignment) => assignment.scope === 'group')
      .map(
        (assignment) =>
          groups.find((group) => group.id === assignment.scope_id)?.name,
      )
      .filter((name): name is string => Boolean(name))
    groupNamesByMember.set(member.id, [...new Set(groupNames)])
  }
  const globalAdmins = members.filter(
    (member) =>
      member.role === 'admin' ||
      (assignments.get(member.id) ?? []).some(
        (assignment) =>
          assignment.role_name === 'global_admin' &&
          assignment.scope === 'global',
      ),
  )
  const otherMembers = members.filter(
    (member) => !globalAdmins.some((admin) => admin.id === member.id),
  )
  const membersByGroup = groups.map((group) => ({
    group,
    members: otherMembers.filter((member) =>
      (assignments.get(member.id) ?? []).some(
        (assignment) =>
          assignment.scope === 'group' && assignment.scope_id === group.id,
      ),
    ),
  }))
  const assignedMemberIds = new Set(
    membersByGroup.flatMap(({ members }) => members.map((member) => member.id)),
  )
  const unassignedMembers = otherMembers.filter(
    (member) => !assignedMemberIds.has(member.id),
  )
  return (
    <div className="space-y-7">
      <section>
        <h4 className="mb-3 text-sm font-semibold text-(--sea-ink)">
          Global Admins
        </h4>
        <MemberList
          members={globalAdmins}
          loading={loading}
          error={error}
          currentMemberId={currentMemberId}
          groupNamesByMember={groupNamesByMember}
          onEdit={onEdit}
        />
      </section>
      {membersByGroup.map(({ group, members: groupMembers }) => (
        <section key={group.id}>
          <h4 className="mb-3 text-sm font-semibold text-(--sea-ink)">
            {group.name}
          </h4>
          <MemberList
            members={groupMembers}
            loading={loading}
            error={error}
            currentMemberId={currentMemberId}
            onEdit={onEdit}
            emptyMessage="Group has no members"
          />
        </section>
      ))}
      {unassignedMembers.length > 0 && (
        <section>
          <h4 className="mb-3 text-sm font-semibold text-(--sea-ink)">
            Unassigned members
          </h4>
          <MemberList
            members={unassignedMembers}
            loading={loading}
            error={error}
            currentMemberId={currentMemberId}
            onEdit={onEdit}
          />
        </section>
      )}
    </div>
  )
}
function MemberList({
  members,
  loading,
  error,
  currentMemberId,
  groupNamesByMember,
  canEdit,
  onEdit,
  emptyMessage = 'No members found.',
}: {
  members: Array<ManagedMember>
  loading: boolean
  error: unknown
  currentMemberId?: string
  groupNamesByMember?: Map<string, Array<string>>
  canEdit?: (member: ManagedMember) => boolean
  onEdit: (member: ManagedMember) => void
  emptyMessage?: string
}) {
  if (loading)
    return <p className="text-sm text-(--sea-ink-soft)">Loading members…</p>
  if (error) return <ErrorText error={error} />
  if (members.length === 0)
    return <p className="text-sm text-(--sea-ink-soft)">{emptyMessage}</p>
  return (
    <ul className="divide-y divide-(--line) rounded-xl border border-(--line)">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center justify-between gap-4 p-4 sm:p-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)">
              <CircleUserRound aria-hidden="true" size={20} />
            </div>
            <p className="truncate font-semibold text-(--sea-ink)">
              {member.email}
            </p>
            {groupNamesByMember && (
              <p className="mt-1 text-sm text-(--sea-ink-soft)">
                {groupNamesByMember.get(member.id)?.length
                  ? groupNamesByMember.get(member.id)!.join(', ')
                  : 'No group memberships'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border-sky-200 bg-sky-50 text-sky-800">
              {label(member.role)}
            </Badge>
            {member.id !== currentMemberId && (canEdit?.(member) ?? true) && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-(--line)"
                aria-label={`Edit ${member.email}`}
                onClick={() => onEdit(member)}
              >
                <Pencil aria-hidden="true" size={16} />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound
  label: string
  value: string
}) {
  return (
    <div className="island-shell rounded-2xl p-5">
      <Icon aria-hidden="true" className="text-(--lagoon-deep)" size={21} />
      <p className="mt-5 text-2xl font-bold text-(--sea-ink)">{value}</p>
      <p className="mt-1 text-sm text-(--sea-ink-soft)">{label}</p>
    </div>
  )
}
function AdminTab({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${active ? 'border-(--lagoon-deep) text-(--sea-ink)' : 'border-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
