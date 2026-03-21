import { CompassIcon, DownloadIcon, HouseIcon, SearchIcon, ChartBarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { StaticPageId } from "@/types/reader";

type WelcomeHomePageProps = {
  onStartTour: () => void;
  onOpenSearch: () => void;
  onOpenPage: (pageId: StaticPageId) => void;
};

export function WelcomeHomePage({
  onStartTour,
  onOpenSearch,
  onOpenPage,
}: WelcomeHomePageProps) {
  return (
    <div className="flex flex-col gap-6" data-tour="welcome-home">
      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HouseIcon className="size-4 text-muted-foreground" />
            Welcome Home
          </CardTitle>
          <CardDescription>
            KJV Only is a Scripture-first workspace for reading, studying,
            searching, note-taking, and cross-referencing the King James Bible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            The goal is to keep the Bible text central while giving you fast
            access to notes, bookmarks, cross references, dictionaries,
            genealogy, maps, offline resources, and flexible multi-panel study
            layouts.
          </p>
          <p>
            A Genesis 1 reading tab is already open beside this page, so you
            can begin immediately, open search, or take the guided tour first.
          </p>
          <div className="grid gap-3 pt-1 sm:grid-cols-2 xl:grid-cols-4">
            <Button type="button" onClick={onStartTour}>
              <CompassIcon />
              Take the Tour
            </Button>
            <Button type="button" variant="outline" onClick={onOpenSearch}>
              <SearchIcon />
              Open Search
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenPage("download")}>
              <DownloadIcon />
              Offline Download
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenPage("progress")}>
              <ChartBarIcon />
              Reading Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>Read</CardTitle>
            <CardDescription>
              Move through books and chapters quickly, keep multiple panels
              open, and organize your own reading layout.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>Study</CardTitle>
            <CardDescription>
              Open notes, bookmarks, maps, Strong&apos;s, genealogy, and other
              study tools beside the text instead of leaving the reader.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="size-4 text-muted-foreground" />
              Search
            </CardTitle>
            <CardDescription>
              Search by phrase, selected words, or regex and send results to a
              new tab, panel, or targeted panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
