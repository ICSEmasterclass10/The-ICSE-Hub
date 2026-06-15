"use client"

import { Timer, NotebookPen, MonitorPlay } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { cn } from "@/lib/utils"
import type { Tab } from "@/lib/icse"

const NAV_ITEMS: { id: Tab; label: string; shortLabel: string; icon: typeof Timer }[] = [
  { id: "focus", label: "Focus Engine", shortLabel: "Focus", icon: Timer },
  { id: "notes", label: "Notes Vault", shortLabel: "Notes", icon: NotebookPen },
  { id: "lectures", label: "Lecture Theatre", shortLabel: "Lectures", icon: MonitorPlay },
]

export function DesktopSidebar({
  activeTab,
  onChange,
}: {
  activeTab: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="border-b border-sidebar-border px-6 py-6">
        <BrandLogo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Main navigation">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Study Tools
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold text-gold-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/40">ICSE Class 10 &middot; 2026</p>
      </div>
    </aside>
  )
}

export function MobileBottomNav({
  activeTab,
  onChange,
}: {
  activeTab: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-sidebar-border bg-sidebar md:hidden"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = activeTab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
              active ? "text-gold" : "text-sidebar-foreground/70",
            )}
          >
            <Icon className={cn("size-5", active && "fill-gold/10")} aria-hidden="true" />
            {item.shortLabel}
          </button>
        )
      })}
    </nav>
  )
}
