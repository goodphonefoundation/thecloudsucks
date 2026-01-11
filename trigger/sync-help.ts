import { task, logger } from '@trigger.dev/sdk/v3';
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import { syncCollection } from './lib/typesense';

const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const DIRECTUS_TOKEN = process.env.DIRECTUS_SERVER_TOKEN || '';

const directus = createDirectus(DIRECTUS_URL)
	.with(rest())
	.with(staticToken(DIRECTUS_TOKEN));

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

export const syncHelp = task({
	id: 'sync-help',
	run: async () => {
		logger.info('🔄 Starting help articles sync to Typesense...');

		try {
			// Fetch help articles from Directus
			logger.info('📥 Fetching help articles from Directus...');
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

			logger.info(`  ✓ Found ${articles.length} help articles`);

			// Transform documents
			const documents = articles.map((article: any) => ({
				id: article.id,
				title: article.title || '',
				slug: article.slug || '',
				summary: article.summary || '',
				content: article.content || '',
				collection: article.help_collection?.title || '',
				date_created: article.date_created ? new Date(article.date_created).getTime() : 0,
			}));

			// Sync to Typesense
			const result = await syncCollection('help_articles', helpArticlesSchema, documents);

			logger.info('✅ Help articles sync completed!');
			return result;
		} catch (error) {
			logger.error('❌ Help articles sync failed:', error);
			throw error;
		}
	},
});
