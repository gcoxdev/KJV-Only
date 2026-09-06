import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';

it('the deployed worker sends explicit audio refreshes to the network and never falls back to stale cache', async () => {
  const handlers = new Map<string, (event: { request: Request; respondWith: (response: Promise<Response>) => void }) => void>();
  const fetchMock = vi.fn().mockResolvedValue(new Response('new audio'));
  const open = vi.fn();
  runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    URL, Response, fetch: fetchMock, caches: { open },
    self: { location: { href: 'https://reader.test/sw.js?cacheName=kjv-only-cache-v10&cachePrefix=kjv-only-cache-', origin: 'https://reader.test' }, addEventListener: (name: string, callback: (event: { request: Request; respondWith: (response: Promise<Response>) => void }) => void) => handlers.set(name, callback) },
  });
  let response: Promise<Response> | undefined;
  const request = new Request('https://reader.test/audio/GEN.1.mp3', { cache: 'reload' });
  const event = { request, respondWith: (promise: Promise<Response>) => { response = promise; } };
  handlers.get('fetch')!(event);
  expect(await (await response)!.text()).toBe('new audio');
  expect(fetchMock).toHaveBeenCalledWith(request);
  expect(open).not.toHaveBeenCalled();
  fetchMock.mockRejectedValue(new Error('offline'));
  handlers.get('fetch')!(event);
  await expect(response).rejects.toThrow('offline');
  expect(open).not.toHaveBeenCalled();
});
