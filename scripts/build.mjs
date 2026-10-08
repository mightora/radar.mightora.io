import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
await cp('public', 'dist/public', { recursive: true });
await cp('guide', 'dist/guide', { recursive: true });
await cp('public/robots.txt', 'dist/robots.txt');
await cp('public/sitemap.xml', 'dist/sitemap.xml');
await cp('public/llms.txt', 'dist/llms.txt');
await cp('public/technology-radar-preview.png', 'dist/technology-radar-preview.png');
