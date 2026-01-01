/**
 * Script to create Brandfetch flows for all 4 showcase categories
 * Run with: npx tsx scripts/setup-brandfetch-flows.ts
 * 
 * Note: This script requires admin access to create flows in Directus
 */

import { createDirectus, rest, staticToken } from '@directus/sdk';

const directusUrl = process.env.DIRECTUS_URL || 'https://directus.thecloud.sucks';
const token = process.env.DIRECTUS_SERVER_TOKEN;
const brandfetchKey = process.env.BRANDFETCH_API_KEY;

if (!token) {
	console.error('❌ DIRECTUS_SERVER_TOKEN not found in environment');
	process.exit(1);
}

if (!brandfetchKey) {
	console.error('❌ BRANDFETCH_API_KEY not found in environment');
	console.error('   Please add it to your .env file');
	process.exit(1);
}

const directus = createDirectus(directusUrl).with(rest()).with(staticToken(token));

// Flow configuration template
const createFlowConfig = (collectionName: string, displayName: string) => ({
	name: `Fetch Brand Assets - ${displayName}`,
	icon: 'image',
	color: '#6644FF',
	description: `Automatically fetch brand logos and symbols from Brandfetch when ${collectionName} items are created or updated`,
	status: 'active',
	trigger: 'event',
	accountability: 'all',
	options: {
		type: 'action',
		scope: ['items.create', 'items.update'],
		collections: [collectionName]
	}
});

// Operation: Extract domain from URL
const createExtractDomainOperation = () => ({
	name: 'Extract Domain',
	key: 'extract_domain',
	type: 'exec',
	position_x: 3,
	position_y: 1,
	options: {
		code: `
module.exports = async function(data) {
	const { $trigger } = data;
	const url = $trigger.payload?.website_url;
	
	if (!url) {
		console.log('No website_url provided');
		return { domain: null };
	}
	
	try {
		const urlObj = new URL(url);
		const domain = urlObj.hostname.replace('www.', '');
		console.log('Extracted domain:', domain);
		return { domain };
	} catch (error) {
		console.error('Failed to parse URL:', error.message);
		return { domain: null };
	}
};
		`.trim()
	}
});

// Operation: Fetch brand data from Brandfetch
const createFetchBrandDataOperation = () => ({
	name: 'Fetch Brand Data',
	key: 'fetch_brand_data',
	type: 'request',
	position_x: 19,
	position_y: 1,
	options: {
		method: 'GET',
		url: 'https://api.brandfetch.io/v2/brands/{{$last.domain}}',
		headers: [
			{
				header: 'Authorization',
				value: `Bearer ${process.env.BRANDFETCH_API_KEY}`
			}
		]
	}
});

// Operation: Condition check if logos exist
const createCheckLogosCondition = () => ({
	name: 'Check if logos exist',
	key: 'check_logos',
	type: 'condition',
	position_x: 35,
	position_y: 1,
	options: {
		filter: {
			'$last.logos': {
				_nnull: true
			}
		}
	}
});

