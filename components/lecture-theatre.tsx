"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Video,
  Play,
  FileText,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { STEIN_HQ_ENDPOINT, stdinToLectures, type LectureRow } from "@/lib/icse"
import { LazyYouTube } from "@/components/lazy-youtube"
import { cn } from "@/lib/utils"

type Status = "loading" | "ready" | "error"

export function LectureTheatre() {
  const [lectures, setLectures] = useState<LectureRow[]>([])
  const [status, setStatus] = useState<Status>("loading")
  const [activeSubject, setActiveSubject] = useState<string>("All")
  const [activeVideo, setActiveVideo] = useState<LectureRow | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Fetch and parse CSV
  useEffect(() => {
    let cancelled = false
    setStatus("loading")

    async function load() {
      try {
        const res = await fetch(STEIN_HQ_ENDPOINT, { cache: "no-store" })
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = await res.json()
        
        // Stein HQ returns an array directly
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format from Stein HQ")
        }
        
        const parsed = stdinToLectures(data)
        if (cancelled) return
        if (parsed.length === 0) throw new Error("No lectures found in storage")

        setLectures(parsed)
        setStatus("ready")
      } catch (error) {
        console.log("[v0] Stein HQ fetch error:", (error as Error).message)
        if (!cancelled) setStatus("error")
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  // Extract unique subjects dynamically
  const subjects = useMemo(() => {
    const seen = new Set<string>()
    const unique: string[] = ["All"]
    for (const l of lectures) {
      if (!seen.has(l.subject)) {
        seen.add(l.subject)
        unique.push(l.subject)
      }
    }
    return unique
  }, [lectures])

  // Filter lectures by active subject
  const filteredLectures = useMemo(() => {
    if (activeSubject === "All") return lectures
    return lectures.filter((l) => l.subject === activeSubject)
  }, [lectures, activeSubject])

  // Extract unique chapters from filtered lectures
  const chapters = useMemo(() => {
    const seen = new Set<string>()
    const unique: string[] = []
    for (const l of filteredLectures) {
      if (!seen.has(l.chapter)) {
        seen.add(l.chapter)
        unique.push(l.chapter)
      }
    }
    return unique
  }, [filteredLectures])

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
    <div className="flex flex-col gap-6">
      {/* Subject Filter Tabs */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Filter by Subject</p>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => {
                setActiveSubject(subject)
                setActiveVideo(null)
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeSubject === subject
                  ? "bg-gold text-gold-foreground"
                  : "border border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters grouped as mobile action cards */}
      <div className="grid gap-3 sm:gap-4">
        {chapters.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No lectures available for this subject.</p>
          </div>
        ) : (
          chapters.map((chapter) => {
            const chapterLectures = filteredLectures.filter((l) => l.chapter === chapter)
            return (
              <div
                key={chapter}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="mb-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                    {chapter}
                  </p>
                </div>

                {/* Chapter lectures as stacked mobile cards */}
                <div className="flex flex-col gap-2">
                  {chapterLectures.map((lecture, idx) => (
                    <div
                      key={`${lecture.youTubeId}-${idx}`}
                      className="flex flex-col gap-2 rounded-lg border border-border/50 bg-secondary/30 p-3"
                    >
                      <h3 className="line-clamp-2 text-sm font-medium text-foreground">
                        {lecture.videoTitle}
                      </h3>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setActiveVideo(lecture)
                            setShowVideoModal(true)
                          }}
                          className="flex-1 bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
                        >
                          <Play className="size-4" aria-hidden="true" />
                          Watch Lecture
                        </Button>

                        <Button
                          type="button"
                          onClick={() => {
                            if (lecture.notesTelegramLink) {
                              window.open(lecture.notesTelegramLink, "_blank")
                            }
                          }}
                          disabled={!lecture.notesTelegramLink}
                          variant={lecture.notesTelegramLink ? "outline" : "outline"}
                          className={cn(
                            "flex-1 border-border text-foreground",
                            lecture.notesTelegramLink
                              ? "hover:bg-secondary"
                              : "opacity-50 cursor-not-allowed",
                          )}
                        >
                          {lecture.notesTelegramLink ? (
                            <>
                              <FileText className="size-4" aria-hidden="true" />
                              View Notes
                            </>
                          ) : (
                            <>
                              <Lock className="size-3.5" aria-hidden="true" />
                              <span className="text-xs">Coming Soon</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Video Modal */}
      {showVideoModal && activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-card shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gold">
                  {activeVideo.chapter}
                </p>
                <h2 className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                  {activeVideo.videoTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="text-2xl text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-navy">
              {activeVideo.youTubeId ? (
                <LazyYouTube videoId={activeVideo.youTubeId} title={activeVideo.videoTitle} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-navy-foreground/60">
                  <Video className="size-10" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Footer with Notes button */}
            {activeVideo.notesTelegramLink && (
              <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
                <Button
                  type="button"
                  onClick={() => {
                    window.open(activeVideo.notesTelegramLink, "_blank")
                    setShowVideoModal(false)
                  }}
                  className="w-full bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  View Notes on Telegram
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
