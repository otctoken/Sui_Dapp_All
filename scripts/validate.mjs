import { readFile, access } from 'node:fs/promises';
import { validateCatalog, safeHttps } from '../assets/catalog.mjs';
const apps = validateCatalog(JSON.parse(await readFile('data/dapps.json', 'utf8')));
const config = JSON.parse(await readFile('data/site.json', 'utf8'));
for (const key of ['telegram', 'x']) if (!safeHttps(config[key])) throw new Error(`Invalid ${key}`);
for (const app of apps) if (!safeHttps(app.logo)) await access(app.logo);
await access(config.logo);
console.log(`Validated ${apps.length} applications, local logos and site links.`);
