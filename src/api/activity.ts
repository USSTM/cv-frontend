import type {
  PaginatedBookingResponse,
  PaginatedBorrowingResponse,
  PaginatedItemResponse,
  RequestItemResponse,
} from './generated/types.gen'
import { apiRequest } from './client'

const PAGE_SIZE = 100

export function getMyBookings() {
  return apiRequest<PaginatedBookingResponse>(
    `/bookings/my-bookings?limit=${PAGE_SIZE}`,
  )
}
export function getMemberBorrowings(memberId: string) {
  return apiRequest<PaginatedBorrowingResponse>(
    `/borrowings/user/${encodeURIComponent(memberId)}?limit=${PAGE_SIZE}`,
  )
}
export function getMemberRequests(memberId: string) {
  return apiRequest<Array<RequestItemResponse>>(
    `/requests/user/${encodeURIComponent(memberId)}`,
  )
}
export function getActivityItems() {
  return apiRequest<PaginatedItemResponse>(`/items?limit=${PAGE_SIZE}`)
}
