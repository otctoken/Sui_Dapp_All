import { categories, filterApps, validateCatalog, safeHttps } from './catalog.mjs';
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function card(app) {
  const category = categories.find(item => item.id === app.category);
  return `<article class="app-card">
    <div class="card-top"><div class="app-logo"><img src="${escape(app.logo)}" alt="${escape(app.name)} Logo" width="48" height="48" data-fallback="${escape(app.name.charAt(0))}"></div><div class="card-title"><h2>${escape(app.name)}</h2><div class="card-subtitle">Sui · ${escape(category.name)}</div></div></div>
    <p class="card-description">${escape(app.description)}</p>
    <a class="card-link" href="${escape(app.url)}" target="_blank" rel="noopener noreferrer" aria-label="访问 ${escape(app.name)}，在新标签页打开"><span>访问应用</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a>
  </article>`;
}

async function load() {
  $('error-state').hidden = true;
  $('status').hidden = false;
  $('status').textContent = '正在加载应用…';
  $('app-grid').setAttribute('aria-busy', 'true');
  try {
    const readJSON = async path => {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    };
    const [catalog, config] = await Promise.all([readJSON('data/dapps.json'), readJSON('data/site.json')]);
    const apps = filterApps(validateCatalog(catalog));
    for (const key of ['telegram', 'x']) if (!safeHttps(config[key])) throw new Error(`Invalid ${key} link`);
    document.querySelectorAll('[data-social]').forEach(el => { el.href = config[el.dataset.social]; });
    if (/^public\/[a-z0-9_./-]+\.(png|jpe?g|svg|webp|ico)$/i.test(config.logo) && !config.logo.includes('..')) {
      document.querySelector('.brand img').src = config.logo;
      document.querySelector('link[rel="icon"]').href = config.logo;
    }
    if (config.name) { document.title = `${config.name} · Sui 生态导航`; document.querySelector('.brand img').alt = config.name; }
    if (config.description) document.querySelector('meta[name="description"]').content = config.description;
    $('app-grid').innerHTML = apps.map(card).join('');
    $('app-grid').querySelectorAll('img').forEach(img => {
      const fallback = () => { img.parentElement.textContent = img.dataset.fallback; };
      img.addEventListener('error', fallback, { once: true });
      if (img.complete && !img.naturalWidth) fallback();
    });
    $('status').textContent = apps.length ? '' : '暂无应用';
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
