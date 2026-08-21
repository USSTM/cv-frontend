import { vi } from 'vitest'

vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeader: vi.fn(() => undefined),
  setResponseHeader: vi.fn(),
}))
