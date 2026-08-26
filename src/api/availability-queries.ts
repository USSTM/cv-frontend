import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAvailability,
  deleteAvailability,
  getAvailability,
  getTimeSlots,
} from './availability'

export const availabilityQueryKey = ['availability'] as const
export const timeSlotsQueryKey = ['time-slots'] as const
export function useAvailabilityQuery() {
  return useQuery({ queryKey: availabilityQueryKey, queryFn: getAvailability })
}

export function useTimeSlotsQuery() {
  return useQuery({ queryKey: timeSlotsQueryKey, queryFn: getTimeSlots })
}

export function useCreateAvailabilityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAvailability,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: availabilityQueryKey }),
  })
}

export function useCreateAvailabilitiesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      date,
      timeSlotIds,
    }: {
      date: string
      timeSlotIds: string[]
    }) =>
      Promise.all(
        timeSlotIds.map((time_slot_id) =>
          createAvailability({ date, time_slot_id }),
        ),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: availabilityQueryKey }),
  })
}

export function useDeleteAvailabilityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAvailability,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: availabilityQueryKey }),
  })
}
