import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePwaLifecycle } from "@/hooks/use-pwa-lifecycle"

type PwaUpdateNoticeProps = {
  onOpenDetails: () => void
}

export function PwaUpdateNotice({ onOpenDetails }: PwaUpdateNoticeProps) {
  const { status, activateUpdate, dismissUpdate } = usePwaLifecycle()

  if (!status.updateAvailable || status.notificationDismissed) {
    return null
  }

  return (
    <section
      aria-label="Application update"
      aria-live="polite"
      className="border-b border-border bg-muted/70 px-3 py-2"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
        <RefreshCwIcon aria-hidden="true" className="text-muted-foreground" />
        <p className="min-w-48 flex-1 text-sm text-foreground">
          <span className="font-medium">A new version is ready.</span>{" "}
          Update when you are ready to reload open KJV Only tabs.
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenDetails}>
          Details
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={dismissUpdate}>
          Later
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={status.phase === "activating"}
          onClick={activateUpdate}
        >
          <RefreshCwIcon data-icon="inline-start" />
          {status.phase === "activating" ? "Updating…" : "Update Now"}
        </Button>
      </div>
    </section>
  )
}
