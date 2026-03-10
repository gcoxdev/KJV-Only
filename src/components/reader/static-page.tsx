import { getStaticPage } from "@/lib/static-pages";
import type { StaticPageId } from "@/types/reader";

type StaticPageProps = {
  pageId: StaticPageId | null;
};

export function StaticPage({ pageId }: StaticPageProps) {
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
        </div>
      </div>
    </div>
  );
}
