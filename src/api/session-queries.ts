import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logout, requestOtp, verifyOtp } from './auth'
import { ApiError } from './client'
import { getCurrentMember } from './member'

export const currentMemberQueryKey = ['current-member'] as const

export function useCurrentMemberQuery() {
  return useQuery({
    queryKey: currentMemberQueryKey,
    queryFn: getCurrentMember,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 401) && failureCount < 2,
  })
}

export function useRequestOtpMutation() {
  return useMutation({ mutationFn: requestOtp })
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: currentMemberQueryKey })
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: currentMemberQueryKey })
    },
  })
}
