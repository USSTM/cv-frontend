import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  LogOut,
  Menu,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react'
import { useCurrentMemberQuery, useLogoutMutation } from '@/api/session-queries'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDemo } from '@/demo/DemoContext'
import { useActiveGroup } from '@/lib/active-group'
import { canManageActiveGroup, navigationForMember } from '@/lib/member-access'

export default function Header() {
  const { cart } = useDemo()
  const { data: currentMember } = useCurrentMemberQuery()
  const { activeGroup, groups, selectActiveGroup } = useActiveGroup()
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
      navigate({ to: '/' })
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
            className="text-2xl font-bold text-white no-underline transition-colors duration-300 hover:text-white"
          >
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
                  {item.label === 'Cart' && cart.length > 0 && (
                    <span className="ml-1 inline-flex min-w-4 justify-center rounded-full bg-white/20 px-1 text-xs">
                      {cart.reduce((total, entry) => total + entry.quantity, 0)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {currentMember ? (
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
                      className="h-9 max-w-52 border-white/30 bg-white/10 font-semibold text-white shadow-none hover:bg-white/15 focus-visible:border-white focus-visible:ring-white/30 [&_svg]:text-white/70"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      align="end"
                      position="popper"
                      className="border-(--line) bg-(--color-background) text-(--sea-ink)"
                    >
                      {groups.map((group) => (
                        <SelectItem
                          key={group.id}
                          value={group.id}
                          className="focus:bg-(--highlight-blue) focus:text-(--header-bg)"
                        >
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </label>
            )}
            <Link
              to="/settings"
              className="nav-link"
              activeProps={{
                className: 'nav-link is-active',
              }}
            >
              Settings
            </Link>
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
                  className="absolute right-0 top-12 w-40 rounded-lg border border-(--line) bg-(--color-background) py-2 text-(--header-bg) shadow-lg "
                  role="menu"
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 transition-colors duration-300 hover:bg-(--highlight-blue) hover:text-(--header-bg)"
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
        ) : (
          <Link
            to="/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 md:inline-flex"
          >
            Log in
          </Link>
        )}

        <div className="relative md:hidden" ref={menuRef}>
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
                      className="mt-1 h-10 w-full border-(--line) bg-white font-semibold text-(--sea-ink) shadow-sm focus-visible:border-(--lagoon-deep) focus-visible:ring-[rgba(62,137,137,0.2)]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="border-(--line) bg-(--color-background) text-(--sea-ink)"
                    >
                      {groups.map((group) => (
                        <SelectItem
                          key={group.id}
                          value={group.id}
                          className="focus:bg-(--highlight-blue) focus:text-(--header-bg)"
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
                  {item.label === 'Cart' && cart.length > 0 && (
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
