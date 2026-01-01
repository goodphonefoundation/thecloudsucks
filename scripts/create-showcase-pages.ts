/**
 * Script to create Apps and Self-Hosting pages in Directus
 * Run with: npx tsx scripts/create-showcase-pages.ts
 */

import { createDirectus, rest, readItems, createItem, staticToken } from '@directus/sdk';

const directusUrl = process.env.DIRECTUS_URL || 'https://directus.thecloud.sucks';
const token = process.env.DIRECTUS_SERVER_TOKEN;

if (!token) {
	console.error('❌ DIRECTUS_SERVER_TOKEN not found in environment');
	process.exit(1);
}

const directus = createDirectus(directusUrl).with(rest()).with(staticToken(token));

async function createAppsPage() {
	try {
		console.log('\n📄 Creating Apps page...');
		
		// First, check if the page already exists
		const existingPages = await directus.request(
			readItems('pages', {
				fields: ['id', 'title', 'permalink'],
				filter: {
					permalink: { _eq: '/apps' }
				}
			})
		);

		if (existingPages && existingPages.length > 0) {
			console.log('✓ Apps page already exists:', existingPages[0].title);
			return existingPages[0].id;
		}

		// Create the page
		const page = await directus.request(
			createItem('pages', {
				title: 'Apps',
				permalink: '/apps',
				status: 'published',
				summary: 'Discover privacy-respecting applications that put you in control of your digital life.',
			})
		);

		console.log(`✓ Created Apps page with ID: ${page.id}`);
		return page.id;
	} catch (error: any) {
		console.error('❌ Error creating Apps page:', error.message);
		if (error.errors) {
			console.error('Details:', error.errors);
		}
	}
}

async function createSelfHostingPage() {
	try {
		console.log('\n📄 Creating Self-Hosting page...');
		
		// First, check if the page already exists
		const existingPages = await directus.request(
			readItems('pages', {
				fields: ['id', 'title', 'permalink'],
				filter: {
					permalink: { _eq: '/self-hosting' }
				}
			})
		);

		if (existingPages && existingPages.length > 0) {
			console.log('✓ Self-Hosting page already exists:', existingPages[0].title);
			return existingPages[0].id;
		}

		// Create the page
		const page = await directus.request(
			createItem('pages', {
				title: 'Self-Hosting',
				permalink: '/self-hosting',
				status: 'published',
				summary: 'Take control of your data with self-hosted services and applications.',
			})
		);

		console.log(`✓ Created Self-Hosting page with ID: ${page.id}`);
		return page.id;
	} catch (error: any) {
		console.error('❌ Error creating Self-Hosting page:', error.message);
		if (error.errors) {
			console.error('Details:', error.errors);
		}
	}
}

// Run the script
console.log('🚀 Creating Showcase Pages in Directus');
console.log(`📍 Directus URL: ${directusUrl}\n`);

Promise.all([
	createAppsPage(),
	createSelfHostingPage()
]).then(() => {
	console.log('\n✅ Done! Pages created successfully.');
	console.log('\n📝 Next steps:');
	console.log('   1. Log into Directus admin panel');
	console.log('   2. Add showcase blocks to each page');
	console.log('   3. Verify the navigation links work correctly');
});
