import { useQuery } from '@tanstack/react-query'
import type { PaginatedBookingResponse } from './generated/types.gen'
import { apiRequest } from './client'

export function useBookingsQuery() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => apiRequest<PaginatedBookingResponse>('/bookings?limit=100'),
  })
}
