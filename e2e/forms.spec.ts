import { expect, test } from '@playwright/test';

// Each test gets its own client address so the per-IP rate limits never trip across runs.
// (The app reads the last X-Forwarded-For entry, which the AWS load balancer controls in production.)
test.beforeEach(async ({ page }) => {
  const octet = () => Math.floor(Math.random() * 250) + 1;
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `10.${octet()}.${octet()}.${octet()}` });
});

// Role queries match accessible names exactly: "Email" won't also hit the "Follow Up Call / Email"
// checkbox, and the aria-hidden "*" on required labels is ignored.

test('wholesale application: server validation, then a successful submission', async ({ page }) => {
  await page.goto('/wholesale');
  const textbox = (name: string) => page.getByRole('textbox', { name, exact: true });

  await textbox('Full name').fill('E2E Applicant');
  await textbox('Phone').fill('(407) 555-0199');
  await textbox('Email').fill('e2e.applicant@example.com');
  await textbox('Business name').fill('E2E Kava Bar');
  await textbox('Business address').fill('1 Test Way');
  await textbox('City').fill('Orlando');
  await page.getByRole('combobox', { name: 'State' }).selectOption('FL');
  await textbox('ZIP').fill('32807');
  await page.getByRole('checkbox', { name: /I am 21 or older/ }).check();

  // Checkbox groups have no native "at least one" validation, so the server catches it.
  await page.getByRole('button', { name: 'Submit application' }).click();
  // Filter by text: Next's route announcer is also a role="alert" region.
  await expect(
    page.getByRole('alert').filter({ hasText: 'Please fix the highlighted fields' }),
  ).toBeVisible();
  await expect(page.getByText('Choose at least one business type')).toBeVisible();
  // Values survive the failed submit.
  await expect(textbox('Business name')).toHaveValue('E2E Kava Bar');
  await expect(page.getByRole('combobox', { name: 'State' })).toHaveValue('FL');

  await page.getByRole('checkbox', { name: 'Kava Bar', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Bulk Kava (25kg)' }).check();
  await page.getByRole('radio', { name: 'Weekly' }).check();
  await page.getByRole('button', { name: 'Submit application' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Your application is in' }),
  ).toBeVisible();
});

test('contact form sends a product question', async ({ page }) => {
  await page.goto('/contact?product=kava-joy-750ml');
  const textbox = (name: string) => page.getByRole('textbox', { name, exact: true });

  await expect(page.getByText('Asking about')).toContainText('Kava Joy 750 mL');
  await expect(page.getByRole('combobox', { name: 'Topic' })).toHaveValue('product');
  await textbox('Name').fill('E2E Visitor');
  await textbox('Email').fill('e2e.visitor@example.com');
  await textbox('Message').fill('Do you sell Kava Joy by the case?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Message sent' })).toBeVisible();
});
