export const isTimelineEncyclopedia = (source: { title: string }) => /encyclop(?:ae|e)dia/i.test(source.title);
