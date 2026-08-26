import { createIsomorphicFn } from '@tanstack/react-start'
import {
  getRequestHeader,
  setResponseHeader,
} from '@tanstack/react-start/server'

// Node's fetch has no cookie jar, so during SSR the session cookie has to be
// forwarded by hand from the incoming browser request onto the outgoing one.
const getForwardedCookie = createIsomorphicFn()
  .server(() => getRequestHeader('cookie'))
  .client(() => undefined)

// Likewise, a rotated Set-Cookie from a server-side refresh has to be forwarded
// by hand onto the response back to the browser. Client-side this is a no-op:
// the browser already stores Set-Cookie from an in-browser fetch on its own.
const forwardSetCookies = createIsomorphicFn()
  .server((setCookies: Array<string>) => {
    if (setCookies.length > 0) {
      setResponseHeader('set-cookie', setCookies)
    }
  })
  .client(() => {})

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

type ApiErrorPayload = {
  error?: {
    code?: string
    message?: string
  }
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// These must never trigger a refresh-and-retry themselves: refresh/logout
// would otherwise recurse into refreshing in response to their own 401, and
// the OTP endpoints are unauthenticated so refreshing can never help them.
const NO_REFRESH_RETRY_PATHS = new Set([
  '/auth/refresh',
  '/auth/logout',
  '/auth/request-otp',
  '/auth/verify-otp',
])

let refreshPromise: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = rawApiRequest('/auth/refresh', { method: 'POST' })
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function rawApiRequest<T>(
  path: string,
  { body, headers, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const forwardedCookie = getForwardedCookie()
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const response = await fetch(new URL(path, apiBaseUrl), {
    ...options,
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body === undefined || isFormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(forwardedCookie ? { Cookie: forwardedCookie } : {}),
      ...headers,
    },
  })

  forwardSetCookies(response.headers.getSetCookie())

  if (!response.ok) {
    const errorText = await response.text()
    const payload = (() => {
      try {
        return JSON.parse(errorText) as ApiErrorPayload
      } catch {
        return null
      }
    })()
    throw new ApiError(
      response.status,
      payload?.error?.message ??
        (errorText.trim() || `Request failed with status ${response.status}.`),
      payload?.error?.code,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) return undefined as T

  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  try {
    return await rawApiRequest<T>(path, options)
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      !NO_REFRESH_RETRY_PATHS.has(path) &&
      (await refreshSession())
    ) {
      return rawApiRequest<T>(path, options)
    }
    throw error
  }
}
