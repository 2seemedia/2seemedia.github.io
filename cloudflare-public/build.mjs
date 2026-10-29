import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'cloudflare-public/dist');
const pages = ['social-media-damascus.html', 'video-production-damascus.html', 'index.html', 'about.html', 'services.html', 'work.html', 'portfolio.html', 'case-study.html', 'contact.html', 'careers.html', '404.html'];
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const page of pages) await cp(path.join(root, page), path.join(out, page));
await cp(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true });
await cp(path.join(root, 'media'), path.join(out, 'media'), { recursive: true });
// Admin pages, data exports and credentials are never part of the public build.
await rm(path.join(out, 'assets/js/dashboard.js'), { force: true });
async function normalize(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) await normalize(file);
    else if (/\.(html|css|js)$/.test(item.name)) {
      const text = await readFile(file, 'utf8');
      await writeFile(file, text.replaceAll('https://2seemedia.github.io/assets/', '/assets/').replaceAll('https://2seemedia.github.io/media/', '/media/'));
    }
  }
}
await normalize(out);
console.log('Public website built; admin routes excluded and media served on the same host.');
