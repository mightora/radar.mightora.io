import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const appUrl = 'https://radar.mightora.io/';
const guideUrl = `${appUrl}guide/`;

async function readJsonLd(page) {
  return page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.map(script => JSON.parse(script.textContent)));
}

test('built app and guide expose distinct canonical and social metadata', async ({ page, request }) => {
  for (const [path, canonical, title] of [
    ['/', appUrl, 'Technology Radar Live Editor | Mightora'],
    ['/guide/', guideUrl, 'User guide | Technology Radar Live Editor | Mightora']
  ]) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S+/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index,follow,max-image-preview:large');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${appUrl}technology-radar-preview.png`);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  }

  const image = await request.get('/technology-radar-preview.png');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
});

test('app H1 remains static when a different radar is loaded', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText('Technology Radar');
  await page.getByLabel('Load example').selectOption({ label: 'Cloud & DevOps Radar' });
  await expect(page.locator('#sourceStatus')).toHaveText(/^\d+ valid technologies$/);
  await expect(heading).toHaveText('Technology Radar');
  await expect(page.locator('#previewTitle')).toHaveText('Cloud & DevOps Radar');
});

test('structured data matches visible guide instructions and FAQ; discovery files ship at root', async ({ page, request }) => {
  await page.goto('/guide/', { waitUntil: 'domcontentloaded' });
  const graph = (await readJsonLd(page)).flatMap(data => data['@graph'] || [data]);
  const howTo = graph.find(item => item['@type'] === 'HowTo');
  const faq = graph.find(item => item['@type'] === 'FAQPage');
  const breadcrumbs = graph.find(item => item['@type'] === 'BreadcrumbList');
  expect(howTo).toBeTruthy();
  expect(faq).toBeTruthy();
  expect(breadcrumbs).toBeTruthy();

  const visibleSteps = await page.locator('#quick-start > ol > li').allTextContents();
  expect(howTo.step.map(step => step.text)).toEqual(visibleSteps.map(text => text.trim()));
  const visibleFaq = await page.locator('#faq > h3').evaluateAll(questions => questions.map(question => ({
    name: question.textContent.trim(),
    text: question.nextElementSibling.textContent.trim()
  })));
  expect(faq.mainEntity.map(question => ({ name: question.name, text: question.acceptedAnswer.text }))).toEqual(visibleFaq);
  expect(breadcrumbs.itemListElement.map(item => item.item)).toEqual([appUrl, guideUrl]);

  const [robots, sitemap, llms] = await Promise.all(['robots.txt', 'sitemap.xml', 'llms.txt'].map(async file => {
    const response = await request.get(`/${file}`);
    expect(response.ok(), file).toBe(true);
    return response.text();
  }));
  expect(robots).toContain('Allow: /');
  expect(robots).toContain(`Sitemap: ${appUrl}sitemap.xml`);
  expect(sitemap).toContain(`<loc>${appUrl}</loc>`);
  expect(sitemap).toContain(`<loc>${guideUrl}</loc>`);
  expect(llms).toContain(`- User guide: ${guideUrl}`);
  expect(llms).toContain(`- FAQ: ${guideUrl}#faq`);

  for (const file of ['robots.txt', 'sitemap.xml', 'llms.txt', 'technology-radar-preview.png']) {
    await expect(readFile(new URL(`../../dist/${file}`, import.meta.url))).resolves.toBeTruthy();
  }
});