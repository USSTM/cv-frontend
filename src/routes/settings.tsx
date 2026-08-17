import { createFileRoute } from '@tanstack/react-router'
import {
  Bell,
  CheckCircle2,
  CircleUserRound,
  Mail,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [preferences, setPreferences] = useState({
    requestUpdates: true,
    bookingReminders: true,
    borrowingReminders: true,
    emailDigest: false,
  })
  const [saved, setSaved] = useState(false)

  function togglePreference(preference: keyof typeof preferences) {
    setPreferences((current) => ({
      ...current,
      [preference]: !current[preference],
    }))
    setSaved(false)
  }

  return (
    <main className="page-wrap px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="island-kicker mb-2 text-(--kicker)!">Preferences</p>
          <h1 className="display-title text-3xl font-bold">Settings</h1>
          <p className="mt-2 max-w-2xl text-(--sea-ink-soft)">
            Manage the preferences that shape your Campus Vault experience.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6">
            <section className="island-shell overflow-hidden rounded-2xl">
              <div className="flex items-start gap-3 border-b border-(--line) px-5 py-5 sm:px-6">
                <CircleUserRound
                  aria-hidden="true"
                  className="mt-0.5 text-(--lagoon-deep)"
                  size={21}
                />
                <div>
                  <h2 className="text-lg font-semibold">Member profile</h2>
                  <p className="mt-1 text-sm text-(--sea-ink-soft)">
                    Profile details are provided by your student group.
                  </p>
                </div>
              </div>
              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <ProfileField label="Name" value="Arsal Abrar" />
                <ProfileField label="Email" value="arsal.abrar@torontomu.ca" />
              </div>
            </section>

            <section className="island-shell overflow-hidden rounded-2xl">
              <div className="flex items-start gap-3 border-b border-(--line) px-5 py-5 sm:px-6">
                <Bell
                  aria-hidden="true"
                  className="mt-0.5 text-(--lagoon-deep)"
                  size={21}
                />
                <div>
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  <p className="mt-1 text-sm text-(--sea-ink-soft)">
                    Choose which Campus Vault updates you want to receive.
                  </p>
                </div>
              </div>
              <div className="divide-y divide-(--line)">
                <PreferenceRow
                  icon={ShieldCheck}
                  title="Request updates"
                  description="Get notified when an Approver makes a decision on a Request Item."
                  enabled={preferences.requestUpdates}
                  onToggle={() => togglePreference('requestUpdates')}
                />
                <PreferenceRow
                  icon={Smartphone}
                  title="Booking reminders"
                  description="Receive a reminder before an upcoming pickup or return booking."
                  enabled={preferences.bookingReminders}
                  onToggle={() => togglePreference('bookingReminders')}
                />
                <PreferenceRow
                  icon={Mail}
                  title="Borrowing return reminders"
                  description="Receive reminders when an item you borrowed is approaching its return date."
                  enabled={preferences.borrowingReminders}
                  onToggle={() => togglePreference('borrowingReminders')}
                />
                <PreferenceRow
                  icon={Mail}
                  title="Activity digest"
                  description="Receive a weekly email summary of your bookings, borrowings, and requests."
                  enabled={preferences.emailDigest}
                  onToggle={() => togglePreference('emailDigest')}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="island-shell rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Save changes</h2>
              <p className="mt-2 text-sm leading-6 text-(--sea-ink-soft)">
                Save updates to your notification choices.
              </p>
              <Button
                className="btn-inv mt-5 w-full"
                onClick={() => setSaved(true)}
              >
                {saved && <CheckCircle2 aria-hidden="true" size={16} />}
                {saved ? 'Preferences saved' : 'Save preferences'}
              </Button>
            </section>
            <section className="rounded-2xl border border-dashed border-(--line) bg-white/50 p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Group settings</h2>
              <p className="mt-2 text-sm leading-6 text-(--sea-ink-soft)">
                Group-specific settings will appear here when they are available
                for your role.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-(--sea-ink-soft) uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-(--sea-ink)">{value}</p>
    </div>
  )
}

function PreferenceRow({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: typeof Bell
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-start gap-4 px-5 py-5 sm:px-6">
      <Icon
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-(--lagoon-deep)"
        size={20}
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-(--sea-ink)">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-(--sea-ink-soft)">
          {description}
        </p>
      </div>
      <label className="relative mt-1 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={enabled}
          onChange={onToggle}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${title}`}
        />
        <span className="absolute inset-0 rounded-full bg-(--line) transition-colors peer-checked:bg-(--lagoon-deep) peer-focus-visible:ring-2 peer-focus-visible:ring-(--lagoon-deep) peer-focus-visible:ring-offset-2" />
        <span className="absolute left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  )
}
