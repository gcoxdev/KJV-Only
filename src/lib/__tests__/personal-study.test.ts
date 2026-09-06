import { afterEach, describe, expect, it, vi } from 'vitest';
import { matchesOrganization, organizationError, parseTags } from '@/lib/study-organization';
import { createNotesExportPayload, createBookmarksExportPayload, parseImportedNotesPayloadDetailed, parseImportedBookmarksPayloadDetailed, parseStoredNotesPayload } from '@/lib/reader-transfer';
import { bundleFreshness, describeOfflineBundle, parseOfflineInventory, sha256, loadOfflineInventory, readSavedOfflineInventory } from '@/lib/offline-inventory';
import { downloadOfflineAssetBatch } from '@/lib/offline-downloads';

afterEach(() => vi.unstubAllGlobals());

describe('personal study organization', () => {
  it('keeps folders and tags through export, import, and storage while accepting older notes', () => {
    const note = { id: 'note', title: 'Study', body: 'Text', scope: { type: 'general' as const }, createdAt: 1, updatedAt: 2, folder: 'Sunday study', tags: ['Faith', 'Prayer'] };
    const bookmark = { id: 'bookmark', label: 'Genesis', note: '', type: 'chapter' as const, scope: { type: 'chapter' as const, bookIndex: 0, chapterIndex: 0 }, createdAt: 1, updatedAt: 2, folder: note.folder, tags: note.tags };
    expect(parseImportedNotesPayloadDetailed(JSON.stringify(createNotesExportPayload([note]))).entries).toEqual([note]);
    expect(parseImportedBookmarksPayloadDetailed(JSON.stringify(createBookmarksExportPayload([bookmark]))).entries).toEqual([bookmark]);
    expect(parseStoredNotesPayload(JSON.stringify([note]))).toEqual([note]);
    const legacy = { ...note, folder: undefined, tags: undefined };
    expect(parseImportedNotesPayloadDetailed(JSON.stringify([legacy])).entries).toHaveLength(1);
  });
  it('combines folder and tag filters and distinguishes unfiled and untagged', () => {
    const item = { folder: 'Sunday', tags: ['Faith', 'Prayer'] };
    expect(matchesOrganization(item, 'folder:sunday', 'tag:prayer')).toBe(true);
    expect(matchesOrganization(item, 'folder:sunday', 'tag:hope')).toBe(false);
    expect(matchesOrganization({}, 'unfiled', 'untagged')).toBe(true);
    expect(matchesOrganization(item, 'all', 'untagged')).toBe(false);
    expect(parseTags(' Faith, Prayer, faith, , Hope ')).toEqual(['Faith', 'Prayer', 'Hope']);
    expect(organizationError('', 'a'.repeat(41))).not.toBeNull();
  });
});

describe('offline version verification', () => {
  it('keeps inventory in the offline cache without using personal-data local storage', async () => {
    const inventory = { schemaVersion: 1, assets: { '/data/a.json': { bytes: 2, sha256: 'a'.repeat(64) } } };
    let saved: Response | undefined;
    const localWrite = vi.fn();
    vi.stubGlobal('window', { localStorage: { setItem: localWrite } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(inventory))));
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ put: async (_url: string, response: Response) => { saved = response.clone(); }, match: async () => saved?.clone() }) });
    expect(await loadOfflineInventory()).toEqual(inventory);
    expect(await readSavedOfflineInventory()).toEqual(inventory);
    expect(localWrite).not.toHaveBeenCalled();
  });
  it('requires the map download list to point to inventory assets', () => {
    const asset = { bytes: 2, sha256: 'a'.repeat(64) };
    expect(() => parseOfflineInventory({ schemaVersion: 1, assets: { '/maps/data/map.json': asset }, mapUrls: ['/maps/data/map.json', '/maps/geometry/missing.geojson'] })).toThrow('Invalid map download information');
    expect(parseOfflineInventory({ schemaVersion: 1, assets: { '/maps/data/map.json': asset }, mapUrls: ['/maps/data/map.json'] }).mapUrls).toEqual(['/maps/data/map.json']);
  });
  it('derives bytes and versions from every requested asset, including versioned URLs', async () => {
    const inventory = parseOfflineInventory({ schemaVersion: 1, assets: { '/data/a.json': { bytes: 12, sha256: 'a'.repeat(64) }, '/data/b.json': { bytes: 25, sha256: 'b'.repeat(64) } } });
    const first = await describeOfflineBundle(['/data/a.json?v=1', '/data/b.json'], inventory);
    expect(first?.bytes).toBe(37);
    expect(await describeOfflineBundle(['/data/missing'], inventory)).toBeNull();
    const receipt = { version: first!.version, refreshedAt: 1 };
    expect(bundleFreshness(first!.version, receipt, true, true)).toBe('Up to date');
    expect(bundleFreshness(first!.version, receipt, true, false)).toBe('Matches last known version');
    expect(bundleFreshness(first!.version, receipt, false, true)).toBe('Download incomplete');
    expect(bundleFreshness('b'.repeat(64), receipt, true, true)).toBe('Update available');
    expect(bundleFreshness(first!.version, null, true, true)).toBe('Freshness unknown');
  });
  it('rejects stale or corrupted responses and bypasses cached audio during refresh', async () => {
    const valid = new TextEncoder().encode('good').buffer;
    const inventory = parseOfflineInventory({ schemaVersion: 1, assets: { '/audio/GEN.1.mp3': { bytes: 4, sha256: await sha256(valid) } } });
    const put = vi.fn();
    vi.stubGlobal('window', { location: { origin: 'https://reader.test' } });
    vi.stubGlobal('caches', { open: vi.fn().mockResolvedValue({ keys: async () => [new Request('https://reader.test/audio/GEN.1.mp3')], put }) });
    const fetchMock = vi.fn().mockResolvedValue(new Response('stale'));
    vi.stubGlobal('fetch', fetchMock);
    expect(await downloadOfflineAssetBatch(['/audio/GEN.1.mp3'], { forceRefresh: true, inventory })).toEqual({ failures: ['/audio/GEN.1.mp3'], verified: 0 });
    expect(put).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith('https://reader.test/audio/GEN.1.mp3', { cache: 'reload' });
    fetchMock.mockResolvedValue(new Response('good'));
    expect(await downloadOfflineAssetBatch(['/audio/GEN.1.mp3'], { forceRefresh: true, inventory })).toEqual({ failures: [], verified: 1 });
    expect(put).toHaveBeenCalledOnce();
  });
});
