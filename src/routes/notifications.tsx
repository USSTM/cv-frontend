import { createFileRoute } from '@tanstack/react-router'
import { Bell, Check, CheckCheck, Inbox } from 'lucide-react'
import type { NotificationResponse } from '@/api/generated/types.gen'
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
} from '@/api/notification-queries'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/lib/route-guards'

export const Route = createFileRoute('/notifications')({
  beforeLoad: requireAuth,
  component: NotificationsPage,
})

function NotificationsPage() {
  const notifications = useNotificationsQuery()
  const markOneRead = useMarkNotificationAsReadMutation()
  const markAllRead = useMarkAllNotificationsAsReadMutation()
  const unreadCount =
    notifications.data?.data.filter((notification) => !notification.is_read)
      .length ?? 0

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="island-kicker mb-2 text-(--kicker)!">Member</p>
            <h1 className="display-title text-3xl font-bold">Notifications</h1>
            <p className="mt-2 max-w-xl text-(--sea-ink-soft)">
              Recent updates about your Campus Vault activity.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-fit border-(--line)"
            disabled={unreadCount === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck aria-hidden="true" />
            {markAllRead.isPending ? 'Marking read…' : 'Mark all as read'}
          </Button>
        </div>
        <section className="island-shell mt-8 overflow-hidden rounded-2xl">
          {notifications.isPending ? (
            <div
              className="space-y-4 p-5 sm:p-6"
              aria-label="Loading notifications"
            >
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-(--foam)"
                />
              ))}
            </div>
          ) : notifications.isError ? (
            <div className="px-6 py-12 text-center">
              <h2 className="font-semibold">
                Notifications could not be loaded
              </h2>
              <p className="mt-2 text-sm text-(--sea-ink-soft)">
                Please try again in a moment.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 border-(--line)"
                onClick={() => notifications.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : notifications.data?.data.length ? (
            <ul className="divide-y divide-(--line)">
              {notifications.data.data.map((notification) => (
                <NotificationItem
                  key={notification.notification_id}
                  notification={notification}
                  isMarkingRead={
                    markOneRead.isPending &&
                    markOneRead.variables === notification.notification_id
                  }
                  onMarkRead={() =>
                    markOneRead.mutate(notification.notification_id)
                  }
                />
              ))}
            </ul>
          ) : (
            <div className="px-6 py-14 text-center">
              <Inbox
                aria-hidden="true"
                className="mx-auto text-(--lagoon-deep)"
                size={28}
              />
              <h2 className="mt-4 font-semibold">You’re all caught up</h2>
              <p className="mt-2 text-sm text-(--sea-ink-soft)">
                New Campus Vault updates will appear here.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function NotificationItem({
  notification,
  isMarkingRead,
  onMarkRead,
}: {
  notification: NotificationResponse
  isMarkingRead: boolean
  onMarkRead: () => void
}) {
  return (
    <li
      className={`flex gap-4 p-5 sm:p-6 ${notification.is_read ? '' : 'bg-[rgba(79,184,178,0.08)]'}`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.14)] text-(--lagoon-deep)">
        <Bell aria-hidden="true" size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-semibold text-(--sea-ink)">
              {capitalize(displayEntityType(notification.entity_type_name))}{' '}
              updated
            </h2>
            <p className="mt-1 text-sm text-(--sea-ink-soft)">
              {notification.actor_email} made an update to this{' '}
              {displayEntityType(notification.entity_type_name)}.
            </p>
            <time
              className="mt-2 block text-xs font-medium text-(--sea-ink-soft)"
              dateTime={notification.notification_created_at}
            >
              {formatNotificationDate(notification.notification_created_at)}
            </time>
          </div>
          {!notification.is_read && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit shrink-0 border-(--line)"
              disabled={isMarkingRead}
              onClick={onMarkRead}
            >
              <Check aria-hidden="true" />
              {isMarkingRead ? 'Marking…' : 'Mark read'}
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}

function displayEntityType(value: string) {
  return value.replaceAll('_', ' ')
}
function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
function formatNotificationDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}
