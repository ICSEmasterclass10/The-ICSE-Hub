"use client"

import { useEffect, useMemo, useState } from "react"
import { PlayCircle, Loader2, AlertTriangle, RefreshCw, Video } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotesGateButton } from "@/components/notes-gate-button"
import { LECTURE_CSV_URL, parseCsv, rowsToLectures, type LectureRow } from "@/lib/icse"
import { cn } from "@/lib/utils"

type Status = "loading" | "ready" | "error"

export function LectureTheatre() {
  const [lectures, setLectures] = useState<LectureRow[]>([])
  const [status, setStatus] = useState<Status>("loading")
  const [chapter, setChapter] = useState<string>("")
  const [activeVideo, setActiveVideo] = useState<LectureRow | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setStatus("loading")

    async function load() {
      try {
        const res = await fetch(LECTURE_CSV_URL, { cache: "no-store" })
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const text = await res.text()
        const rows = parseCsv(text)
        const parsed = rowsToLectures(rows)
        if (cancelled) return
        if (parsed.length === 0) throw new Error("No lectures found in sheet")

        setLectures(parsed)
        const firstChapter = parsed[0].chapter
        setChapter(firstChapter)
        setActiveVideo(parsed.find((l) => l.chapter === firstChapter) ?? parsed[0])
        setStatus("ready")
      } catch (error) {
        console.log("[v0] Lecture CSV fetch error:", (error as Error).message)
        if (!cancelled) setStatus("error")
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const chapters = useMemo(() => {
    const seen = new Set<string>()
    const unique: string[] = []
    for (const l of lectures) {
      if (!seen.has(l.chapter)) {
        seen.add(l.chapter)
        unique.push(l.chapter)
      }
    }
    return unique
  }, [lectures])

  const chapterVideos = useMemo(
    () => lectures.filter((l) => l.chapter === chapter),
    [lectures, chapter],
  )

  function handleChapterChange(value: string) {
    setChapter(value)
    const first = lectures.find((l) => l.chapter === value)
    if (first) setActiveVideo(first)
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-gold" aria-hidden="true" />
        <p className="text-sm">Loading chapter lectures...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-semibold text-foreground">Couldn&apos;t load lectures</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We were unable to fetch the lecture data. Please check your connection and try
            again.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Chapter selector */}
      <div className="flex flex-col gap-2 sm:max-w-sm">
        <label className="text-sm font-medium text-foreground">Select Chapter</label>
        <Select value={chapter} onValueChange={handleChapterChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Choose a chapter" />
          </SelectTrigger>
          <SelectContent>
            {chapters.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        {/* Video player */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-border bg-navy shadow-sm">
            <div className="relative aspect-video w-full">
              {activeVideo?.youTubeId ? (
                <iframe
                  key={activeVideo.youTubeId}
                  className="absolute inset-0 size-full"
                  src={`https://www.youtube.com/embed/${activeVideo.youTubeId}`}
                  title={activeVideo.videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-navy-foreground/60">
                  <Video className="size-10" aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          {activeVideo && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gold">
                  {activeVideo.chapter}
                </p>
                <h2 className="text-pretty text-base font-semibold text-foreground">
                  {activeVideo.videoTitle}
                </h2>
              </div>
              <NotesGateButton telegramLink={activeVideo.notesTelegramLink} className="shrink-0" />
            </div>
          )}
        </div>

        {/* Video list */}
        <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Lectures
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {chapterVideos.length} videos
              </span>
            </h3>
          </div>
          <ScrollArea className="h-[18rem] lg:h-[26rem]">
            <ul className="flex flex-col p-2">
              {chapterVideos.map((video, idx) => {
                const active = activeVideo?.videoTitle === video.videoTitle &&
                  activeVideo?.youTubeId === video.youTubeId
                return (
                  <li key={`${video.youTubeId}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        active ? "bg-gold/15" : "hover:bg-secondary",
                      )}
                    >
                      <PlayCircle
                        className={cn(
                          "size-5 shrink-0",
                          active ? "text-gold" : "text-muted-foreground",
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "line-clamp-2 text-sm",
                          active ? "font-medium text-foreground" : "text-foreground/80",
                        )}
                      >
                        {video.videoTitle}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
