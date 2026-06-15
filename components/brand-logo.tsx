import { cn } from "@/lib/utils"

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span className="font-serif text-2xl font-bold tracking-wide">
        <span className="text-sidebar-foreground">The ICSE </span>
        <span className="text-gold">Hub</span>
      </span>
      <span className="mt-1 text-[11px] font-medium tracking-wide text-sidebar-foreground/60">
        by ICSE MasterClass
      </span>
    </div>
  )
}