// Operation: Transform logo data
const createTransformLogosOperation = () => ({
	name: 'Transform Logo Data',
	key: 'transform_logos',
	type: 'exec',
	position_x: 51,
	position_y: 1,
	options: {
		code: `
module.exports = async function(data) {
	const { $last } = data;
	const logos = $last?.logos || [];
	
	const result = {
		logo_light_url: null,
		logo_dark_url: null,
		symbol_light_url: null,
		symbol_dark_url: null
	};
	
	// Find light logo
	const lightLogo = logos.find(l => l.type === 'logo' && l.theme === 'light');
	if (lightLogo?.formats?.length > 0) {
		// Prefer SVG, fallback to PNG
		const svg = lightLogo.formats.find(f => f.format === 'svg');
		const png = lightLogo.formats.find(f => f.format === 'png');
		result.logo_light_url = svg?.src || png?.src;
	}
	
	// Find dark logo
	const darkLogo = logos.find(l => l.type === 'logo' && l.theme === 'dark');
	if (darkLogo?.formats?.length > 0) {
		const svg = darkLogo.formats.find(f => f.format === 'svg');
		const png = darkLogo.formats.find(f => f.format === 'png');
		result.logo_dark_url = svg?.src || png?.src;
	}
	
	// Find light symbol/icon
	const lightSymbol = logos.find(l => l.type === 'icon' && l.theme === 'light');
	if (lightSymbol?.formats?.length > 0) {
		const svg = lightSymbol.formats.find(f => f.format === 'svg');
		const png = lightSymbol.formats.find(f => f.format === 'png');
		result.symbol_light_url = svg?.src || png?.src;
	}
	
	// Find dark symbol/icon
	const darkSymbol = logos.find(l => l.type === 'icon' && l.theme === 'dark');
	if (darkSymbol?.formats?.length > 0) {
		const svg = darkSymbol.formats.find(f => f.format === 'svg');
		const png = darkSymbol.formats.find(f => f.format === 'png');
		result.symbol_dark_url = svg?.src || png?.src;
	}
	
	console.log('Transformed logo URLs:', result);
	return result;
};
		`.trim()
	}
});

async function createFlow(collectionName: string, displayName: string) {
	try {
		console.log(`\n📦 Creating flow for ${displayName} (${collectionName})...`);
		
		// Note: We cannot create flows through the SDK items API as flows are core collections
		// This script serves as documentation of what needs to be created manually
		
		console.log('⚠️  Flows must be created manually in Directus admin UI');
		console.log('   Flow configuration:');
		console.log(JSON.stringify(createFlowConfig(collectionName, displayName), null, 2));
		
		return null;
	} catch (error: any) {
		console.error(`❌ Error creating flow for ${displayName}:`, error.message);
		return null;
	}
}

async function main() {
	console.log('🚀 Brandfetch Flow Setup');
	console.log(`📍 Directus URL: ${directusUrl}`);
	console.log(`🔑 Brandfetch API Key: ${brandfetchKey ? '✓ Configured' : '❌ Missing'}\n`);
	
	const collections = [
		{ name: 'services', display: 'Services' },
		{ name: 'apps', display: 'Apps' },
		{ name: 'hardware', display: 'Hardware' },
		{ name: 'operating_systems', display: 'Operating Systems' }
	];
	
	console.log('⚠️  IMPORTANT: Flows cannot be created programmatically via the Directus SDK.');
	console.log('   They must be created manually in the Directus admin UI.');
	console.log('\n📖 Please follow these steps:\n');
	console.log('1. Log into Directus admin: https://directus.thecloud.sucks/admin');
	console.log('2. Go to Settings → Flows');
	console.log('3. Click "Create Flow"');
	console.log('4. For each collection below, create a flow with these settings:\n');
	
	collections.forEach(({ name, display }) => {
		console.log(`\n━━━ ${display} (${name}) ━━━`);
		console.log(`Name: Fetch Brand Assets - ${display}`);
		console.log(`Icon: image`);
		console.log(`Color: #6644FF`);
		console.log(`Trigger: Event Hook`);
		console.log(`  - Type: Action`);
		console.log(`  - Scope: items.create, items.update`);
		console.log(`  - Collections: ${name}`);
		console.log(`\nOperations to add (in order):`);
		console.log(`  1. Run Script: Extract Domain`);
		console.log(`  2. Request URL: Fetch Brand Data from Brandfetch`);
		console.log(`  3. Condition: Check if logos exist`);
		console.log(`  4. Run Script: Transform Logo Data`);
		console.log(`  5. Import from URL: Download each logo/symbol (4 operations)`);
		console.log(`  6. Update Items: Set brand asset fields`);
	});
	
	console.log('\n\n📚 For detailed instructions, see: docs/BRANDFETCH_FLOW_SETUP.md');
	console.log('\n💡 Alternative: You can also export an existing flow and duplicate it for other collections');
}

main().catch(console.error);
