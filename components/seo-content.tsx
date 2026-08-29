import Link from "next/link"
import { RESOURCE_LINKS, SEO_LECTURES, createVideoObjectJsonLd } from "@/lib/seo-content"

export function SeoContent() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createVideoObjectJsonLd()) }} />
      <section className="mx-auto mt-10 max-w-5xl border-t border-border pt-8" aria-labelledby="icse-resources-heading">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">ICSE MasterClass</p>
            <h2 id="icse-resources-heading" className="mt-2 font-serif text-2xl font-bold text-navy">Your ICSE Class 10 study command centre</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">The ICSE Hub brings focused study sessions, organised notes, and chapter-wise revision lectures into one calm workspace for ICSE Class 10 students.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SEO_LECTURES.map((lecture) => <span key={lecture.subject} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">{lecture.subject} revision</span>)}
            </div>
          </div>
          <nav aria-label="ICSE Hub resources">
            <h3 className="font-semibold text-foreground">Resources map</h3>
            <ul className="mt-3 grid gap-2">
              {RESOURCE_LINKS.map((resource) => <li key={resource.label}>{resource.href.startsWith("/") ? <Link href={resource.href} className="block rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-secondary"><span className="text-sm font-medium text-navy">{resource.label}</span><span className="block text-xs text-muted-foreground">{resource.description}</span></Link> : <a href={resource.href} target="_blank" rel="noreferrer" className="block rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-secondary"><span className="text-sm font-medium text-navy">{resource.label}</span><span className="block text-xs text-muted-foreground">{resource.description}</span></a>}</li>)}
            </ul>
          </nav>
        </div>
      </section>
    </>
  )
}
