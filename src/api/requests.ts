import type {
  PaginatedRequestResponse,
  ReviewRequestRequest,
} from './generated/types.gen'
import { apiRequest } from './client'

export type ReviewRequestPayload =
  | ReviewRequestRequest
  | {
      status: 'denied'
      denial_reason: string
    }

export function getPendingRequests() {
  return apiRequest<PaginatedRequestResponse>('/requests/pending')
}

export function getAllRequests() {
  return apiRequest<PaginatedRequestResponse>('/requests')
}

export function reviewRequest(requestId: string, body: ReviewRequestPayload) {
  return apiRequest(`/requests/${encodeURIComponent(requestId)}/review`, {
    method: 'POST',
    body,
  })
}
