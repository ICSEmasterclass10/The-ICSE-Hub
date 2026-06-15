"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Play, Pause, RotateCcw, Flame, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  STORAGE_KEYS,
  todayKey,
  computeRank,
  type StreakData,
  type FocusStats,
} from "@/lib/icse"
import { cn } from "@/lib/utils"

const PRESETS = [
  { label: "25 Mins", minutes: 25 },
  { label: "5 Mins", minutes: 5 },
  { label: "60 Mins", minutes: 60 },
]

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export function FocusEngine() {
  const [streak, setStreak] = useLocalStorage<StreakData>(STORAGE_KEYS.streak, {
    count: 0,
    lastCompletionDate: "",
  })
  const [focus, setFocus] = useLocalStorage<FocusStats>(STORAGE_KEYS.focus, {
    totalFocusSeconds: 0,
    sessionsCompleted: 0,
  })

  const [duration, setDuration] = useState(25 * 60)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const [justFinished, setJustFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const completeSession = useCallback(
    (sessionSeconds: number) => {
      const today = todayKey()
      setFocus((prev) => ({
        totalFocusSeconds: prev.totalFocusSeconds + sessionSeconds,
        sessionsCompleted: prev.sessionsCompleted + 1,
      }))
      setStreak((prev) => {
        if (prev.lastCompletionDate === today) return prev
        const yesterday = todayKey(new Date(Date.now() - 86_400_000))
        const nextCount = prev.lastCompletionDate === yesterday ? prev.count + 1 : 1
        return { count: nextCount, lastCompletionDate: today }
      })
      setJustFinished(true)
    },
    [setFocus, setStreak],
  )

  // Timer tick
  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setIsRunning(false)
          completeSession(duration)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, duration, completeSession])

  function selectDuration(minutes: number) {
    setIsRunning(false)
    setJustFinished(false)
    const total = Math.round(minutes * 60)
    setDuration(total)
    setSecondsLeft(total)
  }

  function applyCustom() {
    const minutes = Number.parseInt(customValue, 10)
    if (!Number.isFinite(minutes) || minutes <= 0) return
    selectDuration(Math.min(minutes, 180))
  }

  function reset() {
    setIsRunning(false)
    setJustFinished(false)
    setSecondsLeft(duration)
  }

  const progress = duration > 0 ? secondsLeft / duration : 0
  const RADIUS = 130
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const liveStreak = useMemo(() => {
    if (!streak.lastCompletionDate) return 0
    const diff = Math.round(
      (new Date(todayKey()).getTime() - new Date(streak.lastCompletionDate).getTime()) /
        86_400_000,
    )
    return diff <= 1 ? streak.count : 0
  }, [streak])

  const totalHours = (focus.totalFocusSeconds / 3600).toFixed(1)
  const rank = computeRank(focus.totalFocusSeconds)
  const activeMinutes = Math.round(duration / 60)

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
      {/* Stat cards */}
      <div className="grid w-full grid-cols-3 gap-3">
        <StatCard icon={<Flame className="size-4 text-gold" />} label="Day Streak" value={`${liveStreak}`} />
        <StatCard icon={<Clock className="size-4 text-gold" />} label="Focus Hours" value={totalHours} />
        <StatCard icon={<Flame className="size-4 text-gold" />} label="Rank" value={rank} small />
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PRESETS.map((preset) => {
          const active = duration === preset.minutes * 60 && !customValue
          return (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              onClick={() => {
                setCustomValue("")
                selectDuration(preset.minutes)
              }}
              className={cn(
                "rounded-full border-border",
                active && "border-gold bg-gold text-gold-foreground hover:bg-gold/90",
              )}
            >
              {preset.label}
            </Button>
          )
        })}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={180}
            inputMode="numeric"
            placeholder="Custom"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCustom()}
            className="w-24 rounded-full"
            aria-label="Custom minutes"
          />
          <Button
            type="button"
            variant="outline"
            onClick={applyCustom}
            className="rounded-full border-border"
          >
            Set
          </Button>
        </div>
      </div>

      {/* Circular timer */}
      <div className="relative flex size-[300px] items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 300 300" aria-hidden="true">
          <circle
            cx="150"
            cy="150"
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth="14"
          />
          <circle
            cx="150"
            cy="150"
            r={RADIUS}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-6xl font-bold tabular-nums text-navy">
            {format(secondsLeft)}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            {justFinished
              ? "Session complete!"
              : isRunning
                ? "Stay focused"
                : `${activeMinutes} minute session`}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRunning ? (
          <Button
            type="button"
            size="lg"
            onClick={() => {
              if (secondsLeft === 0) setSecondsLeft(duration)
              setJustFinished(false)
              setIsRunning(true)
            }}
            className="min-w-32 bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
          >
            <Play className="size-5" aria-hidden="true" />
            {secondsLeft === 0 ? "Restart" : "Start"}
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={() => setIsRunning(false)}
            className="min-w-32 bg-navy font-semibold text-navy-foreground hover:bg-navy/90"
          >
            <Pause className="size-5" aria-hidden="true" />
            Pause
          </Button>
        )}
        <Button type="button" size="lg" variant="outline" onClick={reset} className="border-border">
          <RotateCcw className="size-5" aria-hidden="true" />
          Reset
        </Button>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  small,
}: {
  icon: React.ReactNode
  label: string
  value: string
  small?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 shadow-sm">
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "font-bold text-navy",
          small ? "text-base" : "font-mono text-2xl tabular-nums",
        )}
      >
        {value}
      </span>
    </div>
  )
}
