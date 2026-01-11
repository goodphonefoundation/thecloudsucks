import { task, logger } from '@trigger.dev/sdk/v3';
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import { syncCollection } from './lib/typesense';

const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const DIRECTUS_TOKEN = process.env.DIRECTUS_SERVER_TOKEN || '';

const directus = createDirectus(DIRECTUS_URL)
	.with(rest())
	.with(staticToken(DIRECTUS_TOKEN));

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

export const syncPosts = task({
	id: 'sync-posts',
	run: async () => {
		logger.info('🔄 Starting posts sync to Typesense...');

		try {
			// Fetch posts from Directus
			logger.info('📥 Fetching posts from Directus...');
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

			logger.info(`  ✓ Found ${posts.length} posts`);

			// Transform documents
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

			// Sync to Typesense
			const result = await syncCollection('posts', postsSchema, documents);

			logger.info('✅ Posts sync completed!');
			return result;
		} catch (error) {
			logger.error('❌ Posts sync failed:', error);
			throw error;
		}
	},
});
