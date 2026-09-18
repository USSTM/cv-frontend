import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ApiError } from '@/api/client'
import { useCurrentMemberQuery } from '@/api/session-queries'
import Header from '../components/Header'
import { ActiveGroupProvider } from '../lib/active-group'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: 'USSTM Campus Vault',
        },
      ],
      links: [
        {
          rel: 'stylesheet',
          href: appCss,
        },
        {
          rel: 'icon',
          href: '/favicon.ico',
          sizes: 'any',
        },
        {
          rel: 'manifest',
          href: '/manifest.json',
        },
      ],
    }),
    shellComponent: RootDocument,
  },
)

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[var(--bg-base)] font-sans antialiased text-[var(--sea-ink)] wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]">
        <ActiveGroupProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <SessionGate>{children}</SessionGate>
          </div>
        </ActiveGroupProvider>
        <Scripts />
      </body>
    </html>
  )
}

function SessionGate({ children }: { children: React.ReactNode }) {
  const { data: currentMember, error, isPending } = useCurrentMemberQuery()
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname === '/login'
  const isPublicRoute = isLogin || location.pathname.startsWith('/invite')
  const requiresSession = !isPublicRoute
  const isUnauthenticated = error instanceof ApiError && error.status === 401

  useEffect(() => {
    if (isPending) return

    if (currentMember && isLogin) {
      navigate({ to: '/activity', replace: true })
      return
    }

    if (isUnauthenticated && requiresSession) {
      navigate({ to: '/login', replace: true })
    }
  }, [
    currentMember,
    isLogin,
    isPending,
    isUnauthenticated,
    navigate,
    requiresSession,
  ])

  if (
    isPending ||
    (currentMember && isLogin) ||
    (isUnauthenticated && requiresSession)
  ) {
    return (
      <main className="page-wrap flex flex-1 items-center justify-center px-4 py-12">
        <p className="text-sm text-(--sea-ink-soft)">Checking your session…</p>
      </main>
    )
  }

  return <div className="flex-1 pb-16">{children}</div>
}
