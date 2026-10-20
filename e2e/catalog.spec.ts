import { expect, test } from '@playwright/test';

// Requires a migrated and seeded database (`npm run db:setup`).

test('home page links to the catalogue', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Wholesale Kava/);
  await page.getByRole('link', { name: 'Browse the catalogue' }).click();
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByRole('heading', { name: 'Catalogue.' })).toBeVisible();
});

test('catalogue paginates', async ({ page }) => {
  await page.goto('/catalog');
  const products = page.getByRole('article');
  await expect(products).toHaveCount(12);
  await expect(page.getByText(/page 1 of \d+/)).toBeVisible();

  await page
    .getByRole('navigation', { name: 'Pagination' })
    .getByRole('link', { name: 'Next' })
    .click();
  await expect(page).toHaveURL(/\/catalog\?page=2$/);
  await expect(page.getByText(/page 2 of \d+/)).toBeVisible();
  await expect(products.first()).toBeVisible();
});

test('category tabs filter by product type', async ({ page }) => {
  await page.goto('/catalog');
  await page
    .getByRole('navigation', { name: 'Categories' })
    .getByRole('link', { name: /Shots/ })
    .click();
  await expect(page).toHaveURL(/\/catalog\/shots$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Shots' })).toBeVisible();
  for (const label of await page.getByRole('article').locator('.label-mono').allTextContents()) {
    expect(label).toMatch(/shots/i);
  }
});

test('unknown categories return the not-found page', async ({ page }) => {
  await page.goto('/catalog/not-a-category');
  await expect(page.getByRole('heading', { name: 'We couldn’t find that page.' })).toBeVisible();
});

test('product page shows details and state restrictions', async ({ page }) => {
  await page.goto('/products/donuts-black-shot');
  await expect(page.getByRole('heading', { level: 1, name: 'Donuts Black Shot' })).toBeVisible();
  const availability = page.getByRole('region', { name: 'Availability' });
  await expect(availability).toContainText('21+ only');
  await expect(availability).toContainText('Alabama');
  await expect(page.getByRole('cell', { name: 'DNB-BLABLURAS-C12' })).toBeVisible();
});
