"use client"

import { useState } from "react"
import { DesktopSidebar, MobileBottomNav } from "@/components/app-nav"
import { UserMenu } from "@/components/user-menu"
import { OnboardingModal } from "@/components/onboarding-modal"
import { FocusEngine } from "@/components/focus-engine"
import { NotesVault } from "@/components/notes-vault"
import { LectureTheatre } from "@/components/lecture-theatre"
import { BrandLogo } from "@/components/brand-logo"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { STORAGE_KEYS, type Tab, type UserProfile } from "@/lib/icse"

const TAB_META: Record<Tab, { title: string; subtitle: string }> = {
  focus: {
    title: "Focus Engine",
    subtitle: "Lock in with the Pomodoro timer and build your streak.",
  },
  notes: {
    title: "Notes Vault",
    subtitle: "Capture revision tasks with version history and a recycle bin.",
  },
  lectures: {
    title: "Lecture Theatre",
    subtitle: "Stream chapter-wise lectures and grab the board notes.",
  },
}

export function Dashboard() {
  const [profile, setProfile, hydrated] = useLocalStorage<UserProfile>(STORAGE_KEYS.profile, {
    name: "",
  })
  const [activeTab, setActiveTab] = useState<Tab>("focus")

  const needsOnboarding = hydrated && !profile.name
  const meta = TAB_META[activeTab]

  return (
    <div className="flex min-h-dvh bg-background">
      <DesktopSidebar activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="min-w-0">
            {/* Compact brand on mobile */}
            <div className="md:hidden">
              <div className="rounded-md bg-navy px-3 py-1.5">
                <BrandLogo className="[&_span]:text-lg [&_span:last-child]:text-[10px]" />
              </div>
            </div>
            {/* Page title on desktop */}
            <div className="hidden md:block">
              <h1 className="font-serif text-2xl font-bold text-navy">{meta.title}</h1>
              <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
            </div>
          </div>

          {hydrated && profile.name ? (
            <UserMenu name={profile.name} />
          ) : (
            <div className="size-9 rounded-full bg-secondary" aria-hidden="true" />
          )}
        </header>

        {/* Content */}
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          {/* Mobile page title */}
          <div className="mb-5 md:hidden">
            <h1 className="font-serif text-xl font-bold text-navy">{meta.title}</h1>
            <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>

          {activeTab === "focus" && <FocusEngine />}
          {activeTab === "notes" && <NotesVault />}
          {activeTab === "lectures" && <LectureTheatre />}
        </main>
      </div>

      <MobileBottomNav activeTab={activeTab} onChange={setActiveTab} />

      <OnboardingModal
        open={needsOnboarding}
        onComplete={(name) => setProfile({ name })}
      />
    </div>
  )
}
