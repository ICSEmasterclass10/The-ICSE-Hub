"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  History,
  RotateCcw,
  Trash,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotesGateButton } from "@/components/notes-gate-button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { STORAGE_KEYS, type Note, type TrashedNote } from "@/lib/icse"
import { cn } from "@/lib/utils"

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function NotesVault() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEYS.notes, [])
  const [trash, setTrash] = useLocalStorage<TrashedNote[]>(STORAGE_KEYS.trash, [])

  const [draft, setDraft] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [openHistory, setOpenHistory] = useState<string | null>(null)
  const [showTrash, setShowTrash] = useState(false)

  function addNote(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const note: Note = {
      id: uid(),
      text,
      history: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes((prev) => [note, ...prev])
    setDraft("")
  }

  function startEdit(note: Note) {
    setEditingId(note.id)
    setEditText(note.text)
  }

  function saveEdit(id: string) {
    const text = editText.trim()
    if (!text) return
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n
        if (text === n.text) return n
        // keep previous 3 states, newest first
        const history = [n.text, ...n.history].slice(0, 3)
        return { ...n, text, history, updatedAt: Date.now() }
      }),
    )
    setEditingId(null)
    setEditText("")
  }

  function deleteNote(id: string) {
    setNotes((prev) => {
      const target = prev.find((n) => n.id === id)
      if (target) {
        setTrash((t) => [{ ...target, deletedAt: Date.now() }, ...t])
      }
      return prev.filter((n) => n.id !== id)
    })
  }

  function restoreNote(id: string) {
    setTrash((prev) => {
      const target = prev.find((n) => n.id === id)
      if (target) {
        const { deletedAt, ...note } = target
        void deletedAt
        setNotes((n) => [note, ...n])
      }
      return prev.filter((n) => n.id !== id)
    })
  }

  function purgeNote(id: string) {
    setTrash((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {/* Add note */}
      <form onSubmit={addNote} className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a new task or revision note..."
          className="h-11"
          maxLength={300}
        />
        <Button
          type="submit"
          disabled={!draft.trim()}
          className="h-11 shrink-0 bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No notes yet. Add your first revision task above.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              {editingId === note.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(note.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    maxLength={300}
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => saveEdit(note.id)}
                    className="bg-gold text-gold-foreground hover:bg-gold/90"
                    aria-label="Save note"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel edit"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1 text-sm leading-relaxed text-foreground">
                      {note.text}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(note)}
                        aria-label="Edit note"
                      >
                        <Pencil className="size-4 text-muted-foreground" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteNote(note.id)}
                        aria-label="Delete note"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <NotesGateButton variant="outline" />
                    {note.history.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setOpenHistory((cur) => (cur === note.id ? null : note.id))
                        }
                        className="text-muted-foreground"
                      >
                        <History className="size-4" aria-hidden="true" />
                        Version History
                        <ChevronDown
                          className={cn(
                            "size-3.5 transition-transform",
                            openHistory === note.id && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </Button>
                    )}
                  </div>

                  {openHistory === note.id && note.history.length > 0 && (
                    <ol className="flex flex-col gap-1.5 rounded-lg bg-secondary/60 p-3">
                      {note.history.map((prev, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span className="shrink-0 font-mono text-[10px] font-semibold text-navy">
                            v{note.history.length - idx}
                          </span>
                          <span className="line-clamp-2">{prev}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Trash bin */}
      <div className="mt-2 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setShowTrash((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          aria-expanded={showTrash}
        >
          <span className="flex items-center gap-2">
            <Trash className="size-4 text-muted-foreground" aria-hidden="true" />
            Trash Bin
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {trash.length}
            </span>
          </span>
          <ChevronDown
            className={cn("size-4 transition-transform", showTrash && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        {showTrash && (
          <div className="border-t border-border p-4">
            {trash.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Trash is empty.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {trash.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 p-3"
                  >
                    <span className="flex-1 truncate text-sm text-muted-foreground line-through">
                      {note.text}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => restoreNote(note.id)}
                        className="text-navy"
                      >
                        <RotateCcw className="size-3.5" aria-hidden="true" />
                        Restore
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => purgeNote(note.id)}
                        aria-label="Permanently delete"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
