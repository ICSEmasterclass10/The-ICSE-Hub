"use client"

import { useState } from "react"
import { Play } from "lucide-react"

export function LazyYouTube({ videoId, title }: { videoId: string; title: string }) {
  const [activated, setActivated] = useState(false)
  const safeId = encodeURIComponent(videoId)

  if (activated) {
    return (
      <iframe
        className="absolute inset-0 size-full"
        src={`https://www.youtube-nocookie.com/embed/${safeId}?autoplay=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return (
    <button type="button" onClick={() => setActivated(true)} aria-label={`Play ${title}`} className="group absolute inset-0 flex items-center justify-center overflow-hidden bg-navy text-navy-foreground">
      <img src={`https://i.ytimg.com/vi/${safeId}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105" />
      <span className="relative flex size-16 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lg transition-transform group-hover:scale-110">
        <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
      </span>
      <span className="sr-only">Load YouTube video</span>
    </button>
  )
}
