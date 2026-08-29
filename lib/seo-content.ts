export type SeoLecture = {
  name: string
  description: string
  subject: string
  thumbnailUrl: string
  embedUrl: string
  uploadDate: string
}

export const SEO_LECTURES: SeoLecture[] = [
  {
    name: "ICSE Class 10 Physics Revision Lectures",
    description: "Chapter-wise ICSE Class 10 Physics revision lessons covering Force, Work, Energy and Power.",
    subject: "Physics",
    thumbnailUrl: "https://i.ytimg.com/vi/BZPOSwGtGQM/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/BZPOSwGtGQM",
    uploadDate: "2026-01-01",
  },
  {
    name: "ICSE Class 10 Chemistry Revision Lectures",
    description: "Structured ICSE Class 10 Chemistry revision support with chapter-focused explanations and notes.",
    subject: "Chemistry",
    thumbnailUrl: "https://i.ytimg.com/vi/BZPOSwGtGQM/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/BZPOSwGtGQM",
    uploadDate: "2026-01-01",
  },
  {
    name: "ICSE Class 10 Mathematics Revision Lectures",
    description: "Focused ICSE Class 10 Mathematics lessons designed for efficient board exam revision.",
    subject: "Mathematics",
    thumbnailUrl: "https://i.ytimg.com/vi/BZPOSwGtGQM/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/BZPOSwGtGQM",
    uploadDate: "2026-01-01",
  },
]

export const RESOURCE_LINKS = [
  { label: "Focus Engine", href: "/#focus", description: "Build a consistent study routine with focused sessions." },
  { label: "Notes Vault", href: "/#notes", description: "Organise revision tasks and study notes." },
  { label: "Lecture Theatre", href: "/#lectures", description: "Browse live, chapter-wise ICSE lectures." },
  { label: "ICSE Hub Telegram", href: "https://t.me/ICSE_Class10_WPIV", description: "Join the student community for announcements and notes." },
] as const

export function createVideoObjectJsonLd() {
  return SEO_LECTURES.map((lecture) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: lecture.name,
    description: lecture.description,
    thumbnailUrl: lecture.thumbnailUrl,
    uploadDate: lecture.uploadDate,
    contentUrl: lecture.embedUrl,
    embedUrl: lecture.embedUrl,
    educationalLevel: "ICSE Class 10",
    about: { "@type": "Thing", name: lecture.subject },
    publisher: { "@type": "Organization", name: "The ICSE Hub" },
  }))
}
