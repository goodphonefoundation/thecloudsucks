#!/usr/bin/env node
/**
 * Sync self-hosted alternatives from Directus to Typesense
 * 
 * Usage: tsx scripts/sync-typesense-selfhosted.ts
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

// Self-hosted alternatives collection schema
const selfhostedSchema = {
	name: 'selfhosted_alternatives',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'name', type: 'string' },
		{ name: 'slug', type: 'string' },
		{ name: 'short_description', type: 'string', optional: true },
		{ name: 'category', type: 'string', optional: true, facet: true },
		{ name: 'tier', type: 'string', optional: true, facet: true },
		{ name: 'is_open_source', type: 'bool', optional: true, facet: true },
		{ name: 'end_to_end_encryption', type: 'string', optional: true, facet: true },
		{ name: 'hosting_modes', type: 'string[]', optional: true, facet: true },
		{ name: 'deployment_complexity', type: 'string', optional: true, facet: true },
		{ name: 'replaces', type: 'string[]', optional: true },
		{ name: 'date_created', type: 'int64' },
	],
	default_sorting_field: 'date_created',
};

async function syncSelfhosted() {
	console.log('🔄 Starting Typesense sync for self-hosted alternatives...');

	try {
		// Step 1: Create or recreate collection
		console.log('📦 Setting up Typesense collection...');
		try {
			await typesenseClient.collections('selfhosted_alternatives').delete();
			console.log('  ✓ Deleted existing collection');
		} catch (error: any) {
			if (error.httpStatus !== 404) {
				console.log('  ℹ No existing collection to delete');
			}
		}

		await typesenseClient.collections().create(selfhostedSchema);
		console.log('  ✓ Created new collection with schema');

		// Step 2: Fetch self-hosted alternatives from Directus
		console.log('\n📥 Fetching self-hosted alternatives from Directus...');
		const alternatives = await directus.request(
			readItems('selfhosted_alternatives', {
				fields: [
					'id',
					'name',
					'slug',
					'short_description',
					'category',
					'tier',
					'is_open_source',
					'end_to_end_encryption',
					'hosting_modes',
					'deployment_complexity',
					'replaces',
					'date_created',
				],
				filter: {
					status: { _eq: 'active' },
				},
			}),
		);

		console.log(`  ✓ Found ${alternatives.length} self-hosted alternatives`);

		// Step 3: Transform and index documents
		console.log('\n📤 Indexing self-hosted alternatives to Typesense...');
		const documents = alternatives.map((alt: any) => ({
			id: alt.id,
			name: alt.name || '',
			slug: alt.slug || '',
			short_description: alt.short_description || '',
			category: alt.category || '',
			tier: alt.tier || '',
			is_open_source: alt.is_open_source || false,
			end_to_end_encryption: alt.end_to_end_encryption || '',
			hosting_modes: Array.isArray(alt.hosting_modes) ? alt.hosting_modes : [],
			deployment_complexity: alt.deployment_complexity || '',
			replaces: Array.isArray(alt.replaces) ? alt.replaces : [],
			date_created: alt.date_created ? new Date(alt.date_created).getTime() : 0,
		}));

		// Import documents in batch
		const result = await typesenseClient
			.collections('selfhosted_alternatives')
			.documents()
			.import(documents, { action: 'create' });

		const failed = result.filter((r: any) => !r.success);
		if (failed.length > 0) {
			console.error('  ⚠ Some documents failed to index:', failed);
		}

		console.log(`  ✓ Indexed ${documents.length - failed.length} self-hosted alternatives successfully`);
		if (failed.length > 0) {
			console.log(`  ⚠ ${failed.length} self-hosted alternatives failed to index`);
		}

		console.log('\n✅ Sync completed successfully!');
	} catch (error) {
		console.error('\n❌ Error during sync:', error);
		process.exit(1);
	}
}

// Run sync
syncSelfhosted();
