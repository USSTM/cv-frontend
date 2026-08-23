import { useQuery } from '@tanstack/react-query'
import { getAvailability } from './availability'

export const availabilityQueryKey = ['availability'] as const
export function useAvailabilityQuery() {
  return useQuery({ queryKey: availabilityQueryKey, queryFn: getAvailability })
}
