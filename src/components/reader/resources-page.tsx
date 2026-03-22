import { BookMarkedIcon, ExternalLinkIcon, LibraryBigIcon, UsersIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ResourceItem = {
  label: string;
  description: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
};

type ResourceSection = {
  id: string;
  title: string;
  summary: string;
  icon: typeof LibraryBigIcon;
  items: ResourceItem[];
};

const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    id: "kjv-defense",
    title: "KJV Defense Resources",
    summary:
      "These entries cover the main KJV-defense books, ministries, and teaching hubs listed for preservation, manuscript issues, and the traditional texts behind the King James Bible.",
    icon: BookMarkedIcon,
    items: [
      {
        label: "Gail Riplinger and AV Publications",
        description:
          "A very widely known KJV-defense line of material centered on verse comparisons, modern-version critiques, and related lectures and books.",
        links: [
          {
            label: "AV Publications",
            href: "https://avpublications.com/",
          },
        ],
      },
      {
        label: "Samuel C. Gipp",
        description:
          "A strong beginner-friendly entry point with accessible books, conference teaching, and the well-known What's the Big Deal About the King James Bible? material.",
        links: [
          {
            label: "Author Page",
            href: "https://www.amazon.com/Dr-Samuel-C-Gipp/e/B004PUFLEQ",
          },
          {
            label: "SamGipp.com",
            href: "https://samgipp.com/",
          },
          {
            label: "Archive.org Snapshot",
            href: "https://web.archive.org/web/20260309221633/https://samgipp.com/",
          },
        ],
      },
      {
        label: "Peter S. Ruckman",
        description:
          "A stricter and more polarizing but still highly influential stream of KJV-only material, including books, sermons, debates, and study notes.",
        links: [
          {
            label: "Books by Peter S. Ruckman",
            href: "https://kjv1611.org/collections/books-by-peter-s-ruckman",
          },
        ],
      },
      {
        label: "D. A. Waite and the Dean Burgon Society",
        description:
          "A leading scholarly entry point for the Textus Receptus, the Masoretic Text, and formal defenses of the King James Bible.",
        links: [
          {
            label: "Dean Burgon Society",
            href: "https://deanburgonsociety.com/",
          },
        ],
      },
      {
        label: "Edward F. Hills and David Otis Fuller",
        description:
          "Two foundational book-centered starting points for preservation, manuscript issues, and early modern KJV defense writing.",
        links: [
          {
            label: "The King James Version Defended",
            href: "https://ia601502.us.archive.org/0/items/TheKingJamesVersionDefended/TheKingJamesVersionDefended.pdf",
          },
          {
            label: "Which Bible?",
            href: "https://archive.org/details/whichbible0000full",
          },
        ],
      },
      {
        label: "David W. Cloud and Way of Life Literature",
        description:
          "A large article and research library widely used in Independent Fundamental Baptist circles for KJV defense, doctrine, and practical ministry questions.",
        links: [
          {
            label: "Way of Life Literature",
            href: "https://www.wayoflife.org/",
          },
        ],
      },
      {
        label: "King James Bible Research Council",
        description:
          "An active KJV-defense hub with articles, debates, conference material, and ongoing video content.",
        links: [
          {
            label: "Website",
            href: "https://kjbrc.org/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@kjbrc",
          },
        ],
      },
    ],
  },
  {
    id: "grace-right-division",
    title: "Grace and Rightly Divided Resources",
    summary:
      "These entries cover the main grace-oriented and mid-Acts ministries listed for right division, Pauline study, and dispensational teaching.",
    icon: UsersIcon,
    items: [
      {
        label: "Berean Bible Society",
        description:
          "A foundational right-division ministry associated with Cornelius R. Stam and Ricky Kurth. It is one of the main entry points for grace doctrine, articles, conferences, and book-based study.",
        links: [
          {
            label: "Website",
            href: "https://bereanbiblesociety.org/",
          },
        ],
      },
      {
        label: "Grace Bible Church",
        description:
          "A grace-focused teaching ministry built around rightly dividing Scripture, with sermon material and video teaching centered on dispensational study.",
        links: [
          {
            label: "Website",
            href: "https://rightlydividing.org/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@rightlydivide",
          },
        ],
      },
      {
        label: "Grace Ambassadors",
        description:
          "A large modern library of free outlines, PDFs, audio, and video lessons on grace, right division, and Pauline study, especially through Justin Johnson's material.",
        links: [
          {
            label: "Website",
            href: "https://graceambassadors.com/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@GraceAmbassadors",
          },
        ],
      },
      {
        label: "Hope Bible Church",
        description:
          "Pastor David O'Steen's ministry with grace-oriented preaching and mid-Acts, rightly divided Bible teaching.",
        links: [
          {
            label: "Website",
            href: "https://hopebiblechurchga.com/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/channel/UCvuq5zTiQvMfWl9DNci7DPg",
          },
        ],
      },
      {
        label: "Columbus Bible Church",
        description:
          "A church-based grace resource with sermon archives and Bible studies that reflect a mid-Acts, right-division approach to Scripture.",
        links: [
          {
            label: "Website",
            href: "https://www.columbusbiblechurch.org/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@ColumbusBibleChurch",
          },
        ],
      },
      {
        label: "Truth Time Radio",
        description:
          "Grace-oriented radio and video teaching with an emphasis on right division, Bible study, and related discussions.",
        links: [
          {
            label: "Website",
            href: "https://truthtimeradio.com/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@TruthTimeRadio",
          },
        ],
      },
      {
        label: "Robert Breaker",
        description:
          "A widely known grace-oriented teaching ministry with strong emphasis on dispensational study, right division, and Bible teaching through The Cloud Church.",
        links: [
          {
            label: "The Cloud Church",
            href: "https://thecloudchurch.org/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@Robertbreaker3",
          },
        ],
      },
      {
        label: "Sufficient Grace Bible Fellowship",
        description:
          "A grace-focused fellowship with studies on mid-Acts doctrine, right division, and practical Bible teaching.",
        links: [
          {
            label: "Website",
            href: "https://www.sufficientgracebiblefellowship.com/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@sufficientgracebiblefellowship",
          },
        ],
      },
      {
        label: "Les Feldick Ministries",
        description:
          "A well-known verse-by-verse entry point into law-and-grace distinctions, prophecy versus mystery, and dispensational study through long-form teaching.",
        links: [
          {
            label: "Website",
            href: "https://lesfeldick.org/",
          },
          {
            label: "Les Feldick Bible Study",
            href: "https://www.lesfeldickbiblestudy.com/",
          },
        ],
      },
      {
        label: "Enjoy the Bible Ministries",
        description:
          "Keith Blades' ministry, especially useful for structured foundational studies in Bible comprehension and right division.",
        links: [
          {
            label: "Website",
            href: "https://enjoythebible.org/",
          },
        ],
      },
      {
        label: "DivideItRight",
        description:
          "A smaller study site focused on progressive revelation, dispensational distinctions, and grace-oriented Bible study.",
        links: [
          {
            label: "Website",
            href: "https://divideitright.com/",
          },
        ],
      },
    ],
  },
  {
    id: "young-earth-creation",
    title: "Young Earth Creation Resources",
    summary:
      "These entries cover creation ministries and teachers focused on biblical creation, a young earth, and Scripture-first responses to evolutionary and old-earth claims.",
    icon: LibraryBigIcon,
    items: [
      {
        label: "Kent Hovind",
        description:
          "A well-known young-earth creation teacher whose material focuses on creation apologetics, dinosaurs, and public challenges to evolutionary claims.",
        links: [
          {
            label: "Dr. Dino",
            href: "https://www.drdino.com/",
          },
          {
            label: "Rumble",
            href: "https://rumble.com/c/kenthovindofficial",
          },
        ],
      },
      {
        label: "Ken Ham and Answers in Genesis",
        description:
          "One of the largest creation ministries, offering articles, videos, curriculum, and apologetics material centered on Genesis and a young-earth view.",
        links: [
          {
            label: "Answers in Genesis",
            href: "https://answersingenesis.org/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/channel/UCOtgG1fKGni_YHapU4RMMRQ",
          },
        ],
      },
      {
        label: "Institute for Creation Research",
        description:
          "A longstanding creation ministry known for research articles, educational resources, and scientific apologetics from a creationist perspective.",
        links: [
          {
            label: "Website",
            href: "https://www.icr.org/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@icrscience",
          },
        ],
      },
      {
        label: "Creation Ministries International",
        description:
          "A major international creation ministry with a large article library, magazine material, and apologetics resources defending biblical creation.",
        links: [
          {
            label: "Website",
            href: "https://creation.com/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@creationministriesintl",
          },
        ],
      },
      {
        label: "Dr. Jason Lisle and the Biblical Science Institute",
        description:
          "Creation and astronomy material focused on biblical cosmology, scientific apologetics, and a Scripture-first understanding of origins.",
        links: [
          {
            label: "Biblical Science Institute",
            href: "https://biblicalscienceinstitute.com/",
          },
          {
            label: "YouTube",
            href: "https://www.youtube.com/@biblicalscienceinstitute259",
          },
        ],
      },
    ],
  },
];

