import { CompassIcon, HouseIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WelcomeHomePageProps = {
  onStartTour: () => void;
};

export function WelcomeHomePage({ onStartTour }: WelcomeHomePageProps) {
  return (
    <div className="flex flex-col gap-6" data-tour="welcome-home">
      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HouseIcon className="size-4 text-muted-foreground" />
            Welcome Home
          </CardTitle>
          <CardDescription>
            KJV Only is built to make reading, studying, searching, note-taking,
            and cross-referencing the King James Bible fast and focused.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            This app brings the Bible reader, study tools, notes, bookmarks,
            maps, genealogy, dictionaries, offline downloads, and multi-panel
            layouts into one workspace.
          </p>
          <p>
            A Genesis 1 reading tab is already open for you beside this page, so
            you can start immediately or take the tour first.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="button" onClick={onStartTour}>
              <CompassIcon />
              Take the Tour
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>Read</CardTitle>
            <CardDescription>
              Move through books and chapters quickly and keep multiple reading
              layouts open at the same time.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>Study</CardTitle>
            <CardDescription>
              Open tools, notes, bookmarks, maps, Strong&apos;s, and other study
              resources beside the text.
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
              Search the Bible by phrase, selected words, or regex and send
              results exactly where you want them.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
