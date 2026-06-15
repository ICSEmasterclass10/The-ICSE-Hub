// Shared types, constants and helpers for The ICSE Hub

export const GLOBAL_TELEGRAM_LINK = "https://t.me/ICSE_Class10_WPIV"

export const LECTURE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbiAIZ9t6XtTxBq9sYuSoKDwVLsFXLXXLWuH5tS1xqIW2fdVzHxsOZlZgSw1IVczwReCVtb8Eayi-H/pub?output=csv"

// localStorage keys
export const STORAGE_KEYS = {
  profile: "icsehub:profile",
  streak: "icsehub:streak",
  focus: "icsehub:focusStats",
  checklist: "icsehub:dailyChecklist",
  notes: "icsehub:notes",
  trash: "icsehub:trash",
} as const

export type Tab = "focus" | "notes" | "lectures"

export interface UserProfile {
  name: string
}

export interface StreakData {
  count: number
  lastCompletionDate: string // YYYY-MM-DD of the most recent completed session
}

export interface FocusStats {
  totalFocusSeconds: number
  sessionsCompleted: number
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface DailyChecklist {
  date: string // YYYY-MM-DD this list belongs to
  items: ChecklistItem[]
}

export interface Note {
  id: string
  text: string
  history: string[] // previous text states, newest first, max 3
  createdAt: number
  updatedAt: number
}

export interface TrashedNote extends Note {
  deletedAt: number
}

export interface LectureRow {
  chapter: string
  videoTitle: string
  youTubeId: string
  notesTelegramLink: string
}

export const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "revise", label: "Revise 1 chapter", done: false },
  { id: "focus", label: "Complete 1 focus session", done: false },
  { id: "mock", label: "Solve 5 mock questions", done: false },
]

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export type Rank = "Novice" | "Scholar" | "Board Topper"

export function computeRank(totalFocusSeconds: number): Rank {
  const hours = totalFocusSeconds / 3600
  if (hours >= 20) return "Board Topper"
  if (hours >= 5) return "Scholar"
  return "Novice"
}

/**
 * Robust CSV line parser handling quoted fields with embedded commas / quotes.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += char
    }
  }
  // flush trailing field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""))
}

/**
 * Extracts a clean YouTube video id from a raw cell that may contain a full
 * URL or just the id.
 */
export function extractYouTubeId(raw: string): string {
  const value = (raw || "").trim()
  if (!value) return ""
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ]
  for (const p of patterns) {
    const match = value.match(p)
    if (match) return match[1]
  }
  // already an id
  return value
}

/**
 * Maps parsed CSV rows into LectureRow objects. The header row is used to
 * locate columns; falls back to positional mapping if headers are absent.
 */
export function rowsToLectures(rows: string[][]): LectureRow[] {
  if (rows.length === 0) return []

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const findIndex = (...names: string[]) =>
    header.findIndex((h) => names.some((n) => h.includes(n)))

  const chapterIdx = findIndex("chapter")
  const titleIdx = findIndex("videotitle", "title", "video")
  const idIdx = findIndex("youtubeid", "youtube", "video id", "videoid", "id", "link")
  const notesIdx = findIndex("notestelegram", "telegram", "notes")

  const hasHeader = chapterIdx !== -1 || titleIdx !== -1
  const dataRows = hasHeader ? rows.slice(1) : rows

  return dataRows
    .map((cols) => {
      const chapter = (cols[hasHeader && chapterIdx !== -1 ? chapterIdx : 0] || "").trim()
      const videoTitle = (cols[hasHeader && titleIdx !== -1 ? titleIdx : 1] || "").trim()
      const rawId = (cols[hasHeader && idIdx !== -1 ? idIdx : 2] || "").trim()
      const notesTelegramLink = (cols[hasHeader && notesIdx !== -1 ? notesIdx : 3] || "").trim()
      return {
        chapter,
        videoTitle,
        youTubeId: extractYouTubeId(rawId),
        notesTelegramLink,
      }
    })
    .filter((r) => r.chapter && r.videoTitle)
}
