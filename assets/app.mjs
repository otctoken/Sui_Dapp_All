import { validateCatalog, safeHttps } from './catalog.mjs';
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function card(app) {
  return `<article class="app-card${app.featured ? ' featured' : ''}">
    ${app.featured ? '<div class="featured-label"><span aria-hidden="true">✦</span> chosen <span class="featured-line" aria-hidden="true"></span></div>' : ''}
    <div class="card-top"><div class="app-logo"><img src="${escape(app.logo)}" alt="${escape(app.name)} Logo" width="48" height="48" data-fallback="${escape(app.name.charAt(0))}"></div><div class="card-title"><h2>${escape(app.name)}</h2></div></div>
    <p class="card-description">${escape(app.description)}</p>
    <a class="card-link" href="${escape(app.url)}" target="_blank" rel="noopener noreferrer" aria-label="get ${escape(app.name)}，open"><span>Open the DApp</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a>
  </article>`;
}

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
    if (config.name) { document.title = `${config.name} · Sui Nav`; document.querySelector('.brand img').alt = config.name; }
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
