import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Bell, LogOut, Menu, ShoppingCart, UserRound, X } from 'lucide-react'
import { useCartQuery } from '@/api/catalog-queries'
import { useUnreadNotificationCountQuery } from '@/api/notification-queries'
import { useCurrentMemberQuery, useLogoutMutation } from '@/api/session-queries'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useActiveGroup } from '@/lib/active-group'
import {
  canManageActiveGroup,
  navigationForMember,
  roleLabelForMember,
} from '@/lib/member-access'

export default function Header() {
  const { data: currentMember } = useCurrentMemberQuery()
  const { data: unreadNotifications } = useUnreadNotificationCountQuery(
    Boolean(currentMember),
  )
  const { activeGroup, groups, selectActiveGroup } = useActiveGroup()
  const { data: cart = [] } = useCartQuery(activeGroup?.id)
  const logout = useLogoutMutation()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigation = currentMember
    ? navigationForMember(currentMember, activeGroup)
    : []
  const unreadCount = unreadNotifications?.unread_count ?? 0
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  function handleSignOut() {
    logout.mutate(undefined, {
      onSuccess: () => navigate({ to: '/login' }),
    })
  }

  function handleActiveGroupChange(groupId: string) {
    const nextGroup = groups.find((group) => group.id === groupId) ?? null
    selectActiveGroup(groupId)

    if (
      currentMember &&
      location.pathname === '/admin' &&
      !canManageActiveGroup(currentMember, nextGroup)
    ) {
      navigate({ to: '/activity' })
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false)
      }
    }

    if (menuOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen, profileOpen])

  return (
    <header className="sticky top-0 z-50 w-full bg-(--header-bg) text-white shadow-md">
      <nav className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-0 sm:px-2 lg:px-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 text-2xl font-bold text-white no-underline transition-colors duration-300 hover:text-white"
          >
            <img
              src="/usstm-white.png"
              alt="USSTM"
              className="h-10 w-auto shrink-0"
            />
            USSTM Campus Vault
          </Link>
          {currentMember && (
            <div className="hidden h-10 border-l border-white/30 md:block" />
          )}
          {currentMember && (
            <div className="hidden items-center gap-2 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="nav-link"
                  activeProps={{
                    className: 'nav-link is-active',
                  }}
                >
                  {item.label}
                  {item.label === 'Cart' && cartCount > 0 && (
                    <span className="ml-1 inline-flex min-w-4 justify-center rounded-full bg-white/20 px-1 text-xs">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {currentMember && (
          <div className="hidden items-center gap-4 md:flex">
            {activeGroup && (
              <label className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="sr-only">Active Group</span>
                {groups.length === 1 ? (
                  <span title="Active Group">{activeGroup.name}</span>
                ) : (
                  <Select
                    value={activeGroup.id}
                    onValueChange={handleActiveGroupChange}
                  >
                    <SelectTrigger
                      aria-label="Active Group"
                      className="h-10 max-w-56 cursor-pointer border border-white/25 bg-[rgba(79,184,178,0.16)] px-3 font-semibold text-white shadow-none hover:bg-[rgba(79,184,178,0.26)] focus-visible:border-white focus-visible:ring-[rgba(79,184,178,0.45)] [&_svg]:text-white/80"
                      style={{ borderRadius: '0.875rem' }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      align="end"
                      position="popper"
                      className="border-(--line) bg-(--color-background) p-2 text-(--sea-ink) shadow-xl"
                      style={{ borderRadius: '1rem' }}
                    >
                      {groups.map((group) => (
                        <SelectItem
                          key={group.id}
                          value={group.id}
                          className="cursor-pointer border border-transparent px-2 py-1.5 data-[highlighted]:border-[rgba(79,184,178,0.28)] data-[highlighted]:bg-[rgba(79,184,178,0.16)] data-[highlighted]:text-(--header-bg)"
                          style={{ borderRadius: '0.75rem' }}
                        >
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </label>
            )}
            {/* <Link
              to="/settings"
              className="nav-link"
              activeProps={{
                className: 'nav-link is-active',
              }}
            >
              Settings
            </Link> */}
            <NotificationLink unreadCount={unreadCount} />
            {/* <button type="button" onClick={resetDemo} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-white hover:bg-white/10" title="Reset all in-memory demo data">
            <RotateCcw aria-hidden="true" size={15} /> Reset demo
          </button> */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors duration-300 hover:bg-white/10 cursor-pointer"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <UserRound size={22} aria-hidden="true" />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-12 w-64 rounded-lg border border-(--line) bg-(--color-background) py-2 text-(--header-bg) shadow-lg "
                  role="menu"
                >
                  <div className="px-4 py-2">
                    <p className="truncate text-sm font-semibold text-(--header-bg)">
                      {currentMember.email}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-(--sea-ink-soft)">
                      {roleLabelForMember(currentMember, activeGroup)}
                    </p>
                  </div>
                  <div className="my-1 border-t border-(--line)" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 transition-colors duration-300 hover:bg-(--highlight-blue) hover:text-(--header-bg)"
                    role="menuitem"
                    onClick={() => {
                      handleSignOut()
                      setProfileOpen(false)
                    }}
                  >
                    <LogOut size={18} aria-hidden="true" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div
          className="relative flex items-center gap-1 md:hidden"
          ref={menuRef}
        >
          {currentMember && <NotificationLink unreadCount={unreadCount} />}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-[var(--color-background)] transition hover:bg-white/10"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {menuOpen && currentMember && (
            <div className="absolute right-0 top-12 w-64 rounded-lg border border-(--line) bg-(--color-background) py-2 text-(--header-bg) shadow-lg">
              {groups.length > 1 && activeGroup && (
                <label className="block px-4 py-2 text-xs font-semibold text-(--sea-ink-soft)">
                  Active Group
                  <Select
                    value={activeGroup.id}
                    onValueChange={handleActiveGroupChange}
                  >
                    <SelectTrigger
                      aria-label="Active Group"
                      className="mt-1 h-11 w-full cursor-pointer !rounded-xl border-(--line) bg-(--foam) px-3 font-semibold text-(--sea-ink) shadow-sm hover:bg-white focus-visible:border-(--lagoon-deep) focus-visible:ring-[rgba(62,137,137,0.2)]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="!rounded-2xl border-(--line) bg-(--color-background) p-2 text-(--sea-ink) shadow-xl"
                    >
                      {groups.map((group) => (
                        <SelectItem
                          key={group.id}
                          value={group.id}
                          className="cursor-pointer border border-transparent px-2 py-1.5 data-[highlighted]:border-[rgba(79,184,178,0.28)] data-[highlighted]:bg-[rgba(79,184,178,0.16)] data-[highlighted]:text-(--header-bg)"
                          style={{ borderRadius: '0.75rem' }}
                        >
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              )}
              <div className="my-1 border-t border-(--line)" />
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="block px-4 py-2 transition-colors duration-300 hover:bg-(--highlight-blue) hover:text-(--header-bg)"
                  activeProps={{
                    className:
                      'block px-4 py-2 bg-(--highlight-blue) !text-(--header-bg) transition-colors duration-300',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                  {item.label === 'Cart' && cartCount > 0 && (
                    <ShoppingCart
                      aria-hidden="true"
                      className="ml-2 inline"
                      size={14}
                    />
                  )}
                </Link>
              ))}
            </div>
          )}
          {!currentMember && (
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

function NotificationLink({ unreadCount }: { unreadCount: number }) {
  const countLabel = unreadCount > 99 ? '99+' : unreadCount

  return (
    <Link
      to="/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors duration-300 hover:bg-white/10"
      activeProps={{
        className:
          'relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white',
      }}
      aria-label={
        unreadCount === 0
          ? 'Notifications'
          : `Notifications, ${unreadCount} unread`
      }
    >
      <Bell size={21} aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute right-0 top-0 inline-flex min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold leading-5 text-(--header-bg)">
          {countLabel}
        </span>
      )}
    </Link>
  )
}
