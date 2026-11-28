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

// Status 0 marks a request that never got an HTTP response (server down,
// network offline, DNS or CORS failure). Browsers only report these as an
// opaque "Failed to fetch" TypeError, so translate them into something a
// member can act on.
export const NETWORK_ERROR_STATUS = 0
export const NETWORK_ERROR_CODE = 'NETWORK_ERROR'
export const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Check your internet connection and try again. If the problem continues, the service may be temporarily down."

// Used when an error response has no JSON `error.message` from the API, e.g.
// a reverse-proxy HTML page for a 502 or an empty body.
export function describeHttpStatus(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid. Check your input and try again.'
    case 401:
      return 'Your session has expired. Please log in again.'
    case 403:
      return "You don't have permission to do that."
    case 404:
      return "We couldn't find what you were looking for. It may have been moved or deleted."
    case 408:
      return 'The request timed out. Please try again.'
    case 409:
      return 'This conflicts with a recent change. Refresh the page and try again.'
    case 413:
      return 'The upload is too large. Try a smaller file.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 502:
    case 503:
    case 504:
      return `The server is temporarily unavailable (error ${status}). Please try again in a few minutes.`
  }
  if (status >= 500) {
    return `Something went wrong on the server (error ${status}). Please try again.`
  }
  return `The request failed (error ${status}). Please try again.`
}

// A plain-text error body from the API is worth showing; an HTML error page
// from a proxy, raw JSON, or an oversized dump is not.
const MAX_PLAIN_TEXT_ERROR_LENGTH = 300

function readableErrorText(errorText: string): string | null {
  const text = errorText.trim()
  if (
    !text ||
    text.length > MAX_PLAIN_TEXT_ERROR_LENGTH ||
    ['<', '{', '['].includes(text[0])
  ) {
    return null
  }
  return text
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

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

  let response: Response
  try {
    response = await fetch(new URL(path, apiBaseUrl), {
      ...options,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
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
  } catch (error) {
    // Cancellations (e.g. React Query aborting a stale query) must stay
    // recognisable as aborts rather than being reported as network failures.
    if (isAbortError(error)) throw error
    throw new ApiError(
      NETWORK_ERROR_STATUS,
      NETWORK_ERROR_MESSAGE,
      NETWORK_ERROR_CODE,
    )
  }

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
        readableErrorText(errorText) ??
        describeHttpStatus(response.status),
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
