import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('projects filter and case studies expose architecture and benchmark data', async ({ page }) => {
  await page.goto('/');
  await page.locator('#work').getByRole('button', { name: 'Data Engineering', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Modern Data Platform & Lakehouse', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ministry of Finance Intelligent RAG', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'All work' }).click();
  await page.getByRole('link', { name: /Ministry of Finance Intelligent RAG/ }).click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await expect(page.getByRole('heading', { name: 'Ingest & OCR', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Set B · n=22' }).click();
  await expect(page.getByText('87.1%', { exact: true })).toBeVisible();
});

test('command palette surfaces evidence and theme persists after reload', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Command palette' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('searchbox').fill('Kubernetes');
  await dialog.getByRole('link', { name: /Kubernetes/ }).click();
  await expect(page.getByRole('heading', { name: 'Kubernetes', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Intelligent Customer Support Chatbot', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('lab builds a grounded response and contact prepares a draft', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'How do I read a scanned PDF?' }).click();
  await page.getByRole('button', { name: 'Assemble answer' }).click();
  await expect(page.getByRole('heading', { name: 'Grounded response' })).toBeVisible();
  await page.getByRole('button', { name: 'Ask my portfolio' }).click();
  await page.getByRole('button', { name: 'Has he worked with Kubernetes?' }).click();
  await expect(page.locator('.lab-output').getByRole('link', { name: 'Intelligent Customer Support Chatbot' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Sam Test');
  await page.getByRole('textbox', { name: 'Email' }).fill('sam@example.com');
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('I would like to discuss a collaboration.');
  await page.getByRole('button', { name: 'Prepare message' }).click();
  await expect(page.getByRole('textbox', { name: 'Message draft' })).toHaveValue(/discuss a collaboration/);
});

test('several pages render, viewport fits and homepage passes automated accessibility checks', async ({ page, request }) => {
  await page.goto('/');
  const response = await request.get('/resume.pdf');
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await request.get('/sitemap.xml')).ok()).toBeTruthy();
  expect((await request.get('/notes/retrieval-misses/')).ok()).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
