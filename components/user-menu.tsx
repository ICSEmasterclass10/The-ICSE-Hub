"use client"

import { useEffect, useMemo } from "react"
import { Flame, ChevronDown, Award } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  STORAGE_KEYS,
  DEFAULT_CHECKLIST_ITEMS,
  todayKey,
  computeRank,
  type StreakData,
  type FocusStats,
  type DailyChecklist,
} from "@/lib/icse"
import { cn } from "@/lib/utils"

export function UserMenu({ name }: { name: string }) {
  const [streak] = useLocalStorage<StreakData>(STORAGE_KEYS.streak, {
    count: 0,
    lastCompletionDate: "",
  })
  const [focus] = useLocalStorage<FocusStats>(STORAGE_KEYS.focus, {
    totalFocusSeconds: 0,
    sessionsCompleted: 0,
  })
  const [checklist, setChecklist] = useLocalStorage<DailyChecklist>(
    STORAGE_KEYS.checklist,
    { date: todayKey(), items: DEFAULT_CHECKLIST_ITEMS },
  )

  const today = todayKey()

  // Reset the checklist when the day changes
  useEffect(() => {
    if (checklist.date !== today) {
      setChecklist({ date: today, items: DEFAULT_CHECKLIST_ITEMS })
    }
  }, [checklist.date, today, setChecklist])

  const items = checklist.date === today ? checklist.items : DEFAULT_CHECKLIST_ITEMS

  const rank = useMemo(() => computeRank(focus.totalFocusSeconds), [focus.totalFocusSeconds])
  const completedCount = items.filter((i) => i.done).length

  // A streak only counts as "live" if completed today or yesterday
  const liveStreak = useMemo(() => {
    if (!streak.lastCompletionDate) return 0
    const last = new Date(streak.lastCompletionDate)
    const now = new Date(today)
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000)
    return diffDays <= 1 ? streak.count : 0
  }, [streak, today])

  function toggleItem(id: string) {
    setChecklist((prev) => {
      const base = prev.date === today ? prev : { date: today, items: DEFAULT_CHECKLIST_ITEMS }
      return {
        date: today,
        items: base.items.map((item) =>
          item.id === id ? { ...item, done: !item.done } : item,
        ),
      }
    })
  }

  const rankStyles: Record<string, string> = {
    Novice: "bg-secondary text-secondary-foreground",
    Scholar: "bg-navy text-navy-foreground",
    "Board Topper": "bg-gold text-gold-foreground",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pl-2 pr-3 text-left shadow-sm transition-colors hover:bg-secondary"
        aria-label="Open profile menu"
      >
          <span className="flex size-9 items-center justify-center rounded-full bg-navy font-serif text-sm font-bold text-gold">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="max-w-[10rem] truncate text-sm font-semibold text-foreground">
              {name}
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 font-medium text-gold">
                <Flame className="size-3.5 fill-gold text-gold" aria-hidden="true" />
                {liveStreak}d
              </span>
              <span>{rank}</span>
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="flex items-center gap-3 border-b border-border bg-navy p-4 text-navy-foreground">
          <span className="flex size-11 items-center justify-center rounded-full bg-gold font-serif text-lg font-bold text-gold-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-base font-semibold">{name}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gold">
                <Flame className="size-3.5 fill-gold text-gold" aria-hidden="true" />
                {liveStreak} day streak
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Award className="size-4 text-gold" aria-hidden="true" />
            Academic Rank
          </span>
          <Badge className={cn("border-0", rankStyles[rank])}>{rank}</Badge>
        </div>

        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Daily Target Checklist</p>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{items.length}
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-gold-foreground"
                  />
                  <span
                    className={cn(
                      "text-sm",
                      item.done
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">Resets every day at midnight.</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
