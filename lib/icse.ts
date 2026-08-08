// Shared types, constants and helpers for The ICSE Hub

export const GLOBAL_TELEGRAM_LINK = "https://t.me/ICSE_Class10_WPIV"

export const STEIN_HQ_ENDPOINT = "https://api.steinhq.com/v1/storages/6a5e2eb092b1163e971ede0f/Sheet1"

// localStorage keys
export const STORAGE_KEYS = {
  profile: "icsehub:profile",
  streak: "icsehub:streak",
  focus: "icsehub:focusStats",
  checklist: "icsehub:dailyChecklist",
  notes: "icsehub:notes",
  trash: "icsehub:trash",
  syncCode: "icsehub:syncCode",
  completedLectures: "icsehub:completedLectures",
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
  subject: string
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
 * Bulletproof YouTube ID extraction with URL parameter stripping and validation.
 * Handles:
 *   - Full URLs (youtube.com/watch?v=, youtu.be/, youtube.com/embed/)
 *   - URL parameters (?si=..., &t=..., etc.)
 *   - Bare 11-character IDs
 *   - Invalid entries (returns empty string gracefully)
 */
export function extractYouTubeId(raw: string): string {
  if (!raw || typeof raw !== "string") return ""
  
  let value = raw.trim()
  if (!value) return ""
  
  // Remove query parameters and fragments
  const hashIdx = value.indexOf("#")
  if (hashIdx !== -1) value = value.slice(0, hashIdx)
  
  const qIdx = value.indexOf("?")
  if (qIdx !== -1) value = value.slice(0, qIdx)
  
  // Pattern matching for different URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/v\/)([\w-]{11})/,
  ]
  
  for (const p of patterns) {
    const match = value.match(p)
    if (match) {
      const id = match[1]
      // Validate it's exactly 11 characters and contains only word chars or hyphens
      if (/^[\w-]{11}$/.test(id)) return id
    }
  }
  
  // If it looks like a bare ID (11 chars, word chars + hyphen)
  if (/^[\w-]{11}$/.test(value)) return value
  
  // Invalid entry—return empty string instead of crashing
  return ""
}

/**
 * Converts Stein API (capital-letter keys) to LectureRow format.
 */
export function stdinToLectures(
  data: Array<{ Chapter?: string; VideoTitle?: string; YouTubeID?: string; NotesTelegramLink?: string; Subject?: string }>,
): LectureRow[] {
  return data
    .map((row) => ({
      chapter: (row.Chapter || "").trim(),
      videoTitle: (row.VideoTitle || "").trim(),
      youTubeId: extractYouTubeId(row.YouTubeID || ""),
      notesTelegramLink: (row.NotesTelegramLink || "").trim(),
      subject: (row.Subject || "General").trim(),
    }))
    .filter((r) => r.chapter && r.videoTitle && r.youTubeId)
}

/**
 * Maps parsed CSV rows into LectureRow objects. The header row is used to
 * locate columns; falls back to positional mapping if headers are absent.
 * Includes Subject field for dynamic tab filtering.
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
  const subjectIdx = findIndex("subject")

  const hasHeader = chapterIdx !== -1 || titleIdx !== -1
  const dataRows = hasHeader ? rows.slice(1) : rows

  return dataRows
    .map((cols) => {
      const chapter = (cols[hasHeader && chapterIdx !== -1 ? chapterIdx : 0] || "").trim()
      const videoTitle = (cols[hasHeader && titleIdx !== -1 ? titleIdx : 1] || "").trim()
      const rawId = (cols[hasHeader && idIdx !== -1 ? idIdx : 2] || "").trim()
      const notesTelegramLink = (cols[hasHeader && notesIdx !== -1 ? notesIdx : 3] || "").trim()
      const subject = (cols[hasHeader && subjectIdx !== -1 ? subjectIdx : 4] || "").trim() || "General"
      return {
        chapter,
        videoTitle,
        youTubeId: extractYouTubeId(rawId),
        notesTelegramLink,
        subject,
      }
    })
    .filter((r) => r.chapter && r.videoTitle && r.youTubeId)
}
