import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Catalog', to: '/catalog' },
  { label: 'Cart', to: '/cart' },
  { label: 'Approvals', to: '/approvals' },
]

const EXTRA_ITEMS = [
  { label: 'Activity', to: '/activity' },
  { label: 'Approvals', to: '/approvals' },
  { label: 'Admin', to: '/admin' },
  { label: 'Settings', to: '/settings' },
  { label: 'Login', to: '/login' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 w-full bg-(--header-bg) text-white shadow-md">
      <nav className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-2xl font-bold text-white no-underline transition-colors duration-300 hover:text-white"
          >
            USSTM Campus Vault
          </Link>
          <div className="hidden h-10 border-l border-white/30 md:block" />
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
              </Link>
            ))}
          </div>
        </div>

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
        </div>

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

          {menuOpen && (
            <div className="absolute right-0 top-12 w-64 rounded-lg border border-(--line) bg-(--color-background) py-2 text-(--header-bg) shadow-lg">
              <div className="px-4 py-2">{/* <ThemeToggle /> */}</div>
              <div className="my-1 border-t border-(--line)" />
              {[...NAV_ITEMS, ...EXTRA_ITEMS].map((item) => (
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
