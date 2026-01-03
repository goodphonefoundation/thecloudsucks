#!/usr/bin/env node
/**
 * Sync posts (blog articles, videos, projects) from Directus to Typesense
 * 
 * Usage: tsx scripts/sync-typesense-posts.ts
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

// Posts collection schema
const postsSchema = {
	name: 'posts',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'slug', type: 'string' },
		{ name: 'summary', type: 'string', optional: true },
		{ name: 'type', type: 'string', facet: true },
		{ name: 'category', type: 'string', optional: true, facet: true },
		{ name: 'author', type: 'string', optional: true },
		{ name: 'date_published', type: 'int64' },
		{ name: 'image', type: 'string', optional: true },
	],
	default_sorting_field: 'date_published',
};

async function syncPosts() {
	console.log('🔄 Starting Typesense sync for posts...');

	try {
		// Step 1: Create or recreate collection
		console.log('📦 Setting up Typesense collection...');
		try {
			await typesenseClient.collections('posts').delete();
			console.log('  ✓ Deleted existing collection');
		} catch (error: any) {
			if (error.httpStatus !== 404) {
				console.log('  ℹ No existing collection to delete');
			}
		}

		await typesenseClient.collections().create(postsSchema);
		console.log('  ✓ Created new collection with schema');

		// Step 2: Fetch posts from Directus
		console.log('\n📥 Fetching posts from Directus...');
		const posts = await directus.request(
			readItems('posts', {
				fields: [
					'id',
					'title',
					'slug',
					'summary',
					'type',
					'date_published',
					'image',
					{
						category: ['title'],
						author: ['name'],
					},
				],
				filter: {
					status: { _eq: 'published' },
				},
			}),
		);

		console.log(`  ✓ Found ${posts.length} posts`);

		// Step 3: Transform and index documents
		console.log('\n📤 Indexing posts to Typesense...');
		const documents = posts.map((post: any) => ({
			id: post.id,
			title: post.title || '',
			slug: post.slug || '',
			summary: post.summary || '',
			type: post.type || 'blog',
			category: post.category?.title || '',
			author: post.author?.name || '',
			date_published: post.date_published ? new Date(post.date_published).getTime() : 0,
			image: post.image || '',
		}));

		// Import documents in batch
		const result = await typesenseClient
			.collections('posts')
			.documents()
			.import(documents, { action: 'create' });

		const failed = result.filter((r: any) => !r.success);
		if (failed.length > 0) {
			console.error('  ⚠ Some documents failed to index:', failed);
		}

		console.log(`  ✓ Indexed ${documents.length - failed.length} posts successfully`);
		if (failed.length > 0) {
			console.log(`  ⚠ ${failed.length} posts failed to index`);
		}

		console.log('\n✅ Sync completed successfully!');
	} catch (error) {
		console.error('\n❌ Error during sync:', error);
		process.exit(1);
	}
}

// Run sync
syncPosts();
