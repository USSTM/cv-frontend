import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReviewRequestRequest } from './generated/types.gen'
import { getAllRequests, getPendingRequests, reviewRequest } from './requests'

export const requestsQueryKey = ['requests'] as const
export const pendingRequestsQueryKey = ['requests', 'pending'] as const

export function usePendingRequestsQuery() {
  return useQuery({
    queryKey: pendingRequestsQueryKey,
    queryFn: getPendingRequests,
  })
}

export function useAllRequestsQuery(enabled = false) {
  return useQuery({
    queryKey: requestsQueryKey,
    queryFn: getAllRequests,
    enabled,
  })
}

export function useReviewRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string
      body: ReviewRequestRequest
    }) => reviewRequest(requestId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: requestsQueryKey }),
  })
}
