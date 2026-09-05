// Reviewed discovery links to existing topics, not generated Bible answers.
export const TOPIC_ALIAS_GROUPS = [
  { aliases: ["afraid", "feeling afraid", "i feel afraid", "i am afraid", "i'm afraid"], topics: ["Fear", "Courage", "Trust In God"] },
  { aliases: ["feeling anxious", "i am worried", "i'm worried", "can't stop worrying", "cannot stop worrying"], topics: ["Anxiety", "Worry", "Peace"] },
  { aliases: ["feeling alone", "i feel alone", "i am lonely", "i'm lonely"], topics: ["Loneliness", "Prayer", "Hope"] },
  { aliases: ["dealing with loss", "lost a loved one", "coping with grief"], topics: ["Grief", "Hope"] },
  { aliases: ["how can i forgive", "how to forgive", "struggling to forgive"], topics: ["Forgiveness", "Forgiveness For Others"] },
  { aliases: ["i am angry", "i'm angry", "feeling angry", "losing my temper"], topics: ["Anger", "Controlling Anger", "Patience"] },
  { aliases: ["making a decision", "need direction", "seeking direction", "what should i do"], topics: ["Guidance", "Wisdom", "Prayer"] },
  { aliases: ["feeling hopeless", "losing hope", "i feel hopeless"], topics: ["Hope", "Encouragement"] },
  { aliases: ["resisting temptation", "struggling with temptation"], topics: ["Temptation", "Overcoming Temptation"] },
  { aliases: ["being grateful", "feeling grateful", "giving thanks to god"], topics: ["Thankfulness", "Thanksgiving"] },
] as const;

function normalizeAlias(value: string) {
  return value.toLowerCase().replace(/[’‘]/g, "'").replace(/[?!.,]+$/g, "").trim().replace(/\s+/g, " ");
}

export function topicsForAlias(query: string): readonly string[] {
  const normalized = normalizeAlias(query.trim());
  return TOPIC_ALIAS_GROUPS.find(group =>
    group.aliases.some(alias => alias === normalized),
  )?.topics ?? [];
}
