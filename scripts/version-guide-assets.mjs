import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';

// A changed guide must have a new URL, even while Pages caches the old asset.
const directory = new URL('../dist/', import.meta.url);
const guide = await readFile(new URL('guide-data.js', directory));
const version = createHash('sha256').update(guide).digest('hex').slice(0, 16);
for (const name of await readdir(directory)) {
  if (!name.endsWith('.html')) continue;
  const file = new URL(name, directory);
  const source = await readFile(file, 'utf8');
  const updated = source.replace(/src="guide-data\.js(?:\?[^"\s]*)?"/g, `src="guide-data.js?v=${version}"`);
  if (updated !== source) await writeFile(file, updated);
}
