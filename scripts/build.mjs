import './validate.mjs';
import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const source of ['index.html', '.nojekyll', 'assets', 'data', 'public']) await cp(source, `dist/${source}`, { recursive: true });
console.log('Built static site in dist/');
