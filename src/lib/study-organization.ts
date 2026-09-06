export type StudyOrganization = { folder?: string; tags?: string[] };

export function parseTags(text: string): string[] {
  const seen = new Set<string>();
  return text.split(',').map((tag) => tag.trim()).filter((tag) => {
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function organizationError(folder: string, tagsText: string): string | null {
  if (folder.trim().length > 80) return 'Folder names can contain up to 80 characters.';
  const tags = parseTags(tagsText);
  if (tags.length > 20) return 'Use up to 20 tags per item.';
  if (tags.some((tag) => tag.length > 40)) return 'Each tag can contain up to 40 characters.';
  return null;
}

export function isValidOrganization(value: Record<string, unknown>): boolean {
  return (value.folder === undefined || (typeof value.folder === 'string' && value.folder.length <= 80)) &&
    (value.tags === undefined || (Array.isArray(value.tags) && value.tags.length <= 20 &&
      value.tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 40)));
}

export function matchesOrganization(item: StudyOrganization, folder: string, tag: string): boolean {
  return (folder === 'all' || (folder === 'unfiled' ? !item.folder?.trim() : item.folder?.toLowerCase() === folder.slice(7))) &&
    (tag === 'all' || (tag === 'untagged' ? !item.tags?.length : item.tags?.some((value) => value.toLowerCase() === tag.slice(4)) === true));
}
