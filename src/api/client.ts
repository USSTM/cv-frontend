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

export async function apiRequest<T>(
  path: string,
  { body, headers, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(new URL(path, apiBaseUrl), {
    ...options,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  })

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as ApiErrorPayload | null
    throw new ApiError(
      response.status,
      payload?.error?.message ??
        `Request failed with status ${response.status}.`,
      payload?.error?.code,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
