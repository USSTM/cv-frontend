import type { AvailabilityResponse } from './generated/types.gen'
import { apiRequest } from './client'

export function getAvailability() {
  return apiRequest<Array<AvailabilityResponse>>('/availability')
}
