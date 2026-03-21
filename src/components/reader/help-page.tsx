import { useDeferredValue, useMemo, useState } from "react";
import {
  BadgeHelpIcon,
  BookOpenIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileSearchIcon,
  LayoutPanelTopIcon,
  MessageSquareMoreIcon,
  MonitorSmartphoneIcon,
  SearchIcon,
  Settings2Icon,
  Share2Icon,
  SidebarIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type HelpItem = {
  label: string;
  body: string;
  keywords?: string[];
};

type HelpSection = {
  id: string;
  title: string;
  icon: typeof BadgeHelpIcon;
  summary: string;
  keywords: string[];
  items: HelpItem[];
};

const HELP_SECTIONS: HelpSection[] = [
  {
    id: "overview",
    title: "What This App Is For",
    icon: BookOpenIcon,
    summary:
      "This page is the main reference for using the application efficiently. It explains study tools, panel behavior, search modes, common workflows, and the rest of the current feature set.",
    keywords: ["overview", "purpose", "guide", "reference", "start", "usage"],
    items: [
      {
        label: "What KJV Only is",
        body:
          "KJV Only is a Scripture-first workspace built around the King James Bible. It combines reading, searching, study tools, notes, bookmarks, cross references, dictionaries, genealogy, maps, and audio inside one application.",
        keywords: ["what is this", "what does this app do", "purpose"],
      },
      {
        label: "How to start using the app",
        body:
          "On a fresh open, the app starts with Welcome Home in the first tab and Genesis 1 in the second tab. You can begin reading immediately, open search, or take the guided tour first.",
        keywords: ["start", "getting started", "first open", "welcome"],
      },
      {
        label: "How this help page should be used",
        body:
          "Use the search box to find tasks, features, or workflows. This page should be updated whenever the application changes so it stays trustworthy and current.",
        keywords: ["search help", "documentation", "manual"],
      },
    ],
  },
  {
    id: "common-tasks",
    title: "Common Tasks",
    icon: BadgeHelpIcon,
    summary:
      "This section is meant for quick 'how do I do this?' searches. Each item is brief and action-focused.",
    keywords: ["how to", "common tasks", "quick help", "instructions"],
    items: [
      {
        label: "How to add a new tab",
        body:
          "Use the add-tab button in the tab strip. This creates a new tab with its own panel workspace, separate from the current tab.",
        keywords: ["new tab", "plus button", "add tab", "create tab"],
      },
      {
        label: "How to rename a tab",
        body:
          "Open the active tab's options menu in the tab strip, then choose the relabel action and enter the new title.",
        keywords: ["relabel tab", "rename tab", "tab options"],
      },
      {
        label: "How to split a panel",
        body:
          "Open the panel options menu, then choose Split Left, Right, Up, or Down. This creates a second panel inside the same tab so you can compare content side by side.",
        keywords: ["split panel", "new panel", "side by side"],
      },
      {
        label: "How to move a panel",
        body:
          "Open the panel options menu and use Move Left, Right, Up, or Down. The app swaps the panel state so the content and panel-local behavior move together.",
        keywords: ["move panel", "rearrange panel"],
      },
      {
        label: "How to return a panel to panel home",
        body:
          "Use the panel-home action from the panel header or panel options. If the panel came from a current Bible context, panel home preserves the current testament or book context when appropriate.",
        keywords: ["panel home", "go home", "picker"],
      },
      {
        label: "How to open search",
        body:
          "Use the top-bar search action or the Open Search shortcut from Welcome Home. Search opens inside the current workspace so results can be sent into tabs or panels.",
        keywords: ["open search", "search page"],
      },
      {
        label: "How to enable dark mode",
        body:
          "Open Main Menu, then Settings, then the Visual tab. Turn on the Dark Mode switch there. Light mode is the default unless you explicitly save dark mode.",
        keywords: ["dark mode", "theme", "light mode"],
      },
      {
        label: "How to change the color theme",
        body:
          "Open Main Menu, then Settings, then the Visual tab. Use the Color Theme setting to switch among the available palettes such as Brown, Contrast, Slate, Forest, Navy, and others.",
        keywords: ["theme color", "color theme", "contrast"],
      },
      {
        label: "How to change font size or line spacing",
        body:
          "Open Main Menu, then Settings, then the Visual tab. Use the Font Size controls and the Line Spacing setting to adjust reading comfort.",
        keywords: ["font size", "line spacing", "reader appearance"],
      },
      {
        label: "How to make results open in the same panel",
        body:
          "Choose Targeted Panel in the relevant targeting setting, then mark a panel as the targeted panel from that panel's options. Future opens of that type will reuse that destination.",
        keywords: ["targeted panel", "same panel", "reuse panel"],
      },
      {
        label: "How to install the app",
        body:
          "Open the Download page and use Install App if your browser exposes that option. On some browsers, especially mobile browsers, installation may also be available from the browser menu.",
        keywords: ["install app", "pwa", "add to home screen"],
      },
      {
        label: "How to download content for offline use",
        body:
          "Open the Download page and download the bundle you want, such as Core Bible Data, Maps, Old Testament Audio, or New Testament Audio. Offline use is an explicit download step, not automatic on install.",
        keywords: ["offline", "download bundle", "cache"],
      },
      {
        label: "How to export notes or bookmarks",
        body:
          "Open the main menu and choose Export Notes or Export Bookmarks. A JSON file will be downloaded so you can back up or transfer your data.",
        keywords: ["export notes", "export bookmarks", "backup"],
      },
      {
        label: "How to import notes or bookmarks",
        body:
          "Open the main menu and choose Import Notes or Import Bookmarks, then select the saved JSON file. The app merges imported entries by id and shows an import summary afterward.",
        keywords: ["import notes", "import bookmarks", "restore"],
      },
      {
        label: "How to start the guided tour",
        body:
          "Open Welcome Home and select Take the Tour. The tour explains the main menu, search, sharing, tabs, sidebar, reader panel, panel options, and panel bottom bar.",
        keywords: ["tour", "guided tour", "take the tour"],
      },
    ],
  },
  {
    id: "workspace",
    title: "Tabs, Panels, and Navigation",
    icon: LayoutPanelTopIcon,
    summary:
      "The workspace is built from tabs and panels. Tabs divide larger study sessions, and panels let you compare content side by side inside a tab.",
    keywords: ["tabs", "panels", "layout", "move", "split", "home", "picker", "navigation"],
    items: [
      {
        label: "What tabs are for",
        body:
          "Use tabs to separate larger study sessions. A tab can hold one panel or a full split layout, and each tab keeps its own panel arrangement.",
        keywords: ["tabs", "workspace"],
      },
      {
        label: "What panel home is for",
        body:
          "Panel home is the launch point for what a panel should show next. From panel home you can open the Bible reader, notes, bookmarks, search, tools, or static pages such as Help and Download.",
        keywords: ["panel home", "picker", "launch panel"],
      },
      {
        label: "How panel history works",
        body:
          "Each panel keeps its own back and forward history. That history covers reader navigation and panel-home destinations inside that panel, not the whole tab at once.",
        keywords: ["back", "forward", "history"],
      },
      {
        label: "What the targeted panel is for",
        body:
          "A targeted panel is a reusable destination for references, note links, bookmarks, search results, and word or verse actions. It is useful when you want one panel to act like a dedicated lookup area.",
        keywords: ["targeted panel", "destination panel"],
      },
      {
        label: "How to close a panel",
        body:
          "Use the panel options menu and choose the close action. If the tab has only one panel, the app returns that panel to panel home instead of leaving the tab empty.",
        keywords: ["close panel", "remove panel"],
      },
      {
        label: "How to use fullscreen for a panel",
        body:
          "Use the panel options menu to enter fullscreen when you want one panel to fill the screen temporarily. Exiting fullscreen returns you to the normal layout.",
        keywords: ["fullscreen", "maximize panel"],
      },
    ],
  },
  {
    id: "reader",
    title: "Reader Basics",
    icon: MonitorSmartphoneIcon,
    summary:
      "The reader is where chapter text is displayed and where most direct study actions begin.",
    keywords: ["reader", "chapter", "word", "verse", "selection", "audio", "progress", "bottom bar"],
    items: [
      {
        label: "How to open a book and chapter",
        body:
          "Use the panel home picker or the reader's book and chapter control. Existing reader panels preserve current context better than a brand-new panel does.",
        keywords: ["open chapter", "book picker", "chapter picker"],
      },
      {
        label: "How to study a word",
        body:
          "Click a word in the text. That can update cross references, concordance, Strong's, dictionaries, genealogy, and other tools depending on what data is available for that token.",
        keywords: ["click word", "word study", "strongs", "concordance"],
      },
      {
        label: "How to study a verse",
        body:
          "Click a verse number or verse target to open verse-based context. This is useful for cross references, notes, bookmarks, and verse-linked navigation.",
        keywords: ["click verse", "verse context"],
      },
      {
        label: "How to use highlight mode",
        body:
          "Turn on highlight mode for a panel, then use the verse checkboxes to mark a range. Those selected verses can be bookmarked or cleared and remain readable across themes.",
        keywords: ["highlight mode", "verse checkbox", "select verses"],
      },
      {
        label: "How to use chapter audio",
        body:
          "Use the audio control in the panel bottom bar to open or control chapter audio. Audio is chapter-based and can also be downloaded for offline use from the Download page.",
        keywords: ["audio", "play chapter", "audio player"],
      },
      {
        label: "How to mark a chapter as read",
        body:
          "Use the panel bottom bar to update chapter progress, or open the Reading Progress page to review and manage progress across the whole Bible.",
        keywords: ["mark read", "reading progress", "chapter progress"],
      },
      {
        label: "How to move to the next or previous chapter",
        body:
          "Use the chapter navigation controls in the panel bottom bar. This lets you move through the text without reopening the picker.",
        keywords: ["next chapter", "previous chapter", "chapter navigation"],
      },
    ],
  },
  {
    id: "sidebar",
    title: "Study and Read Mode",
    icon: SidebarIcon,
    summary:
      "The application can emphasize reading or studying, and the sidebar organizes tools, notes, and bookmarks around the current context.",
    keywords: ["sidebar", "study mode", "read mode", "tools", "notes", "bookmarks", "accordion"],
    items: [
      {
        label: "How to switch between read mode and study mode",
        body:
          "Use the read and study mode toggle in the top bar. Read mode keeps attention on the text, while study mode makes the sidebar workspace available.",
        keywords: ["study mode", "read mode", "toggle sidebar"],
      },
      {
        label: "What the sidebar tabs are for",
        body:
          "The sidebar is organized into Tools, Notes, and Bookmarks. Each area follows the current context differently, depending on whether you clicked a word, a verse, or a broader passage.",
        keywords: ["sidebar tabs", "tools tab", "notes tab", "bookmarks tab"],
      },
      {
        label: "How tool accordions behave",
        body:
          "Most study tools use accordion sections. Clicking words or verses in the reader can automatically expand the most relevant section and load a matching entry.",
        keywords: ["accordion", "expand tools", "auto open"],
      },
    ],
  },
  {
    id: "tools",
    title: "Study Tools",
    icon: WrenchIcon,
    summary:
      "The tools workspace is centered on the current word, verse, chapter, or selection. Each tool focuses on a different kind of study help.",
    keywords: [
      "cross refs",
      "concordance",
      "websters",
      "strongs",
      "kjv words phrases",
      "ai dictionary",
      "bible word-book",
      "hitchcocks",
      "genealogy",
      "maps",
    ],
    items: [
      {
        label: "How to use Cross Refs",
        body:
          "Cross Refs are verse-based. Click a verse or a word within a verse and the app can load cross references for that verse so you can follow related passages quickly.",
        keywords: ["cross refs", "cross references"],
      },
      {
        label: "How to use Concordance",
        body:
          "Concordance is best for tracing repeated Bible vocabulary. Clicking a word in the text or selecting a concordance result will show matching references for that term.",
        keywords: ["concordance", "word references"],
      },
      {
        label: "How to use Webster's and Bible Word-Book",
        body:
          "Use these when a word needs historical or older-English clarification. They are especially useful for KJV wording that is less common in modern speech.",
        keywords: ["websters", "bible word-book", "archaic words"],
      },
      {
        label: "How to use Strong's",
        body:
          "Strong's is available when the selected token has Strong's data. Clicking a word with attached Strong's information will load the corresponding entry and references.",
        keywords: ["strongs", "greek", "hebrew"],
      },
      {
        label: "How to use Genealogy",
        body:
          "Genealogy helps track Bible people, aliases, verse references, and family relationships. Clicking a name in the text can load that person into the genealogy tool.",
        keywords: ["genealogy", "family tree", "people"],
      },
      {
        label: "How to use Maps",
        body:
          "Maps provide place and geography context. Open the Maps tool when a place is relevant and use the associated map data to understand locations and travel.",
        keywords: ["maps", "places", "geography"],
      },
    ],
  },
  {
    id: "search",
    title: "Search Page",
    icon: FileSearchIcon,
    summary:
      "The search page supports smart search, contains-any, contains-all, and regular expression search.",
    keywords: ["search", "smart", "contains any", "contains all", "regex", "chips", "results", "book filter"],
    items: [
      {
        label: "How to use Smart search",
        body:
          "Smart search is best for remembered fragments, misspellings, Bible names, and loose phrases. It is the best first choice when you know the idea but not the exact wording.",
        keywords: ["smart search", "fuzzy search"],
      },
      {
        label: "How to use Contains Any and Contains All",
        body:
          "In these modes, type into the chip input to find concordance words, add the chips you want, then run the search. Contains Any finds verses containing any chosen chip. Contains All requires all chosen chips.",
        keywords: ["contains any", "contains all", "chip search"],
      },
      {
        label: "How to use regex search",
        body:
          "Regex search is for precise patterns. Use it when you already know the pattern shape you want and need tighter matching than Smart or chip-based search can provide.",
        keywords: ["regex", "regular expression"],
      },
      {
        label: "Regex learning links",
        body:
          "Learn more: RegexOne and regular-expressions.info open external sites with beginner-friendly regex lessons and reference material.",
        keywords: ["regexone", "regular-expressions.info", "learn regex", "external links"],
      },
      {
        label: "How to limit search to certain books",
        body:
          "Open the search page's book filter and select only the books you want included. This is useful for narrowing searches to a testament, a small group of books, or a single book.",
        keywords: ["book filter", "limit search", "search by book"],
      },
      {
        label: "How search results open",
        body:
          "Search results can open in a new tab, new panel, or targeted panel based on your targeting settings. This lets you control whether results replace the current reading flow or open beside it.",
        keywords: ["search results", "open result target"],
      },
    ],
  },
  {
    id: "notes-bookmarks",
    title: "Notes, Bookmarks, and Internal Links",
    icon: MessageSquareMoreIcon,
    summary:
      "Notes and bookmarks are local-first study aids that can be scoped broadly or tied to a specific context.",
    keywords: ["notes", "bookmarks", "general", "context", "chapter", "verse", "word", "internal links", "import", "export"],
    items: [
      {
        label: "How to create a general note",
        body:
          "Open the Notes area and create a note without tying it to the current passage. General notes stay available regardless of the current Bible context.",
        keywords: ["general note", "new note"],
      },
      {
        label: "How to create a context note",
        body:
          "First select the relevant chapter, verse, or word in the reader, then create the note from the current context. Context notes reappear when that same context is active.",
        keywords: ["context note", "word note", "verse note", "chapter note"],
      },
      {
        label: "How to create a bookmark",
        body:
          "Create bookmarks for chapters, verses, selections, or ranges. Bookmarks are useful for reading plans, sermon studies, repeated references, and places you want to revisit later.",
        keywords: ["new bookmark", "selection bookmark"],
      },
      {
        label: "How internal note links work",
        body:
          "Notes can link back into the Bible using the app's internal link format. Those links can reopen chapters, verses, selections, ranges, and words directly inside the reader.",
        keywords: ["internal links", "note links", "kjv://"],
      },
      {
        label: "How import and export work",
        body:
          "Notes and bookmarks can be exported and imported from the main menu. Imports merge by id, preserve current formats, and show an import summary with imported, replaced, and skipped counts.",
        keywords: ["import", "export", "backup", "transfer"],
      },
      {
        label: "Where notes and bookmarks are stored",
        body:
          "They are stored locally in this browser on this device. They are not automatically synced, so exporting periodically is the safest way to keep a portable backup.",
        keywords: ["local storage", "browser storage", "backup"],
      },
    ],
  },
  {
    id: "settings",
    title: "Settings and Targeting",
    icon: Settings2Icon,
    summary:
      "Settings are divided into visual settings and targeting settings so appearance and opening behavior can be controlled separately.",
    keywords: ["settings", "visual", "targeting", "theme", "dark mode", "font", "line spacing", "reference target"],
    items: [
      {
        label: "How to open Settings",
        body:
          "Open the main menu, then choose Settings. Settings open as a page in their own tab so you can change preferences without interrupting your current reading layout.",
        keywords: ["open settings", "settings page"],
      },
      {
        label: "What the Visual tab controls",
        body:
          "The Visual tab contains dark mode, color theme, font size, line spacing, highlight colors, verse-number visibility, paragraph flow, and tab orientation settings.",
        keywords: ["visual tab", "appearance"],
      },
      {
        label: "What the Targeting tab controls",
        body:
          "The Targeting tab controls where actions open. Word and verse selection, note links, search results, bookmarks, and reference links can each use their own destination behavior.",
        keywords: ["targeting tab", "open target", "new tab", "new panel", "targeted panel"],
      },
      {
        label: "How to change highlight colors",
        body:
          "Open Settings, then Visual, then set Light Highlight Color and Dark Highlight Color separately if needed. This helps keep selections readable in both modes.",
        keywords: ["highlight color", "light highlight", "dark highlight"],
      },
    ],
  },
  {
    id: "sharing-offline",
    title: "Sharing, Install, and Offline Use",
    icon: Share2Icon,
    summary:
      "The app supports shareable layouts, browser installation, and explicit offline bundle downloads.",
    keywords: ["share", "layout", "install", "pwa", "offline", "download", "refresh bundle", "clear bundle"],
    items: [
      {
        label: "How to share a layout",
        body:
          "Use the Share action in the top bar to create a layout link. That link can be reopened later or sent to friends, family, or a congregation so they can open the same arrangement.",
        keywords: ["share layout", "share link"],
      },
      {
        label: "How to install the app",
        body:
          "Use the Download page's Install App action when the browser exposes install support. Browser behavior varies, so some browsers may also require their own menu-based install flow.",
        keywords: ["install app", "pwa", "browser install"],
      },
      {
        label: "How to refresh or clear offline bundles",
        body:
          "On the Download page, Refresh Bundle re-downloads a bundle, Check for Missing Files fills only gaps, and Clear Bundle removes that specific resource group to free storage.",
        keywords: ["refresh bundle", "clear bundle", "missing files"],
      },
      {
        label: "How to tell what is available offline",
        body:
          "The Download page shows bundle status, cached file counts, sizes, and storage estimates so you can see what has been downloaded and what still needs to be cached.",
        keywords: ["offline status", "cached files", "storage"],
      },
    ],
  },
  {
    id: "guided-pages",
    title: "Welcome Home, Tour, and Static Pages",
    icon: DownloadIcon,
    summary:
      "The app includes guided and informational pages alongside the main Bible workspace.",
    keywords: ["welcome home", "tour", "help", "saved", "kjv only", "download", "progress", "settings"],
    items: [
      {
        label: "What Welcome Home is for",
        body:
          "Welcome Home is the default first tab on a fresh open. It gives a short orientation to the app and offers quick actions like Take the Tour, Open Search, Offline Download, and Reading Progress.",
        keywords: ["welcome home", "start page"],
      },
      {
        label: "What the guided tour covers",
        body:
          "The guided tour introduces the main menu, search, sharing, mode toggle, tabs, sidebar, reader panel, panel options, and panel bottom bar.",
        keywords: ["tour", "guided tour"],
      },
      {
        label: "What the static pages are for",
        body:
          "Pages such as Help, How to Get Saved, Why KJV Only?, Download, Settings, and Reading Progress are part of the same panel system and can be opened like other panel views.",
        keywords: ["static pages", "help page", "saved page", "kjv only page"],
      },
    ],
  },
  {
    id: "tips",
    title: "Practical Tips",
    icon: BadgeHelpIcon,
    summary:
      "A few habits make the app easier to use day to day, especially once your workspace becomes more complex.",
    keywords: ["tips", "workflow", "best practices", "common workflows", "helpful"],
    items: [
      {
        label: "Use targeted panels for repeated lookups",
        body:
          "If you want search results, references, or bookmark opens to keep landing in the same place, use the Targeted Panel setting and mark one destination panel first.",
        keywords: ["targeted panel tip"],
      },
      {
        label: "Use tabs for sessions and panels for comparison",
        body:
          "A good working habit is to separate major studies into tabs and use panels inside a tab for side-by-side comparison.",
        keywords: ["workflow tip", "tabs and panels"],
      },
      {
        label: "Export local data periodically",
        body:
          "Because notes and bookmarks are local-first, exporting them periodically is the safest way to keep a portable backup.",
        keywords: ["backup tip", "export"],
      },
      {
        label: "Keep this page current with the app",
        body:
          "When the application changes, this help page should be revised at the same time so it continues to answer real user questions accurately.",
        keywords: ["maintain help", "documentation upkeep"],
      },
    ],
  },
];

function scoreText(text: string, normalizedQuery: string, queryTerms: string[]) {
  const haystack = text.toLowerCase();
  let score = 0;

  if (normalizedQuery && haystack.includes(normalizedQuery)) {
    score += haystack.startsWith(normalizedQuery) ? 12 : 8;
  }

  for (const term of queryTerms) {
    if (!term) {
      continue;
    }
    if (haystack.startsWith(term)) {
      score += 6;
    } else if (haystack.includes(term)) {
      score += 3;
    }
  }

  return score;
}

function scoreHelpItem(
  section: HelpSection,
  item: HelpItem,
  normalizedQuery: string,
  queryTerms: string[],
) {
  if (!normalizedQuery) {
    return 1;
  }

  const labelScore = scoreText(item.label, normalizedQuery, queryTerms) * 4;
  const bodyScore = scoreText(item.body, normalizedQuery, queryTerms);
  const itemKeywordScore = (item.keywords ?? []).reduce(
    (sum, keyword) => sum + scoreText(keyword, normalizedQuery, queryTerms) * 3,
    0,
  );
  const sectionScore =
    scoreText(section.title, normalizedQuery, queryTerms) * 2 +
    section.keywords.reduce(
      (sum, keyword) => sum + scoreText(keyword, normalizedQuery, queryTerms),
      0,
    );

  return labelScore + bodyScore + itemKeywordScore + sectionScore;
}

function getVisibleHelpSections(normalizedQuery: string) {
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  const sections = HELP_SECTIONS.map((section) => {
    const scoredItems = section.items
      .map((item) => ({
        item,
        score: scoreHelpItem(section, item, normalizedQuery, queryTerms),
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || left.item.label.localeCompare(right.item.label));

    return {
      ...section,
      items: normalizedQuery
        ? scoredItems.map(({ item }) => item)
        : section.items,
      score: scoredItems[0]?.score ?? 0,
    };
  });

  if (!normalizedQuery) {
    return sections;
  }

  return sections
    .filter((section) => section.items.length > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
}

export function HelpPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const visibleSections = useMemo(
    () => getVisibleHelpSections(normalizedQuery),
    [normalizedQuery],
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader>
          <CardTitle>Application Help</CardTitle>
          <CardDescription>
            This page is the main reference for using the application efficiently.
            Search by task, feature, workflow, or setting to get quick answers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2 text-sm leading-7 text-muted-foreground">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for a task, feature, setting, or workflow..."
              className="h-10 pl-9 pr-10"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setQuery("")}
              >
                <XIcon />
              </Button>
            ) : null}
          </div>
          <p className="text-xs leading-6 text-muted-foreground">
            Try searches like: how to add a tab, dark mode, targeted panel, export
            notes, install app, split panel, mark chapter read, or regex search.
          </p>
        </CardContent>
      </Card>

      {visibleSections.length > 0 ? (
        <div className="grid gap-4">
          {visibleSections.map((section) => (
            <Card
              key={section.id}
              className="border-border/70 bg-card/70"
              id={`help-${section.id}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="size-4 text-muted-foreground" />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={`${section.id}-${item.label}`}
                    className="rounded-lg border border-border/60 bg-background/60 p-3"
                  >
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                    {item.label === "Regex learning links" ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">Learn more:</span>
                        <a
                          href="https://www.regexone.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
                        >
                          RegexOne
                          <ExternalLinkIcon className="size-3" />
                        </a>
                        <a
                          href="https://www.regular-expressions.info/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
                        >
                          regular-expressions.info
                          <ExternalLinkIcon className="size-3" />
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle>No matching help topics</CardTitle>
            <CardDescription>
              Try a broader task-based query such as <span className="text-foreground">add a tab</span>,
              <span className="text-foreground"> dark mode</span>,
              <span className="text-foreground"> targeted panel</span>, or
              <span className="text-foreground"> export notes</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
