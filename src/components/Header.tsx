import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  LogOut,
  Menu,
  RotateCcw,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useDemo } from '@/demo/DemoContext'

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Activity', to: '/activity' },
  { label: 'Catalog', to: '/catalog' },
  { label: 'Cart', to: '/cart' },
  { label: 'Approvals', to: '/approvals' },
  { label: 'Admin', to: '/admin' },
]

export default function Header() {
  const { cart, resetDemo, session, signOut } = useDemo()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

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
          {session && (
            <div className="hidden h-10 border-l border-white/30 md:block" />
          )}
          {session && (
            <div className="hidden items-center gap-2 md:flex">
              {NAV_ITEMS.map((item) => (
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

        {session ? (
          <div className="hidden items-center gap-4 md:flex">
            {/* <ThemeToggle /> */}
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
                      signOut()
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

          {menuOpen && session && (
            <div className="absolute right-0 top-12 w-64 rounded-lg border border-(--line) bg-(--color-background) py-2 text-(--header-bg) shadow-lg">
              <div className="px-4 py-2">{/* <ThemeToggle /> */}</div>
              <div className="my-1 border-t border-(--line)" />
              {[...NAV_ITEMS].map((item) => (
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
          {!session && (
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
