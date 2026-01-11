import { task, logger } from '@trigger.dev/sdk/v3';
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import { syncCollection } from './lib/typesense';

const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const DIRECTUS_TOKEN = process.env.DIRECTUS_SERVER_TOKEN || '';

const directus = createDirectus(DIRECTUS_URL)
	.with(rest())
	.with(staticToken(DIRECTUS_TOKEN));

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

export const syncSelfhosted = task({
	id: 'sync-selfhosted',
	run: async () => {
		logger.info('🔄 Starting self-hosted alternatives sync to Typesense...');

		try {
			// Fetch self-hosted alternatives from Directus
			logger.info('📥 Fetching self-hosted alternatives from Directus...');
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

			logger.info(`  ✓ Found ${alternatives.length} self-hosted alternatives`);

			// Transform documents
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

			// Sync to Typesense
			const result = await syncCollection('selfhosted_alternatives', selfhostedSchema, documents);

			logger.info('✅ Self-hosted alternatives sync completed!');
			return result;
		} catch (error) {
			logger.error('❌ Self-hosted alternatives sync failed:', error);
			throw error;
		}
	},
});
