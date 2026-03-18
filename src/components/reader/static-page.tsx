import { getStaticPage } from "@/lib/static-pages";
import { Button } from "@/components/ui/button";
import type { StaticPageId } from "@/types/reader";

type StaticPageProps = {
  pageId: StaticPageId | null;
  canInstallPwa?: boolean;
  isPwaInstalled?: boolean;
  onInstallPwa?: () => void | Promise<void>;
};

export function StaticPage({
  pageId,
  canInstallPwa = false,
  isPwaInstalled = false,
  onInstallPwa,
}: StaticPageProps) {
  const page = getStaticPage(pageId);

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Page not found.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {page.content.eyebrow}
        </p>
        <div className="flex items-center gap-3">
          <page.icon className="size-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {page.content.heading}
          </h1>
        </div>
        <div className="flex flex-col gap-4 text-sm leading-7 text-muted-foreground">
          {page.content.paragraphs.map((paragraph, index) => (
            <p key={`${page.id}-paragraph-${index}`}>{paragraph}</p>
          ))}
          {page.id === "download" ? (
            <div className="rounded-xl border border-border/70 bg-card/70 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium leading-6 text-foreground">
                  Install the app on this device
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Use the browser install prompt to add the app for quicker
                  offline access and a more native experience.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    type="button"
                    disabled={!canInstallPwa || isPwaInstalled}
                    onClick={() => {
                      void onInstallPwa?.();
                    }}
                  >
                    Install App
                  </Button>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {isPwaInstalled
                      ? "Already installed on this device."
                      : canInstallPwa
                        ? "Install is available in this browser."
                        : "This browser has not exposed an install prompt for this session. On Android or Brave, use the browser menu and choose Install app or Add to Home screen."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {page.content.links ? (
            <div className="flex flex-col gap-3 pt-2">
              {page.content.links.map((link) => (
                <div
                  key={`${page.id}-${link.href ?? link.label}`}
                  className="rounded-lg border border-border/70 bg-card/70 p-3"
                >
                  {link.href ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-foreground underline underline-offset-4"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {link.label}
                    </p>
                  )}
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
