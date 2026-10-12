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
    if (!safeHttps(app.url)) throw new Error(`${app.id}: 请使用有效的 HTTPS 链接`);
    if (typeof app.logo !== 'string' || !(safeHttps(app.logo) || /^public\/(?:logos\/)?[a-z0-9_-][a-z0-9_.-]*\.(png|jpe?g|svg|webp|ico)$/i.test(app.logo))) throw new Error(`${app.id}: Logo 路径无效`);
    if (!Array.isArray(app.tags) || app.tags.length > 4 || app.tags.some(t => typeof t !== 'string' || t.length > 20)) throw new Error(`${app.id}: 标签无效`);
    if (typeof app.featured !== 'boolean') throw new Error(`${app.id}: featured 必须是 true 或 false`);
  }
  return input;
}
