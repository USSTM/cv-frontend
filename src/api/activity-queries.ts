import { useQuery } from '@tanstack/react-query'
import {
  getActivityItems,
  getMemberBorrowings,
  getMemberRequests,
  getMyBookings,
} from './activity'

export function useMyBookingsQuery() {
  return useQuery({
    queryKey: ['activity', 'bookings'],
    queryFn: getMyBookings,
  })
}
export function useMemberBorrowingsQuery(memberId: string | undefined) {
  return useQuery({
    queryKey: ['activity', 'borrowings', memberId],
    queryFn: () => getMemberBorrowings(memberId!),
    enabled: Boolean(memberId),
  })
}
export function useMemberRequestsQuery(memberId: string | undefined) {
  return useQuery({
    queryKey: ['activity', 'requests', memberId],
    queryFn: () => getMemberRequests(memberId!),
    enabled: Boolean(memberId),
  })
}
export function useActivityItemsQuery() {
  return useQuery({
    queryKey: ['activity', 'items'],
    queryFn: getActivityItems,
  })
}
