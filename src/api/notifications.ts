import type {
  NotificationResponse,
  PaginatedNotificationResponse,
  UnreadNotificationCountResponse,
} from './generated/types.gen'
import { apiRequest } from './client'

export function getNotifications(limit = 20) {
  return apiRequest<PaginatedNotificationResponse>(
    `/notifications?${new URLSearchParams({ limit: String(limit) })}`,
  )
}

export function getUnreadNotificationCount() {
  return apiRequest<UnreadNotificationCountResponse>(
    '/notifications/unread-count',
  )
}

export function markNotificationAsRead(notificationId: string) {
  return apiRequest<NotificationResponse>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: 'PUT' },
  )
}

export function markAllNotificationsAsRead() {
  return apiRequest('/notifications/read-all', { method: 'PUT' })
}
