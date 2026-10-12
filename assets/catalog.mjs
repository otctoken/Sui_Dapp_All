export const categories = [
  { id: 'all', name: '全部应用', icon: 'grid' },
  { id: 'lending', name: '借贷', icon: 'landmark' },
  { id: 'trading', name: '交易', icon: 'arrows' },
  { id: 'staking', name: '质押', icon: 'layers' },
  { id: 'wallet', name: '钱包', icon: 'wallet' },
  { id: 'tools', name: '基础设施', icon: 'blocks' },
  { id: 'navigation', name: '导航', icon: 'grid' },
];

export function safeHttps(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
}

export function validateCatalog(input) {
  if (!Array.isArray(input)) throw new Error('dapps.json 必须是数组');
  const ids = new Set();
  for (const app of input) {
    if (!app || typeof app !== 'object') throw new Error('项目必须是对象');
    if (!/^[a-z0-9-]+$/.test(app.id ?? '') || ids.has(app.id)) throw new Error(`项目 id 无效或重复：${app.id}`);
    ids.add(app.id);
    if (typeof app.name !== 'string' || !app.name.trim() || app.name.length > 80) throw new Error(`${app.id}: 名称无效`);
    if (typeof app.description !== 'string' || !app.description.trim() || app.description.length > 240) throw new Error(`${app.id}: 简介无效`);
    if (!categories.some(c => c.id !== 'all' && c.id === app.category)) throw new Error(`${app.id}: 分类无效`);
    if (!safeHttps(app.url)) throw new Error(`${app.id}: 请使用有效的 HTTPS 链接`);
    if (typeof app.logo !== 'string' || !(safeHttps(app.logo) || /^public\/(?:logos\/)?[a-z0-9_-][a-z0-9_.-]*\.(png|jpe?g|svg|webp|ico)$/i.test(app.logo))) throw new Error(`${app.id}: Logo 路径无效`);
    if (!Array.isArray(app.tags) || app.tags.length > 4 || app.tags.some(t => typeof t !== 'string' || t.length > 20)) throw new Error(`${app.id}: 标签无效`);
    if (typeof app.featured !== 'boolean' || !Number.isFinite(app.order)) throw new Error(`${app.id}: featured 或 order 无效`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(app.addedAt) || !Number.isFinite(Date.parse(app.addedAt))) throw new Error(`${app.id}: addedAt 日期无效`);
  }
  return input;
}

export function filterApps(apps, { category = 'all', query = '', view = 'all', favorites = [], sort = 'recommended' } = {}) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return apps.filter(app => {
    if (category !== 'all' && app.category !== category) return false;
    if (view === 'favorites' && !favorites.includes(app.id)) return false;
    const categoryName = categories.find(c => c.id === app.category)?.name ?? '';
    const text = `${app.name} ${app.description} ${app.tags.join(' ')} ${categoryName}`.toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  }).sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'newest') return b.addedAt.localeCompare(a.addedAt) || a.order - b.order;
    return Number(b.featured) - Number(a.featured) || a.order - b.order || a.name.localeCompare(b.name);
  });
}
