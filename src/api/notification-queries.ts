import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notifications'
import type { PaginatedNotificationResponse } from './generated/types.gen'

export const notificationsQueryKey = ['notifications'] as const
export const unreadNotificationCountQueryKey = [
  'notifications',
  'unread-count',
] as const

export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => getNotifications(),
  })
}

export function useUnreadNotificationCountQuery(enabled = true) {
  return useQuery({
    queryKey: unreadNotificationCountQueryKey,
    queryFn: getUnreadNotificationCount,
    enabled,
  })
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey })
      await queryClient.cancelQueries({
        queryKey: unreadNotificationCountQueryKey,
      })

      const previousNotifications =
        queryClient.getQueryData<PaginatedNotificationResponse>(
          notificationsQueryKey,
        )
      const previousUnreadCount = queryClient.getQueryData<{
        unread_count: number
      }>(unreadNotificationCountQueryKey)
      const wasUnread = previousNotifications?.data.some(
        (notification) =>
          notification.notification_id === notificationId &&
          !notification.is_read,
      )

      queryClient.setQueryData<PaginatedNotificationResponse>(
        notificationsQueryKey,
        (current) =>
          current && {
            ...current,
            data: current.data.map((notification) =>
              notification.notification_id === notificationId
                ? { ...notification, is_read: true }
                : notification,
            ),
          },
      )
      if (wasUnread && previousUnreadCount) {
        queryClient.setQueryData(unreadNotificationCountQueryKey, {
          unread_count: Math.max(0, previousUnreadCount.unread_count - 1),
        })
      }

      return { previousNotifications, previousUnreadCount }
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(
        notificationsQueryKey,
        context?.previousNotifications,
      )
      queryClient.setQueryData(
        unreadNotificationCountQueryKey,
        context?.previousUnreadCount,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
      void queryClient.invalidateQueries({
        queryKey: unreadNotificationCountQueryKey,
      })
    },
  })
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsQueryKey })
      await queryClient.cancelQueries({
        queryKey: unreadNotificationCountQueryKey,
      })

      const previousNotifications =
        queryClient.getQueryData<PaginatedNotificationResponse>(
          notificationsQueryKey,
        )
      const previousUnreadCount = queryClient.getQueryData<{
        unread_count: number
      }>(unreadNotificationCountQueryKey)

      queryClient.setQueryData<PaginatedNotificationResponse>(
        notificationsQueryKey,
        (current) =>
          current && {
            ...current,
            data: current.data.map((notification) => ({
              ...notification,
              is_read: true,
            })),
          },
      )
      queryClient.setQueryData(unreadNotificationCountQueryKey, {
        unread_count: 0,
      })

      return { previousNotifications, previousUnreadCount }
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(
        notificationsQueryKey,
        context?.previousNotifications,
      )
      queryClient.setQueryData(
        unreadNotificationCountQueryKey,
        context?.previousUnreadCount,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
      void queryClient.invalidateQueries({
        queryKey: unreadNotificationCountQueryKey,
      })
    },
  })
}
