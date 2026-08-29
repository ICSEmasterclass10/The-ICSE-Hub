"use client"

import { useEffect, useRef } from "react"

export function TelegramFeed() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.async = true
    script.setAttribute("data-telegram-post", "ICSEMasterClass10/121")
    script.setAttribute("data-width", "100%")
    containerRef.current?.appendChild(script)
    return () => script.remove()
  }, [])

  return (
    <section className="mx-auto mt-8 max-w-5xl rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="telegram-feed-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 id="telegram-feed-heading" className="font-semibold text-foreground">ICSE community announcements</h2>
          <p className="mt-1 text-sm text-muted-foreground">Latest notes and updates from the ICSE Hub Telegram community.</p>
        </div>
        <a href="https://t.me/ICSEMasterClass10" target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4">Join Telegram</a>
      </div>
      <div ref={containerRef} className="min-h-24" />
    </section>
  )
}
