"use client"

import { useState } from "react"
import { GraduationCap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function OnboardingModal({
  open,
  onComplete,
}: {
  open: boolean
  onComplete: (name: string) => void
}) {
  const [name, setName] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onComplete(trimmed)
  }

  return (
    <Dialog open={open} disablePointerDismissal>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-navy text-gold">
            <GraduationCap className="size-7" aria-hidden="true" />
          </div>
          <DialogTitle className="font-serif text-2xl">
            Welcome to The ICSE Hub
          </DialogTitle>
          <DialogDescription className="text-pretty">
            Let&apos;s personalize your study space. What should we call you?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="student-name">Your name</Label>
            <Input
              id="student-name"
              autoFocus
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
          >
            Enter The Hub
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
