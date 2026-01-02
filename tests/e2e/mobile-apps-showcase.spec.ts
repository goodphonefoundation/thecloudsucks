import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

test.describe('Mobile Apps Showcase Block', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${BASE_URL}/apps`);
	});

	test('loads the /apps page successfully', async ({ page }) => {
		await expect(page).toHaveTitle(/Apps/i);
		await expect(page).toHaveURL(/\/apps$/);
	});

	test('displays the mobile apps showcase block', async ({ page }) => {
		// Check for the headline
		const headline = page.getByRole('heading', { name: /Privacy-First Mobile Apps/i });
		await expect(headline).toBeVisible();

		// Check for the description
		await expect(page.getByText(/Discover mobile applications that respect your privacy/i)).toBeVisible();
	});

	test('displays messaging apps in grid layout', async ({ page }) => {
		// Wait for apps to load
		await page.waitForSelector('h3:has-text("Signal")', { timeout: 10000 });

		// Check for specific messaging apps (filtered by category)
		const expectedApps = ['Signal', 'Threema', 'Session', 'Telegram'];

		for (const appName of expectedApps) {
			const appCard = page.locator('h3', { hasText: appName });
			await expect(appCard).toBeVisible({ timeout: 5000 });
		}
	});

	test('shows app cards with proper structure', async ({ page }) => {
		await page.waitForSelector('h3:has-text("Signal")', { timeout: 10000 });

		// Find the first app card
		const firstCard = page.locator('div.border.rounded-lg').first();
		await expect(firstCard).toBeVisible();

		// Check for app name (h3)
		await expect(firstCard.locator('h3')).toBeVisible();

		// Check for description paragraph
		await expect(firstCard.locator('p.text-gray-600')).toBeVisible();

		// Check for at least one link button
		const buttons = firstCard.locator('button, a[role="button"]');
		await expect(buttons.first()).toBeVisible();
	});

	test('displays app badges correctly', async ({ page }) => {
		await page.waitForSelector('h3:has-text("Signal")', { timeout: 10000 });

		// Look for badges in the Signal card (should have Open Source, E2E Encrypted, Tier A)
		const signalCard = page.locator('div.border.rounded-lg:has(h3:has-text("Signal"))');

		// Check for badges
		await expect(signalCard.locator('span:has-text("E2E Encrypted")')).toBeVisible();
		await expect(signalCard.locator('span:has-text("Tier A")')).toBeVisible();
	});

	test('displays platform support badges', async ({ page }) => {
		await page.waitForSelector('h3:has-text("Signal")', { timeout: 10000 });

		const firstCard = page.locator('div.border.rounded-lg').first();

		// Check for platform badges
		const platforms = firstCard.locator('span:has-text("Android"), span:has-text("iOS")');
		await expect(platforms.first()).toBeVisible();
	});

	test('app links open in new tabs', async ({ page }) => {
		await page.waitForSelector('h3:has-text("Signal")', { timeout: 10000 });

		// Find Signal website button
		const signalCard = page.locator('div.border.rounded-lg:has(h3:has-text("Signal"))');
		const websiteButton = signalCard.locator('a:has-text("Website")').first();

		await expect(websiteButton).toBeVisible();
		await expect(websiteButton).toHaveAttribute('target', '_blank');

		// Check the href
		const href = await websiteButton.getAttribute('href');
		expect(href).toBeTruthy();
		expect(href).toContain('signal.org');
	});

	test('grid layout displays multiple columns on desktop', async ({ page }) => {
		// Set viewport to desktop size
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.waitForSelector('h3:has-text("Signal")', { timeout: 10000 });

		// The grid should have the proper classes
		const grid = page.locator('.grid.gap-6').first();
		await expect(grid).toBeVisible();

		// Check that grid has the right classes for multi-column layout
		const gridClasses = await grid.getAttribute('class');
		expect(gridClasses).toContain('grid');
		expect(gridClasses).toMatch(/md:grid-cols-2|lg:grid-cols-3/);
	});

	test('cards have hover effects', async ({ page }) => {
		await page.waitForSelector('h3:has-text("Signal")', { timeout: 10000 });

		const firstCard = page.locator('div.border.rounded-lg').first();

		// Check for hover-related classes
		const cardClasses = await firstCard.getAttribute('class');
		expect(cardClasses).toContain('hover:shadow-lg');
		expect(cardClasses).toContain('transition-shadow');
	});

	test('displays app icons when available', async ({ page }) => {
		await page.waitForSelector('h3:has-text("Signal")', { timeout: 10000 });

		// Check for NuxtImg components (rendered as img tags)
		const appIcons = page.locator('img[alt*="icon"]');

		// At least one app should have an icon
		const iconCount = await appIcons.count();
		expect(iconCount).toBeGreaterThan(0);
	});
});
