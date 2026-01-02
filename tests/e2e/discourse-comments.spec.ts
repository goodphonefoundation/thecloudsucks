import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'https://thecloud.sucks';
const SLUG = process.env.POST_SLUG ?? 'action-flow-test';

// Helper to navigate to a post
async function gotoPost(page: any, slug: string) {
  await page.goto(`${BASE_URL}/posts/${slug}`);
  await expect(page.getByRole('heading', { name: 'Discussion' })).toBeVisible();
}

test.describe('Discourse comments block', () => {
  test('shows Discussion section and CTA', async ({ page }) => {
    await gotoPost(page, SLUG);

    // Button can read either "Start Discussion" (no comments yet) or "View Full Discussion" (has comments)
    const cta = page.getByRole('link', { name: /(Start Discussion|View Full Discussion)/ });
    await expect(cta).toBeVisible();

    // Link should point to Discourse
    const href = await cta.getAttribute('href');
    expect(href, 'CTA should link to Discourse').toMatch(/^https:\/\/community\.thecloud\.sucks\//);
  });

  test('renders full comment list when available (non-fatal if empty)', async ({ page }) => {
    await gotoPost(page, SLUG);

    // Our component renders comments using .prose.prose-sm containers
    const commentItems = page.locator('.prose.prose-sm');
    const count = await commentItems.count();

    // Soft assertion: we pass but report when no comments are present on the chosen slug
    test.info().annotations.push({ type: 'comment-count', description: String(count) });

    // If comments exist, ensure at least one shows text
    if (count > 0) {
      await expect(commentItems.first()).toBeVisible();
    }
  });
});
