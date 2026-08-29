import { Dashboard } from "@/components/dashboard"
import { SeoContent } from "@/components/seo-content"
import { TelegramFeed } from "@/components/telegram-feed"

export default function Page() {
  return (
    <>
      <Dashboard />
      <div className="px-4 pb-12 md:pl-24 md:pr-8">
        <SeoContent />
        <TelegramFeed />
      </div>
    </>
  )
}
