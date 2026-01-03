#!/usr/bin/env node
/**
 * Sync help articles from Directus to Typesense
 * 
 * Usage: tsx scripts/sync-typesense-help.ts
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

// Help articles collection schema
const helpArticlesSchema = {
	name: 'help_articles',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'slug', type: 'string' },
		{ name: 'summary', type: 'string', optional: true },
		{ name: 'content', type: 'string', optional: true },
		{ name: 'collection', type: 'string', optional: true, facet: true },
		{ name: 'date_created', type: 'int64' },
	],
	default_sorting_field: 'date_created',
};

async function syncHelpArticles() {
	console.log('🔄 Starting Typesense sync for help articles...');

	try {
		// Step 1: Create or recreate collection
		console.log('📦 Setting up Typesense collection...');
		try {
			await typesenseClient.collections('help_articles').delete();
			console.log('  ✓ Deleted existing collection');
		} catch (error: any) {
			if (error.httpStatus !== 404) {
				console.log('  ℹ No existing collection to delete');
			}
		}

		await typesenseClient.collections().create(helpArticlesSchema);
		console.log('  ✓ Created new collection with schema');

		// Step 2: Fetch help articles from Directus
		console.log('\n📥 Fetching help articles from Directus...');
		const articles = await directus.request(
			readItems('help_articles', {
				fields: [
					'id',
					'title',
					'slug',
					'summary',
					'content',
					'date_created',
					{
						help_collection: ['title'],
					},
				],
				filter: {
					status: { _eq: 'published' },
				},
			}),
		);

		console.log(`  ✓ Found ${articles.length} help articles`);

		// Step 3: Transform and index documents
		console.log('\n📤 Indexing help articles to Typesense...');
		const documents = articles.map((article: any) => ({
			id: article.id,
			title: article.title || '',
			slug: article.slug || '',
			summary: article.summary || '',
			content: article.content || '',
			collection: article.help_collection?.title || '',
			date_created: article.date_created ? new Date(article.date_created).getTime() : 0,
		}));

		// Import documents in batch
		const result = await typesenseClient
			.collections('help_articles')
			.documents()
			.import(documents, { action: 'create' });

		const failed = result.filter((r: any) => !r.success);
		if (failed.length > 0) {
			console.error('  ⚠ Some documents failed to index:', failed);
		}

		console.log(`  ✓ Indexed ${documents.length - failed.length} help articles successfully`);
		if (failed.length > 0) {
			console.log(`  ⚠ ${failed.length} help articles failed to index`);
		}

		console.log('\n✅ Sync completed successfully!');
	} catch (error) {
		console.error('\n❌ Error during sync:', error);
		process.exit(1);
	}
}

// Run sync
syncHelpArticles();
