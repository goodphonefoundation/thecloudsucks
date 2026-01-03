#!/usr/bin/env node
/**
 * Sync carriers from Directus to Typesense
 * 
 * Usage: tsx scripts/sync-typesense.ts
 */

import Typesense from 'typesense';
import { createDirectus, rest, readItems } from '@directus/sdk';

// Load environment variables
import { config } from 'dotenv';
config();

const typesenseClient = new Typesense.Client({
	nodes: [
		{
			host: process.env.TYPESENSE_HOST || 'localhost',
			port: parseInt(process.env.TYPESENSE_PORT || '8108'),
			protocol: (process.env.TYPESENSE_PROTOCOL as 'http' | 'https') || 'http',
		},
	],
	apiKey: process.env.TYPESENSE_API_KEY || '',
	connectionTimeoutSeconds: 10,
});

const directus = createDirectus(process.env.DIRECTUS_URL || '').with(rest());

// Carriers collection schema
const carriersSchema = {
	name: 'carriers',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'name', type: 'string' },
		{ name: 'slug', type: 'string' },
		{ name: 'short_description', type: 'string', optional: true },
		{ name: 'parent_company', type: 'string', optional: true },
		{ name: 'network_type', type: 'string', optional: true, facet: true },
		{ name: 'mvno_status', type: 'string', optional: true, facet: true },
		{ name: 'esim_support', type: 'bool', optional: true, facet: true },
		{ name: '5g_available', type: 'bool', optional: true, facet: true },
		{ name: 'prepaid_anonymous', type: 'bool', optional: true, facet: true },
		{ name: 'contract_flexibility', type: 'string', optional: true, facet: true },
		{ name: 'country_of_operation', type: 'string', optional: true, facet: true },
		{ name: 'categories', type: 'string[]', optional: true, facet: true },
		{ name: 'privacy_score', type: 'int32', optional: true },
		{ name: 'overall_score', type: 'int32', optional: true },
		{ name: 'website_url', type: 'string', optional: true },
		{ name: 'brand_symbol_light', type: 'string', optional: true },
	],
	default_sorting_field: 'overall_score',
};

async function syncCarriers() {
	console.log('🔄 Starting Typesense sync for carriers...');

	try {
		// Step 1: Create or recreate collection
		console.log('📦 Setting up Typesense collection...');
		try {
			await typesenseClient.collections('carriers').delete();
			console.log('  ✓ Deleted existing collection');
		} catch (error: any) {
			if (error.httpStatus !== 404) {
				console.log('  ℹ No existing collection to delete');
			}
		}

		await typesenseClient.collections().create(carriersSchema);
		console.log('  ✓ Created new collection with schema');

		// Step 2: Fetch carriers from Directus
		console.log('\n📥 Fetching carriers from Directus...');
		const carriers = await directus.request(
			readItems('carriers', {
				fields: [
					'id',
					'name',
					'slug',
					'short_description',
					'parent_company',
					'network_type',
					'mvno_status',
					'esim_support',
					'5g_available',
					'prepaid_anonymous',
					'contract_flexibility',
					'country_of_operation',
					'privacy_score',
					'overall_score',
					'website_url',
					'brand_symbol_light',
					'categories.carrier_categories_id.name',
				],
				filter: {
					status: { _eq: 'published' },
				},
			}),
		);

		console.log(`  ✓ Found ${carriers.length} carriers`);

		// Step 3: Transform and index documents
		console.log('\n📤 Indexing carriers to Typesense...');
		const documents = carriers.map((carrier: any) => ({
			id: carrier.id,
			name: carrier.name,
			slug: carrier.slug,
			short_description: carrier.short_description || '',
			parent_company: carrier.parent_company || '',
			network_type: carrier.network_type || '',
			mvno_status: carrier.mvno_status || '',
			esim_support: carrier.esim_support || false,
			'5g_available': carrier['5g_available'] || false,
			prepaid_anonymous: carrier.prepaid_anonymous || false,
			contract_flexibility: carrier.contract_flexibility || '',
			country_of_operation: carrier.country_of_operation || '',
			categories: carrier.categories?.map((c: any) => c.carrier_categories_id?.name).filter(Boolean) || [],
			privacy_score: carrier.privacy_score || 0,
			overall_score: carrier.overall_score || 0,
			website_url: carrier.website_url || '',
			brand_symbol_light: carrier.brand_symbol_light || '',
		}));

		// Import documents in batch
		const result = await typesenseClient
			.collections('carriers')
			.documents()
			.import(documents, { action: 'create' });

		const failed = result.filter((r: any) => !r.success);
		if (failed.length > 0) {
			console.error('  ⚠ Some documents failed to index:', failed);
		}

		console.log(`  ✓ Indexed ${documents.length - failed.length} carriers successfully`);
		if (failed.length > 0) {
			console.log(`  ⚠ ${failed.length} carriers failed to index`);
		}

		console.log('\n✅ Sync completed successfully!');
	} catch (error) {
		console.error('\n❌ Error during sync:', error);
		process.exit(1);
	}
}

// Run sync
syncCarriers();
