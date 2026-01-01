/**
 * Script to check and update Directus navigation
 * Run with: npx tsx scripts/check-navigation.ts
 */

import { createDirectus, rest, readItem, readItems, updateItem } from '@directus/sdk';

const directusUrl = process.env.DIRECTUS_URL || 'https://directus.thecloud.sucks';
const token = process.env.DIRECTUS_SERVER_TOKEN;

if (!token) {
	console.error('❌ DIRECTUS_SERVER_TOKEN not found in environment');
	process.exit(1);
}

const directus = createDirectus(directusUrl).with(rest());

async function checkNavigation() {
	try {
		console.log('🔍 Fetching main navigation...\n');

		// Fetch main navigation with all items
		const navigation = await directus.request(
			readItem('navigation', 'main', {
				fields: ['*', { items: ['*'] }],
			})
		);

		console.log('📋 Current Navigation Structure:');
		console.log('================================\n');

		if (navigation.items && Array.isArray(navigation.items)) {
			navigation.items.forEach((item: any, index: number) => {
				console.log(`${index + 1}. ${item.title || 'Untitled'}`);
				console.log(`   Type: ${item.type || 'N/A'}`);
				console.log(`   URL: ${item.url || 'N/A'}`);
				if (item.page) {
					console.log(`   Page: ${typeof item.page === 'object' ? item.page.permalink : item.page}`);
				}
				console.log('');
			});
		}

		// Check for apps and selfhosting links
		const appsLink = navigation.items?.find((item: any) => 
			item.title?.toLowerCase().includes('app') ||
			item.url?.includes('/apps')
		);

		const selfhostingLink = navigation.items?.find((item: any) => 
			item.title?.toLowerCase().includes('self') ||
			item.title?.toLowerCase().includes('host') ||
			item.url?.includes('selfhosting') ||
			item.url?.includes('self-hosting')
		);

		console.log('🔎 Issues Found:');
		console.log('================\n');

		if (!appsLink) {
			console.log('⚠️  No "Apps" navigation link found');
		} else {
			console.log(`✓ Apps link found: ${appsLink.url || appsLink.page}`);
		}

		if (!selfhostingLink) {
			console.log('⚠️  No "Selfhosting" navigation link found');
		} else {
			console.log(`✓ Selfhosting link found: ${selfhostingLink.url || selfhostingLink.page}`);
		}

	} catch (error: any) {
		console.error('❌ Error:', error.message);
		if (error.errors) {
			console.error('Details:', error.errors);
		}
	}
}

async function checkPages() {
	try {
		console.log('\n📄 Checking Pages...\n');
		
		const pages = await directus.request(
			readItems('pages', {
				fields: ['id', 'title', 'permalink', 'status', 'blocks'],
				filter: {
					permalink: {
						_in: ['/apps', '/selfhosting', '/self-hosting', '/services', 'apps', 'selfhosting', 'self-hosting']
					}
				}
			})
		);

	if (pages.length === 0) {
		console.log('⚠️  No pages found for /apps or /self-hosting');
	} else {
		console.log('Found pages:');
		pages.forEach((page: any) => {
			console.log(`  - ${page.title} (${page.permalink}) - Status: ${page.status}`);
			if (page.blocks) {
				console.log(`    Blocks: ${Array.isArray(page.blocks) ? page.blocks.length : 0} blocks`);
			}
		});
	}

	} catch (error: any) {
		console.error('❌ Error checking pages:', error.message);
	}
}

// Run checks
console.log('🚀 Directus Navigation Checker');
console.log(`📍 Directus URL: ${directusUrl}\n`);

checkNavigation().then(() => checkPages());
