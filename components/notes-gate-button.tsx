"use client"

import { useState } from "react"
import { Download, Send, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GLOBAL_TELEGRAM_LINK } from "@/lib/icse"
import { cn } from "@/lib/utils"

export function NotesGateButton({
  telegramLink,
  label = "Download Board Notes",
  variant = "solid",
  className,
}: {
  /** Specific link for the active row; falls back to the global link when empty. */
  telegramLink?: string | null
  label?: string
  variant?: "solid" | "outline"
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const destination =
    telegramLink && telegramLink.trim() !== "" ? telegramLink.trim() : GLOBAL_TELEGRAM_LINK

  function handleUnlock() {
    window.open(destination, "_blank", "noopener,noreferrer")
    setOpen(false)
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        className={cn(
          variant === "solid"
            ? "bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
            : "border border-gold/40 bg-transparent font-medium text-foreground hover:bg-gold/10",
          className,
        )}
      >
        <Download className="size-4" aria-hidden="true" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-navy text-gold">
              <Lock className="size-6" aria-hidden="true" />
            </div>
            <DialogTitle className="font-serif text-xl">Unlock Board Notes</DialogTitle>
            <DialogDescription className="text-pretty">
              Join our masterclass Telegram community to unlock downloadable PDFs and solved
              mock questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col sm:gap-2">
            <Button
              type="button"
              onClick={handleUnlock}
              className="w-full bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
            >
              <Send className="size-4" aria-hidden="true" />
              Join Telegram &amp; Unlock
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full"
            >
              Maybe later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
