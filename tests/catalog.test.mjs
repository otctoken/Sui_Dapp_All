import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCatalog, filterApps, safeHttps } from '../assets/catalog.mjs';
const apps = JSON.parse(await readFile(new URL('../data/dapps.json', import.meta.url), 'utf8'));

test('published catalog validates', () => assert.equal(validateCatalog(apps), apps));
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
