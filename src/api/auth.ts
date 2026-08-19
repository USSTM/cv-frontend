import type {
  MessageResponse,
  RequestOtpRequest,
  SessionResponse,
  VerifyOtpRequest,
} from './generated/types.gen'
import { apiRequest } from './client'

export function requestOtp(body: RequestOtpRequest) {
  return apiRequest<MessageResponse>('/auth/request-otp', {
    method: 'POST',
    body,
  })
}

export function verifyOtp(body: VerifyOtpRequest) {
  return apiRequest<SessionResponse>('/auth/verify-otp', {
    method: 'POST',
    body,
  })
}

/** Clears the HTTP-only cookie session without sending a browser-held token. */
export function logout() {
  return apiRequest<MessageResponse>('/auth/logout', {
    method: 'POST',
  })
}