function ResourceLink({
  item,
  className = "",
}: {
  item: ResourceItem;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border/70 bg-background/60 p-3 ${className}`}>
      <p className="text-sm font-medium leading-6 text-foreground">{item.label}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
      {item.links?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.links.map((link) => (
            <a
              key={`${item.label}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background"
            >
              {link.label}
              <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ResourcesPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <LibraryBigIcon className="size-4 text-muted-foreground" />
            Recommended
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            The list below includes both KJV defense material and
            grace/right-division study material. These resources do not all
            emphasize the same subjects in the same way, so it is best to use
            them with Bible-open, Scripture-first discernment.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {RESOURCE_SECTIONS.map((section) => {
          const Icon = section.icon;

          return (
            <Card
              key={section.id}
              className="border-border/70 bg-card/70 shadow-sm"
            >
              <CardHeader className="gap-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Icon className="size-4 text-muted-foreground" />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.summary}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {section.items.map((item) => (
                  <ResourceLink
                    key={`${section.id}-${item.label}`}
                    item={item}
                    className={
                      (section.id === "kjv-defense" &&
                        item.label === "Gail Riplinger and AV Publications") ||
                      (section.id === "grace-right-division" &&
                        item.label === "Berean Bible Society")
                        ? "mt-3"
                        : ""
                    }
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
