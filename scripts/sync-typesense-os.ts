#!/usr/bin/env node
/**
 * Sync operating systems from Directus to Typesense
 * 
 * Usage: tsx scripts/sync-typesense-os.ts
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

// Operating systems collection schema
const osSchema = {
	name: 'operating_systems',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'name', type: 'string' },
		{ name: 'slug', type: 'string' },
		{ name: 'tagline', type: 'string', optional: true },
		{ name: 'description', type: 'string', optional: true },
		{ name: 'tier', type: 'string', optional: true, facet: true },
		{ name: 'is_open_source', type: 'bool', optional: true, facet: true },
		{ name: 'telemetry_default', type: 'string', optional: true, facet: true },
		{ name: 'bootloader_unlockable', type: 'string', optional: true, facet: true },
		{ name: 'root_access_available', type: 'bool', optional: true, facet: true },
		{ name: 'date_created', type: 'int64' },
	],
	default_sorting_field: 'date_created',
};

async function syncOS() {
	console.log('🔄 Starting Typesense sync for operating systems...');

	try {
		// Step 1: Create or recreate collection
		console.log('📦 Setting up Typesense collection...');
		try {
			await typesenseClient.collections('operating_systems').delete();
			console.log('  ✓ Deleted existing collection');
		} catch (error: any) {
			if (error.httpStatus !== 404) {
				console.log('  ℹ No existing collection to delete');
			}
		}

		await typesenseClient.collections().create(osSchema);
		console.log('  ✓ Created new collection with schema');

		// Step 2: Fetch operating systems from Directus
		console.log('\n📥 Fetching operating systems from Directus...');
		const operatingSystems = await directus.request(
			readItems('operating_systems', {
				fields: [
					'id',
					'name',
					'slug',
					'tagline',
					'description',
					'tier',
					'is_open_source',
					'telemetry_default',
					'bootloader_unlockable',
					'root_access_available',
					'date_created',
				],
				filter: {
					status: { _eq: 'published' },
				},
			}),
		);

		console.log(`  ✓ Found ${operatingSystems.length} operating systems`);

		// Step 3: Transform and index documents
		console.log('\n📤 Indexing operating systems to Typesense...');
		const documents = operatingSystems.map((os: any) => ({
			id: os.id,
			name: os.name || '',
			slug: os.slug || '',
			tagline: os.tagline || '',
			description: os.description || '',
			tier: os.tier || '',
			is_open_source: os.is_open_source || false,
			telemetry_default: os.telemetry_default || '',
			bootloader_unlockable: os.bootloader_unlockable || '',
			root_access_available: os.root_access_available || false,
			date_created: os.date_created ? new Date(os.date_created).getTime() : 0,
		}));

		// Import documents in batch
		const result = await typesenseClient
			.collections('operating_systems')
			.documents()
			.import(documents, { action: 'create' });

		const failed = result.filter((r: any) => !r.success);
		if (failed.length > 0) {
			console.error('  ⚠ Some documents failed to index:', failed);
		}

		console.log(`  ✓ Indexed ${documents.length - failed.length} operating systems successfully`);
		if (failed.length > 0) {
			console.log(`  ⚠ ${failed.length} operating systems failed to index`);
		}

		console.log('\n✅ Sync completed successfully!');
	} catch (error) {
		console.error('\n❌ Error during sync:', error);
		process.exit(1);
	}
}

// Run sync
syncOS();
