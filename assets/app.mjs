import { validateCatalog, safeHttps } from './catalog.mjs';
const $ = id => document.getElementById(id);
import { card } from './card.mjs';

async function load() {
  $('error-state').hidden = true;
  $('status').hidden = false;
  $('status').textContent = 'loading…';
  $('app-grid').setAttribute('aria-busy', 'true');
  try {
    const readJSON = async path => {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    };
    const [catalog, config] = await Promise.all([readJSON('data/dapps.json'), readJSON('data/site.json')]);
    const apps = validateCatalog(catalog);
    for (const key of ['telegram', 'x']) if (!safeHttps(config[key])) throw new Error(`Invalid ${key} link`);
    document.querySelectorAll('[data-social]').forEach(el => { el.href = config[el.dataset.social]; });
    if (/^public\/[a-z0-9_./-]+\.(png|jpe?g|svg|webp|ico)$/i.test(config.logo) && !config.logo.includes('..')) {
      document.querySelector('.brand img').src = config.logo;
      document.querySelector('link[rel="icon"]').href = config.logo;
    }
    if (config.name) { document.title = config.title || `${config.name} · Sui Nav`; document.querySelector('.brand img').alt = config.name; }
    if (config.description) document.querySelector('meta[name="description"]').content = config.description;
    $('app-grid').innerHTML = apps.map(card).join('');
    $('app-grid').querySelectorAll('img').forEach(img => {
      const fallback = () => { img.parentElement.textContent = img.dataset.fallback; };
      img.addEventListener('error', fallback, { once: true });
      if (img.complete && !img.naturalWidth) fallback();
    });
    $('status').textContent = apps.length ? '' : 'null';
    $('status').hidden = apps.length > 0;
  } catch (error) {
    console.error('DappNav catalog failed:', error);
    $('status').hidden = true;
    $('error-state').hidden = false;
  } finally {
    $('app-grid').setAttribute('aria-busy', 'false');
  }
}
$('retry-load').addEventListener('click', load);
load();
