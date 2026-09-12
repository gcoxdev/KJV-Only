type Source = { url: string };
type WebsiteCredit = { label: string; href: string; description: string };

const WEBSITES: Record<string, WebsiteCredit> = {
  "biblegateway.com": { label: "Encyclopedia of the Bible", href: "https://www.biblegateway.com/resources/encyclopedia-of-the-bible/toc", description: "Biblical chronology, people, and book backgrounds." },
  "plato.stanford.edu": { label: "Stanford Encyclopedia of Philosophy", href: "https://plato.stanford.edu/", description: "Philosophers and their historical context." },
  "livius.org": { label: "Livius", href: "https://www.livius.org/", description: "Ancient history, rulers, and translated historical texts." },
  "britishmuseum.org": { label: "British Museum", href: "https://www.britishmuseum.org/", description: "Artifacts and records supporting historical date comparisons." },
  "iranicaonline.org": { label: "Encyclopaedia Iranica", href: "https://www.iranicaonline.org/", description: "Persian rulers and historical background." },
  "oracc.museum.upenn.edu": { label: "ORACC", href: "https://oracc.museum.upenn.edu/", description: "Assyrian inscriptions and historical records." },
  "biblehub.com": { label: "Bible Hub", href: "https://biblehub.com/", description: "Comparison references for KJV Psalm headings." },
  "penelope.uchicago.edu": { label: "LacusCurtius — University of Chicago", href: "https://penelope.uchicago.edu/", description: "Ancient historical texts, including Josephus and Tacitus." },
  "nature.com": { label: "Nature", href: "https://www.nature.com/", description: "Research comparing proposed crucifixion dates." },
};

/** Article metadata stays in the data; the Credits UI lists each website once. */
export function buildTimelineWebsiteCredits(sources: Source[]): WebsiteCredit[] {
  const hosts = new Set(sources.map(source => new URL(source.url).hostname.toLowerCase().replace(/^www\./, "")));
  return [...hosts].map(host => WEBSITES[host] ?? {
    label: host,
    href: `https://${host}/`,
    description: "Historical timeline background and calendar comparisons.",
  }).sort((a, b) => a.label.localeCompare(b.label));
}
