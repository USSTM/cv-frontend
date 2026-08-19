import type { CurrentMember } from './generated/types.gen'
import { apiRequest } from './client'

export function getCurrentMember() {
  return apiRequest<CurrentMember>('/members/me')
}
