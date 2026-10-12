import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateCatalog, safeHttps } from '../assets/catalog.mjs';
const publishedApps = JSON.parse(await readFile(new URL('../data/dapps.json', import.meta.url), 'utf8'));
const sample = { id: 'sample', name: 'Sample', description: '示例', url: 'https://example.com/', logo: 'public/logo.png', tags: [], featured: false };

test('published catalog validates', () => assert.equal(validateCatalog(publishedApps), publishedApps));
test('accepts minimal cards and preserves array order regardless of featured', () => {
  const apps = [{ ...sample, id: 'z-first' }, { ...sample, id: 'a-second', featured: true }];
  const before = JSON.stringify(apps);
  assert.deepEqual(validateCatalog(apps).map(app => app.id), ['z-first', 'a-second']);
  assert.equal(JSON.stringify(apps), before);
  assert.deepEqual(validateCatalog([]), []);
});
test('rejects invalid IDs, duplicate IDs and unsafe links', () => {
  assert.throws(() => validateCatalog([{ ...sample, id: 'DappNav' }]), /id/);
  assert.throws(() => validateCatalog([sample, sample]), /重复/);
  for (const url of ['javascript:alert(1)', 'http://example.com', 'https://user:pass@example.com']) {
    assert.equal(safeHttps(url), false);
    assert.throws(() => validateCatalog([{ ...sample, url }]), /HTTPS/);
  }
});
test('accepts public images and rejects traversal paths', () => {
  for (const logo of ['public/logo.png', 'public/logos/sample.svg', 'https://example.com/logo.png']) {
    assert.doesNotThrow(() => validateCatalog([{ ...sample, logo }]));
  }
  for (const logo of ['public/../logo.png', 'public/logos/../../logo.png']) {
    assert.throws(() => validateCatalog([{ ...sample, logo }]), /Logo/);
  }
});
test('featured must be a JSON boolean', () => {
  assert.throws(() => validateCatalog([{ ...sample, featured: 'true' }]), /featured/);
});
