import type {
  AvailabilityResponse,
  CreateAvailabilityRequest,
  TimeSlot,
} from './generated/types.gen'
import { apiRequest } from './client'

export function getAvailability() {
  return apiRequest<Array<AvailabilityResponse>>('/availability')
}

export function getTimeSlots() {
  return apiRequest<Array<TimeSlot>>('/time-slots')
}

export function createAvailability(body: CreateAvailabilityRequest) {
  return apiRequest<AvailabilityResponse>('/availability', {
    method: 'POST',
    body,
  })
}

export function deleteAvailability(availabilityId: string) {
  return apiRequest<void>(
    `/availability/${encodeURIComponent(availabilityId)}`,
    {
      method: 'DELETE',
    },
  )
}
