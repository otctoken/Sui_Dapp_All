import { categories, filterApps, validateCatalog, safeHttps } from './catalog.mjs';

const paths = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>',
  bookmark: '<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  landmark: '<path d="m3 9 9-6 9 6H3ZM3 21h18M5 12v6m7-6v6m7-6v6"/>',
  arrows: '<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 7V5a2 2 0 0 1 2-2h13v3m3 5h-6v5h6m-3-2.5h.01"/>',
  blocks: '<path d="m3 5 4-2 4 2v5l-4 2-4-2V5Zm10 0 4-2 4 2v5l-4 2-4-2V5ZM8 15l4-2 4 2v5l-4 2-4-2v-5Z"/>',
  send: '<path d="m21 3-7 18-4-8-8-4L21 3ZM10 13 21 3"/>',
  'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  external: '<path d="M14 3h7v7m0-7L11 13M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  'x-social': '<path d="M4 3h5l11 18h-5L4 3ZM20 3 4 21"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3 3 0 0 0-.8-2.3c3-.4 6-1.5 6-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.3S17.7 2.8 15 4a11 11 0 0 0-6 0C6.3 2.8 5.2 3.2 5.2 3.2a4.4 4.4 0 0 0-.1 3.3 4.7 4.7 0 0 0-1.3 3.2c0 4.5 3 5.6 6 6A3 3 0 0 0 9 18v4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  sort: '<path d="M4 6h16M4 12h11M4 18h6"/>',
  shuffle: '<path d="M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c2 0 4-3 6-7m3-5c1-1 2-2 3-2h3m-4-4 4 4-4 4"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm8-2v4m-2-2h4"/>',
};
const icon = name => `<i data-icon="${name}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name] ?? paths.compass}</svg></i>`;
document.querySelectorAll('[data-icon]').forEach(el => { el.outerHTML = icon(el.dataset.icon); });
const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const storageKey = 'dappnav:favorites:v1';
let apps = [], favorites = [], ready = false, toastTimer;
try { const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]'); favorites = Array.isArray(saved) ? saved.filter(id => typeof id === 'string') : []; } catch { /* Storage may be unavailable; navigation still works. */ }
const params = new URLSearchParams(location.search);
const state = { category: categories.some(c => c.id === params.get('category')) ? params.get('category') : 'all', query: params.get('q') ?? '', view: 'all', sort: 'recommended' };
$('search').value = state.query;
$('year').textContent = new Date().getFullYear();

function showToast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2400);
}

function card(app) {
  const saved = favorites.includes(app.id);
  const category = categories.find(c => c.id === app.category);
  return `<article class="app-card ${app.featured ? 'featured' : ''}">
    <div class="card-top"><div class="app-logo"><img src="${escape(app.logo)}" alt="${escape(app.name)} Logo" loading="lazy" width="48" height="48" data-fallback="${escape(app.name.charAt(0))}"></div><div class="card-title"><h3>${escape(app.name)}</h3><div class="card-subtitle"><span class="sui-dot"></span>Sui · ${escape(category.name)}</div></div></div>
    <button class="bookmark-button ${saved ? 'saved' : ''}" data-bookmark="${app.id}" aria-label="${saved ? '取消收藏' : '收藏'} ${escape(app.name)}" aria-pressed="${saved}">${icon('bookmark')}</button>
    <p class="card-description">${escape(app.description)}</p>
    <div class="tags">${app.tags.map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}${app.featured ? `<span class="tag featured-tag">${icon('sparkles')} 编辑精选</span>` : ''}</div>
    <a class="card-link" href="${escape(app.url)}" target="_blank" rel="noopener noreferrer" aria-label="访问 ${escape(app.name)}，在新标签页打开"><span>访问应用</span>${icon('arrow-up-right')}</a>
  </article>`;
}

function render() {
  if (!ready) return;
  const currentFavorites = favorites.filter(id => apps.some(app => app.id === id));
  document.querySelectorAll('.favorite-count').forEach(el => { el.textContent = currentFavorites.length; });
  $('app-count').textContent = apps.length;
  $('category-count').textContent = new Set(apps.map(app => app.category)).size;
  const pool = state.view === 'favorites' ? apps.filter(app => currentFavorites.includes(app.id)) : apps;
  const counts = Object.fromEntries(categories.map(category => [category.id, pool.filter(app => category.id === 'all' || category.id === app.category).length]));
  $('filters').innerHTML = categories.map(category => `<button class="filter-button ${state.category === category.id ? 'active' : ''}" data-category="${category.id}" aria-pressed="${state.category === category.id}">${category.name}<span>${counts[category.id]}</span></button>`).join('');
  $('side-categories').innerHTML = categories.slice(1).map(category => `<button class="nav-item ${state.category === category.id ? 'active' : ''}" data-category="${category.id}" aria-pressed="${state.category === category.id}">${icon(category.icon)}<span>${category.name}</span><span class="category-count">${counts[category.id]}</span></button>`).join('');
  document.querySelectorAll('[data-view]').forEach(el => { const selected = state.view === el.dataset.view; el.classList.toggle('active', selected); selected ? el.setAttribute('aria-current', 'page') : el.removeAttribute('aria-current'); });
  $('section-title').innerHTML = `${state.view === 'favorites' ? '我的收藏' : '发现好应用'} <span class="title-dot">.</span>`;
  const visible = filterApps(apps, { ...state, favorites });
  $('results-count').innerHTML = `共 <strong>${visible.length}</strong> 个${state.view === 'favorites' ? '收藏' : '应用'}${state.query ? ` · 搜索「${escape(state.query)}」` : ''}`;
  $('app-grid').innerHTML = visible.map(card).join('');
  $('app-grid').setAttribute('aria-busy', 'false');
  $('empty-state').hidden = visible.length > 0;
  $('empty-title').textContent = state.view === 'favorites' && !currentFavorites.length ? '为你的探索留个书签' : '没有找到相关应用';
  $('empty-description').textContent = state.view === 'favorites' && !currentFavorites.length ? '点击卡片右上角的收藏图标，常用应用就会出现在这里。收藏保存在当前浏览器。' : '换个关键词，或者看看其他分类。';
  $('app-grid').querySelectorAll('img').forEach(img => img.addEventListener('error', () => { const parent = img.parentElement; parent.textContent = img.dataset.fallback; parent.classList.add('fallback'); }, { once: true }));
  const url = new URL(location.href);
  state.query ? url.searchParams.set('q', state.query) : url.searchParams.delete('q');
  state.category !== 'all' ? url.searchParams.set('category', state.category) : url.searchParams.delete('category');
  history.replaceState(null, '', url);
}

