import { DownloadPage } from "@/components/reader/download-page";
import { HelpPage } from "@/components/reader/help-page";
import { HowToGetSavedPage } from "@/components/reader/how-to-get-saved-page";
import { ResourcesPage } from "@/components/reader/resources-page";
import { WelcomeHomePage } from "@/components/reader/welcome-home-page";
import { WhyKJVOnlyPage } from "@/components/reader/why-kjv-only-page";
import { getStaticPage } from "@/lib/static-pages";
import type { Book } from "@/types/bible";
import type { StaticPageId } from "@/types/reader";
import type { ReactNode } from "react";

type StaticPageProps = {
  books: Book[];
  pageId: StaticPageId | null;
  canInstallPwa?: boolean;
  isPwaInstalled?: boolean;
  onInstallPwa?: () => void | Promise<void>;
  renderPreview?: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference?: (reference: string) => void;
  onCloseSidebar?: () => void;
  onStartTour?: () => void;
  onOpenSearch?: () => void;
  onOpenPage?: (pageId: StaticPageId) => void;
  showWelcomeHomeAtStartup?: boolean;
  onShowWelcomeHomeAtStartupChange?: (checked: boolean) => void;
};

export function StaticPage({
  books,
  pageId,
  canInstallPwa = false,
  isPwaInstalled = false,
  onInstallPwa,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
  onStartTour,
  onOpenSearch,
  onOpenPage,
  showWelcomeHomeAtStartup = true,
  onShowWelcomeHomeAtStartupChange,
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
          {page.id !== "saved" &&
          page.id !== "kjv-only" &&
          page.id !== "download" &&
          page.id !== "welcome-home" &&
          page.id !== "help" &&
          page.id !== "resources"
            ? page.content.paragraphs.map((paragraph, index) => (
                <p key={`${page.id}-paragraph-${index}`}>{paragraph}</p>
              ))
            : null}
          {page.id === "welcome-home" &&
          onStartTour &&
          onOpenSearch &&
          onOpenPage &&
          renderPreview &&
          onOpenReference &&
          onCloseSidebar &&
          onShowWelcomeHomeAtStartupChange ? (
            <WelcomeHomePage
              books={books}
              onStartTour={onStartTour}
              onOpenSearch={onOpenSearch}
              onOpenPage={onOpenPage}
              renderPreview={renderPreview}
              onOpenReference={onOpenReference}
              onCloseSidebar={onCloseSidebar}
              showAtStartup={showWelcomeHomeAtStartup}
              onShowAtStartupChange={onShowWelcomeHomeAtStartupChange}
            />
          ) : null}
          {page.id === "saved" && renderPreview && onOpenReference && onCloseSidebar ? (
            <HowToGetSavedPage
              renderPreview={renderPreview}
              onOpenReference={onOpenReference}
              onCloseSidebar={onCloseSidebar}
            />
          ) : null}
          {page.id === "kjv-only" &&
          renderPreview &&
          onOpenReference &&
          onCloseSidebar ? (
            <WhyKJVOnlyPage
              renderPreview={renderPreview}
              onOpenReference={onOpenReference}
              onCloseSidebar={onCloseSidebar}
            />
          ) : null}
          {page.id === "download" ? (
            <DownloadPage
              books={books}
              canInstallPwa={canInstallPwa}
              isPwaInstalled={isPwaInstalled}
              onInstallPwa={onInstallPwa}
            />
          ) : null}
          {page.id === "help" ? <HelpPage /> : null}
          {page.id === "resources" ? <ResourcesPage /> : null}
          {page.id !== "saved" &&
          page.id !== "kjv-only" &&
          page.id !== "download" &&
          page.id !== "welcome-home" &&
          page.id !== "help" &&
          page.id !== "resources" &&
          page.content.links ? (
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
