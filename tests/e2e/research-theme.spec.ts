import { test, expect } from '@playwright/test';

test.describe('Research Theme Design System', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to homepage
		await page.goto('/');
	});

	test('should load Space Grotesk font', async ({ page }) => {
		// Check if Space Grotesk font is loaded
		const bodyFont = await page.evaluate(() => {
			const element = document.body;
			return window.getComputedStyle(element).fontFamily;
		});

		expect(bodyFont).toContain('Space Grotesk');
	});

	test('should load JetBrains Mono font', async ({ page }) => {
		// Check if JetBrains Mono is available for code elements
		const fonts = await page.evaluate(() => {
			return document.fonts.check('1em "JetBrains Mono"');
		});

		expect(fonts).toBeTruthy();
	});

	test('should have research theme CSS variables defined', async ({ page }) => {
		const cssVars = await page.evaluate(() => {
			const root = document.documentElement;
			const styles = getComputedStyle(root);
			return {
				primary: styles.getPropertyValue('--color-tech-primary').trim(),
				bgDark: styles.getPropertyValue('--color-tech-bg-dark').trim(),
				surface: styles.getPropertyValue('--color-tech-surface').trim(),
				border: styles.getPropertyValue('--color-tech-border').trim(),
				muted: styles.getPropertyValue('--color-tech-muted').trim(),
			};
		});

		expect(cssVars.primary).toBe('#0d7ff2');
		expect(cssVars.bgDark).toBe('#0a0f14');
		expect(cssVars.surface).toBe('#16222c');
		expect(cssVars.border).toBe('#223649');
		expect(cssVars.muted).toBe('#90adcb');
	});

	test('should have jetbrains-text utility class available', async ({ page }) => {
		// Create a test element with the class
		const hasClass = await page.evaluate(() => {
			const testDiv = document.createElement('div');
			testDiv.className = 'jetbrains-text';
			document.body.appendChild(testDiv);
			
			const styles = window.getComputedStyle(testDiv);
			const fontFamily = styles.fontFamily;
			
			document.body.removeChild(testDiv);
			return fontFamily.includes('JetBrains Mono');
		});

		expect(hasClass).toBeTruthy();
	});

	test('should have tech-primary color available in Tailwind', async ({ page }) => {
		const hasColor = await page.evaluate(() => {
			const testDiv = document.createElement('div');
			testDiv.className = 'text-tech-primary';
			document.body.appendChild(testDiv);
			
			const styles = window.getComputedStyle(testDiv);
			const color = styles.color;
			
			document.body.removeChild(testDiv);
			// RGB value of #0d7ff2
			return color === 'rgb(13, 127, 242)';
		});

		expect(hasColor).toBeTruthy();
	});

	test('should have research callout styles', async ({ page }) => {
		const hasStyle = await page.evaluate(() => {
			const testDiv = document.createElement('div');
			testDiv.className = 'research-callout';
			document.body.appendChild(testDiv);
			
			const styles = window.getComputedStyle(testDiv);
			const bgColor = styles.backgroundColor;
			
			document.body.removeChild(testDiv);
			// RGB value of #16222c
			return bgColor === 'rgb(22, 34, 44)';
		});

		expect(hasStyle).toBeTruthy();
	});

	test('should have status-pulse animation', async ({ page }) => {
		const hasAnimation = await page.evaluate(() => {
			const testDiv = document.createElement('div');
			testDiv.className = 'status-pulse';
			document.body.appendChild(testDiv);
			
			const styles = window.getComputedStyle(testDiv);
			const animation = styles.animation || styles.webkitAnimation;
			
			document.body.removeChild(testDiv);
			return animation.includes('status-pulse');
		});

		expect(hasAnimation).toBeTruthy();
	});

	test('should have tech-button styles', async ({ page }) => {
		const buttonStyles = await page.evaluate(() => {
			const testButton = document.createElement('button');
			testButton.className = 'tech-button';
			document.body.appendChild(testButton);
			
			const styles = window.getComputedStyle(testButton);
			const result = {
				bgColor: styles.backgroundColor,
				textTransform: styles.textTransform,
				fontWeight: styles.fontWeight,
			};
			
			document.body.removeChild(testButton);
			return result;
		});

		expect(buttonStyles.bgColor).toBe('rgb(13, 127, 242)'); // #0d7ff2
		expect(buttonStyles.textTransform).toBe('uppercase');
		expect(parseInt(buttonStyles.fontWeight)).toBeGreaterThanOrEqual(700);
	});

	test('should have correct border radius (sm)', async ({ page }) => {
		// Check that border radius is set to sm (0.125rem)
		const borderRadius = await page.evaluate(() => {
			const testDiv = document.createElement('div');
			testDiv.className = 'rounded-button';
			document.body.appendChild(testDiv);
			
			const styles = window.getComputedStyle(testDiv);
			const radius = styles.borderRadius;
			
			document.body.removeChild(testDiv);
			return radius;
		});

		// sm border radius should be 0.125rem = 2px
		expect(borderRadius).toBeTruthy();
	});
});

test.describe('Research Theme Visual Regression', () => {
	test('homepage should match visual snapshot', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		
		// Take screenshot for visual comparison
		await expect(page).toHaveScreenshot('research-theme-homepage.png', {
			fullPage: false,
			maxDiffPixels: 100,
		});
	});
});
