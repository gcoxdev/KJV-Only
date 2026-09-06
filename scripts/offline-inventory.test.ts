import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { buildOfflineInventory } from './lib/offline-inventory';

it('measures real bytes, aliases the index, and changes versions only when content changes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'kjv-inventory-'));
  try {
    await writeFile(path.join(root, 'index.html'), 'Bible 📖');
    const first = await buildOfflineInventory(root, ['/index.html']);
    expect(first.assets['/'].bytes).toBe(Buffer.byteLength('Bible 📖'));
    expect(first.assets['/'].sha256).toBe(createHash('sha256').update('Bible 📖').digest('hex'));
    expect(await buildOfflineInventory(root, ['/index.html'])).toEqual(first);
    await writeFile(path.join(root, 'index.html'), 'Updated');
    expect((await buildOfflineInventory(root, ['/index.html'])).assets['/'].sha256).not.toBe(first.assets['/'].sha256);
  } finally { await rm(root, { recursive: true }); }
});