async function load() {
  $('error-state').hidden = true;
  $('empty-state').hidden = true;
  $('results-count').textContent = '正在加载应用…';
  $('app-grid').setAttribute('aria-busy', 'true');
  $('random-app').disabled = true;
  try {
    const readJSON = async path => { const response = await fetch(path, { cache: 'no-cache' }); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); };
    const [catalog, config] = await Promise.all([readJSON('data/dapps.json'), readJSON('data/site.json')]);
    apps = validateCatalog(catalog);
    for (const key of ['telegram', 'x', 'github', 'editUrl']) if (!safeHttps(config[key])) throw new Error(`Invalid ${key} link`);
    document.querySelectorAll('[data-social]').forEach(el => { el.href = config[el.dataset.social]; });
    if (/^public\/[a-z0-9_./-]+\.(png|jpe?g|svg|webp|ico)$/i.test(config.logo) && !config.logo.includes('..')) {
      document.querySelectorAll('.brand img, .hero-art img').forEach(el => { el.src = config.logo; });
      document.querySelector('link[rel="icon"]').href = config.logo;
    }
    if (config.name) document.title = `${config.name} · 你的 Sui 生态导航`;
    if (config.description) document.querySelector('meta[name="description"]').content = config.description;
    ready = true;
    $('random-app').disabled = !apps.length;
    render();
  } catch (error) {
    console.error('DappNav catalog failed:', error);
    $('error-state').hidden = false;
    $('results-count').textContent = '应用加载失败';
    $('app-grid').setAttribute('aria-busy', 'false');
  }
}

function closeMenu() {
  $('sidebar').classList.remove('open'); $('nav-backdrop').hidden = true;
  $('menu-toggle').setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
}

document.addEventListener('click', event => {
  const category = event.target.closest('[data-category]');
  if (category) { state.category = category.dataset.category; render(); closeMenu(); $('explore').scrollIntoView({ block: 'start' }); return; }
  const view = event.target.closest('[data-view]');
  if (view) { state.view = view.dataset.view; state.category = 'all'; state.query = ''; $('search').value = ''; render(); closeMenu(); $('explore').scrollIntoView({ block: 'start' }); return; }
  const bookmark = event.target.closest('[data-bookmark]');
  if (bookmark) {
    const id = bookmark.dataset.bookmark, wasSaved = favorites.includes(id);
    favorites = wasSaved ? favorites.filter(favorite => favorite !== id) : [...favorites, id];
    let persisted = true;
    try { localStorage.setItem(storageKey, JSON.stringify(favorites)); } catch { persisted = false; }
    showToast(wasSaved ? '已取消收藏' : persisted ? '已加入我的收藏' : '已收藏；当前浏览器无法持久保存');
    render(); document.querySelector(`[data-bookmark="${id}"]`)?.focus({ preventScroll: true });
  }
});
$('search').addEventListener('input', event => { state.query = event.target.value; render(); });
$('sort').addEventListener('change', event => { state.sort = event.target.value; render(); });
$('reset-filters').addEventListener('click', () => { state.category = 'all'; state.query = ''; state.view = 'all'; $('search').value = ''; render(); });
$('retry-load').addEventListener('click', load);
$('random-app').addEventListener('click', () => { if (apps.length) window.open(apps[Math.floor(Math.random() * apps.length)].url, '_blank', 'noopener,noreferrer'); });
for (const view of ['grid', 'list']) $('' + view + '-view').addEventListener('click', () => {
  $('app-grid').classList.toggle('list-layout', view === 'list');
  for (const mode of ['grid', 'list']) { $(mode + '-view').classList.toggle('selected', mode === view); $(mode + '-view').setAttribute('aria-pressed', String(mode === view)); }
});
$('menu-toggle').addEventListener('click', () => {
  if ($('sidebar').classList.contains('open')) { closeMenu(); return; }
  $('sidebar').classList.add('open'); $('nav-backdrop').hidden = false;
  $('menu-toggle').setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden';
  $('sidebar').querySelector('a').focus();
});
$('nav-backdrop').addEventListener('click', () => { closeMenu(); $('menu-toggle').focus(); });
document.addEventListener('keydown', event => {
  if (event.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { event.preventDefault(); $('search').focus(); }
  if (event.key === 'Escape' && $('sidebar').classList.contains('open')) { closeMenu(); $('menu-toggle').focus(); }
  if (event.key === 'Tab' && $('sidebar').classList.contains('open')) {
    const focusable = [...$('sidebar').querySelectorAll('a[href],button')];
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener('storage', event => {
  if (event.key !== storageKey) return;
  try { const saved = JSON.parse(event.newValue ?? '[]'); favorites = Array.isArray(saved) ? saved.filter(id => typeof id === 'string') : []; render(); } catch { /* Ignore invalid data from another tab. */ }
});
window.addEventListener('resize', () => { if (innerWidth > 960) closeMenu(); });
load();
