import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCatalog, filterApps, safeHttps } from '../assets/catalog.mjs';
const publishedApps = JSON.parse(await readFile(new URL('../data/dapps.json', import.meta.url), 'utf8'));
// Functional tests use their own fixtures so editors can freely change the live catalog.
const apps = [
  { id: 'navi', name: 'NAVI', category: 'lending', description: '借贷测试样例', url: 'https://example.com/navi', logo: 'public/logos/navi.png', tags: ['借贷'], featured: true, order: 1, addedAt: '2026-01-01' },
  { id: 'cetus', name: 'Cetus', category: 'trading', description: '交易测试样例', url: 'https://example.com/cetus', logo: 'public/logos/cetus.png', tags: ['DEX'], featured: false, order: 2, addedAt: '2026-01-02' },
  { id: 'aftermath', name: 'Aftermath', category: 'staking', description: '质押测试样例', url: 'https://example.com/aftermath', logo: 'public/logos/aftermath.png', tags: ['质押'], featured: false, order: 3, addedAt: '2026-01-03' },
];

test('published catalog validates', () => assert.equal(validateCatalog(publishedApps), publishedApps));
test('rejects duplicate IDs and executable or credentialed URLs', () => {
  assert.throws(() => validateCatalog([...apps, apps[0]]), /重复/);
  for (const url of ['javascript:alert(1)', 'http://example.com', 'https://user:pass@example.com']) {
    assert.equal(safeHttps(url), false);
    assert.throws(() => validateCatalog([{ ...apps[0], url }]), /HTTPS/);
  }
});
test('rejects invalid categories and local logo traversal', () => {
  assert.throws(() => validateCatalog([{ ...apps[0], category: 'unknown' }]), /分类/);
  assert.throws(() => validateCatalog([{ ...apps[0], logo: 'public/logos/../../secret.png' }]), /Logo/);
});
test('search combines case-insensitive terms with category', () => {
  assert.deepEqual(filterApps(apps, { query: ' NAVI 借贷 ', category: 'lending' }).map(a => a.id), ['navi']);
  assert.equal(filterApps(apps, { query: 'NAVI', category: 'trading' }).length, 0);
  assert.equal(filterApps(apps, { query: 'missing-app' }).length, 0);
});
test('favorites only returns saved, existing IDs', () => {
  assert.deepEqual(filterApps(apps, { view: 'favorites', favorites: ['cetus', 'deleted'] }).map(a => a.id), ['cetus']);
  assert.equal(filterApps(apps, { view: 'favorites' }).length, 0);
});
test('sorts without changing the source catalog', () => {
  const before = JSON.stringify(apps);
  assert.equal(filterApps(apps, { sort: 'name' })[0].id, 'aftermath');
  assert.equal(filterApps(apps)[0].id, 'navi');
  const newer = { ...apps[0], id: 'new-app', addedAt: '2027-01-01', order: 100 };
  assert.equal(filterApps([...apps, newer], { sort: 'newest' })[0].id, 'new-app');
  assert.equal(JSON.stringify(apps), before);
});
