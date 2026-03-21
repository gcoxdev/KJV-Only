import type { ReactNode } from "react";

import { ScrollTextIcon, BookMarkedIcon, ShieldCheckIcon, LanguagesIcon } from "lucide-react";

import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ScriptureReference = {
  reference: string;
  note?: string;
};

type KJVOnlySection = {
  title: string;
  summary: string;
  body: string[];
  references?: ScriptureReference[];
};

type ExternalSource = {
  label: string;
  href: string;
  description: string;
};

type WhyKJVOnlyPageProps = {
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

const CASE_AT_A_GLANCE = [
  "The King James Bible was not thrown together as a novelty. It was produced by a large body of learned men, worked through multiple companies, reviewed in stages, and presented as a careful revision from the original tongues and earlier English Bibles.",
  "Its English is often called old, but many of its older forms are actually precise. The distinction between singular and plural second-person pronouns can preserve meaning that modern English often flattens.",
  "It is understandable that many readers turn to modern translations because older words and forms are no longer commonly taught. But the answer is not necessarily to trade precision for simplification when better tools can help the reader understand what the text is actually saying.",
  "The King James Bible is also unusually transparent. Italic words show where English help was supplied, and forms such as LORD preserve distinctions carried over from the original languages and Old Testament quotations.",
  "The strongest practical argument for KJV-only use is that it gives English-speaking churches a stable, public, memorized, and textually complete Bible rather than a moving target of revised wording, disputed passages, and shifting footnotes.",
];

const KJV_ONLY_SECTIONS: KJVOnlySection[] = [
  {
    title: "1. The King James Bible came through a careful, conservative translation process",
    summary:
      "The 1611 translators presented their work as a translation from the original tongues and a diligent revision of prior English work, not a careless rewrite.",
    body: [
      "The original title page describes the Bible as newly translated out of the original tongues and diligently compared with the former translations. That matters. The KJV was not made in isolation. It stands at the end of the Tyndale-Coverdale-Geneva-Bishops line, but with broad committee review and formal rules guiding the work.",
      "That conservative method is one reason the KJV became the common Bible of English-speaking Protestantism. It was designed to be read in churches, memorized, preached, and used publicly, not merely offered as one private option among many competing editions.",
      "For a KJV-only case, that history matters because the translation was made to preserve continuity, reverence, and public church use. It aimed at stability rather than novelty.",
    ],
  },
  {
    title: "2. The KJV preserves distinctions that modern English often blurs",
    summary:
      "Older forms like thee, thou, ye, and you are not empty archaisms. In many places they preserve grammatical information that matters to interpretation.",
    body: [
      "The best-known example is when singular and plural second-person pronouns are distinguished. In modern English, both collapse into you. In the KJV, a reader can often see immediately whether Christ or the apostles are addressing one person or a group.",
      "That means the KJV can sometimes teach with more precision than smoother modern English. The wording may feel older, but it often carries distinctions the Greek and Hebrew themselves make.",
      "This is not merely stylistic preference. It can affect doctrine, application, and preaching because the reader sees whether a command, warning, or promise is being directed to one person or to many.",
    ],
    references: [
      {
        reference: "JHN.3.7",
        note: "Jesus speaks to Nicodemus personally, yet says, \"Ye must be born again,\" widening the statement beyond one man.",
      },
      {
        reference: "LUK.22.31-32",
        note: "The shift from \"you\" to \"thee\" is visible in the KJV: Satan desired the disciples, but Christ speaks directly to Peter.",
      },
    ],
  },
  {
    title: "3. The KJV shows its work instead of hiding it",
    summary:
      "The King James Bible often exposes interpretive decisions rather than concealing them.",
    body: [
      "Italic words in the KJV mark English words supplied for sense when no exact word stands in that position in the original language. That is a transparent feature, not a weakness. It tells the reader where the translators helped the English sentence read naturally.",
      "Likewise, the printed form LORD helps preserve a distinction tied to the divine name and Old Testament quotation practice. That kind of typographical signaling teaches the attentive reader something about the text itself.",
      "In other words, the KJV does not merely hand the reader a finished paraphrase. It often lets the reader see where translation work is happening.",
    ],
    references: [
      {
        reference: "PSA.110.1",
        note: "The printed distinction between LORD and Lord helps preserve a distinction important to later New Testament use.",
      },
      {
        reference: "ROM.10.13",
        note: "Cross-reading Old and New Testament quotations is helped when the English Bible preserves these distinctions carefully.",
      },
    ],
  },
  {
    title: "4. Modern versions often make the English reader live with textual doubt",
    summary:
      "A central KJV-only argument is not just wording style, but textual stability. Modern critical-text translations often bracket or footnote passages long received in the churches.",
    body: [
      "Many modern versions tell the reader that some of the best-known passages are missing from the earliest manuscripts, or they remove verses from the running text altogether. That pushes uncertainty into public reading, memorization, and preaching.",
      "The KJV-only case argues that an English church should not be trained to treat whole verses, paragraphs, or endings as optional. A Bible for public use should sound settled, not tentative.",
      "Examples often discussed in this connection include Acts 8:37, Matthew 17:21, Mark 16:9-20, and John 7:53-8:11. Even when modern editions print them, they commonly do so inside brackets or under manuscript warnings.",
    ],
    references: [
      {
        reference: "ACT.8.37",
        note: "A commonly cited example of a verse absent from many modern editions.",
      },
      {
        reference: "MAT.17.21",
        note: "Another familiar verse often omitted from the main text in modern versions.",
      },
      {
        reference: "MRK.16.9-20",
        note: "Many modern versions bracket or footnote the longer ending of Mark.",
      },
      {
        reference: "JHN.7.53-8.11",
        note: "The account of the woman taken in adultery is often marked as textually doubtful in modern editions.",
      },
    ],
  },
  {
    title: "5. Important readings are sometimes weakened in modern translations",
    summary:
      "KJV-only advocates also point to places where modern textual decisions or renderings are seen as less explicit, less complete, or less doctrinally useful.",
    body: [
      "The issue is not that every modern version denies Christian doctrine. The issue is that some readings long familiar to English readers become shorter, more ambiguous, or less explicit when translated from a different Greek base text or rendered with a different philosophy.",
      "Common examples include 1 Timothy 3:16, where the KJV reads \"God was manifest in the flesh\" while many modern versions adopt a less explicit wording; Colossians 1:14, where many modern versions omit \"through his blood\"; and Luke 2:33, where wording such as \"his father and mother\" is preferred over the KJV's \"Joseph and his mother.\"",
      "The KJV-only case does not rest on one verse. It argues that the cumulative pattern favors a Bible that reads more fully, more plainly, and more consistently with the received wording English-speaking churches have long known.",
    ],
    references: [
      {
        reference: "1TI.3.16",
        note: "A major example in discussions about Christological clarity.",
      },
      {
        reference: "COL.1.14",
        note: "Frequently cited because of the phrase \"through his blood.\"",
      },
      {
        reference: "LUK.2.33",
        note: "Often discussed because of the wording around Joseph and Mary.",
      },
    ],
  },
  {
    title: "6. Omissions and rewordings can significantly change meaning",
    summary:
      "The issue is not merely that some modern versions sound different. In many places they omit clauses, remove verses, or reword passages in ways KJV-only readers regard as doctrinally or interpretively significant.",
    body: [
      "Some differences are whole-verse omissions. Others are shorter readings that remove phrases long familiar in the KJV. Still others are renderings that shift the force of a passage, blur the subject, or remove language that ties one text more clearly to another.",
      "Examples often cited include Luke 4:4, where \"but by every word of God\" disappears in many modern versions; John 6:47, where \"on me\" is omitted; Acts 2:30, where wording about Christ is shortened; and 1 John 4:3, where the fuller confession about Jesus Christ coming in the flesh is reduced in many editions.",
      "KJV-only advocates argue that when these examples are taken together with disputed passages, weakened blood references, and altered Christological wording, the cumulative effect is substantial. The concern is not simply style. The concern is meaning, emphasis, and doctrinal clarity.",
    ],
    references: [
      {
        reference: "LUK.4.4",
        note: "The KJV retains \"but by every word of God,\" a phrase omitted in many modern editions.",
      },
      {
        reference: "JHN.6.47",
        note: "The KJV reads \"He that believeth on me hath everlasting life,\" while many modern versions shorten the wording.",
      },
      {
        reference: "ACT.2.30",
        note: "The KJV explicitly includes wording about God raising up Christ to sit on David's throne.",
      },
      {
        reference: "1JN.4.3",
        note: "The fuller KJV wording ties the test directly to confessing that Jesus Christ is come in the flesh.",
      },
    ],
  },
  {
    title: "7. The readability objection is real, but it is not a reason to abandon the KJV",
    summary:
      "Many readers prefer modern versions because older English is harder for them. That problem is real, but it can be addressed without surrendering the precision and stability of the KJV.",
    body: [
      "It is easy to understand why many people reach for a more modern translation. Words, sentence forms, and distinctions once more widely understood are no longer commonly taught. In that sense, the English language has not become richer in biblical precision. It has become flatter, less exact, and less trained to hear older distinctions.",
      "That means the difficulty is often not that the KJV is defective, but that the modern reader has gaps. Those gaps can be taught. When older words, archaic verb forms, pronouns, names, places, and references are explained, the KJV becomes far more usable than many suppose.",
      "That is one reason a tool-rich KJV environment is valuable. Instead of replacing the text, it helps the Bible speak for itself. Cross-references, concordance work, word studies, dictionaries, notes, and linked passages can help the reader learn the Bible's own vocabulary and let Scripture interpret Scripture.",
      "So the practical response to KJV difficulty is not necessarily to move to a different translation. It can also be to give the reader better helps and better habits so he can stay with a precise, stable English Bible and grow into it.",
    ],
  },
  {
    title: "8. For English speakers, the KJV remains the strongest common Bible",
    summary:
      "The practical KJV-only case is ecclesiastical as much as textual: one stable Bible for reading, preaching, memorizing, comparing, and public worship.",
    body: [
      "A church benefits when its people can hear the same wording at home, in preaching, in memory work, and in cross-reference study. Constantly shifting versions weaken that shared language.",
      "For English speakers willing to learn its forms, the KJV offers public stability, textual fullness, historical continuity, and precise wording that rewards careful reading. That is why many conclude not merely that it is a good Bible, but that it is the best common Bible for English-speaking believers and churches.",
      "The KJV-only position finally comes down to confidence: confidence that God has preserved his words, and confidence that English-speaking Christians do not need a constantly updated stream of alternatives when they already possess a Bible that has served the church so well.",
    ],
    references: [
      {
        reference: "PSA.12.6-7",
        note: "Frequently cited in discussions of preservation.",
      },
      {
        reference: "MAT.24.35",
        note: "\"Heaven and earth shall pass away, but my words shall not pass away.\"",
      },
      {
        reference: "2TI.2.15",
        note: "A stable, careful Bible is central to rightly dividing the word of truth.",
      },
    ],
  },
];

const EXTERNAL_SOURCES: ExternalSource[] = [
  {
    label: "The Translators to the Reader",
    href: "https://www.bible-researcher.com/kjvpref.html",
    description:
      "The 1611 KJV translators' own preface, useful for their stated view of revision, translation, and the need to make Scripture understood in the vulgar tongue.",
  },
  {
    label: "1611 King James Bible Title Page",
    href: "https://commons.wikimedia.org/wiki/File:King-James-Version-Bible-first-edition-title-page-1611.png",
    description:
      "Primary historical title page showing the wording about translation from the original tongues and diligent comparison with former translations.",
  },
  {
    label: "Richard Bancroft's Translation Rules",
    href: "https://textus-receptus.com/wiki/Richard_Bancroft%2C_The_Rules_to_be_Observed_in_the_Translation_of_the_Bible",
    description:
      "A commonly cited list of rules used to describe the conservative and church-facing translation method behind the KJV project.",
  },
  {
    label: "Archaic Pronoun Paradigms",
    href: "https://alt-usage-english.org/pronoun_paradigms.html",
    description:
      "Useful for showing how thou, thee, ye, and you carried singular and plural distinctions in Early Modern English.",
  },
  {
    label: "Bible Researcher on KJV Style and Italics",
    href: "https://bible-researcher.com/intro.html",
    description:
      "Notes how KJV-style pronouns and italics preserve grammatical distinctions and show supplied English words.",
  },
  {
    label: "King James Bible College: What's Missing?",
    href: "https://kingjamesbiblecollege.org/the-king-james-bible-vs-modern-translations-whats-missing/",
    description:
      "A compiled KJV-only argument focusing on omitted verses, weakened wording, and blood-related phrases in modern versions.",
  },
  {
    label: "Wordproject: Omissions and Contradictions in Bible Translations",
    href: "https://www.wordproject.org/bibles/resources/why_kjv/omissions.htm",
    description:
      "A compact comparison table sampling omissions and wording changes across several modern versions against the KJV.",
  },
];

function ReferenceList({
  references,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: {
  references: ScriptureReference[];
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-y-3 pt-1">
      {references.map((item) => (
        <div
          key={item.reference}
          className="inline-flex max-w-full flex-row flex-wrap items-baseline gap-x-2 gap-y-1"
        >
          <ConcordanceReferencePopover
            reference={item.reference}
            highlightWord=""
            renderPreview={renderPreview}
            onOpenReference={onOpenReference}
            onCloseSidebar={onCloseSidebar}
          />
          {item.note ? (
            <p className="max-w-xl text-xs leading-5 text-muted-foreground">
              {item.note}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function WhyKJVOnlyPage({
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: WhyKJVOnlyPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ScrollTextIcon className="size-4 text-muted-foreground" />
            Why KJV Only?
          </CardTitle>
          <CardDescription>
            A concise case for why the King James Bible remains the best common
            English Bible for doctrine, preaching, memorization, and public use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            The KJV-only position is not merely a preference for older wording.
            It is an argument about textual stability, public church use,
            doctrinal clarity, and the long-term value of one settled Bible for
            English-speaking believers.
          </p>
          <div className="grid gap-3 pt-1 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <BookMarkedIcon className="size-3.5" />
                Stability
              </p>
              <p className="mt-2 text-sm leading-6">
                One stable Bible for reading, preaching, memorizing, and public use.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <LanguagesIcon className="size-3.5" />
                Precision
              </p>
              <p className="mt-2 text-sm leading-6">
                Older English forms often preserve distinctions modern English flattens.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <ShieldCheckIcon className="size-3.5" />
                Confidence
              </p>
              <p className="mt-2 text-sm leading-6">
                A complete and publicly trusted English Bible instead of a moving target of revisions and doubt.
              </p>
            </div>
          </div>
          <div className="space-y-2 pt-1">
            {CASE_AT_A_GLANCE.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {KJV_ONLY_SECTIONS.map((section) => (
          <Card key={section.title} className="border-border/70 bg-card/70 shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle className="text-base sm:text-lg">{section.title}</CardTitle>
              <CardDescription>{section.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={`${section.title}-${paragraph.slice(0, 40)}`}>
                  {paragraph}
                </p>
              ))}
              {section.references?.length ? (
                <ReferenceList
                  references={section.references}
                  renderPreview={renderPreview}
                  onOpenReference={onOpenReference}
                  onCloseSidebar={onCloseSidebar}
                />
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-base sm:text-lg">Historical and Comparative Source Notes</CardTitle>
          <CardDescription>
            These are useful source trails for the historical background,
            translation process, pronoun distinctions, and manuscript examples
            often discussed in the KJV-only case.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {EXTERNAL_SOURCES.map((source) => (
            <div
              key={source.href}
              className="rounded-xl border border-border/70 bg-background/70 p-3"
            >
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-foreground underline underline-offset-4"
              >
                {source.label}
              </a>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {source.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
