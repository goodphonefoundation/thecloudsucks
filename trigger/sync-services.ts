import { task, logger } from '@trigger.dev/sdk/v3';
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import { syncCollection } from './lib/typesense';

const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const DIRECTUS_TOKEN = process.env.DIRECTUS_SERVER_TOKEN || '';

const directus = createDirectus(DIRECTUS_URL)
	.with(rest())
	.with(staticToken(DIRECTUS_TOKEN));

// Services collection schema
const servicesSchema = {
	name: 'services',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'name', type: 'string' },
		{ name: 'slug', type: 'string' },
		{ name: 'short_description', type: 'string', optional: true },
		{ name: 'service_status', type: 'string', optional: true, facet: true },
		{ name: 'primary_business_model', type: 'string', optional: true, facet: true },
		{ name: 'governance_model', type: 'string', optional: true, facet: true },
		{ name: 'self_hostable', type: 'bool', optional: true, facet: true },
		{ name: 'federated', type: 'bool', optional: true, facet: true },
		{ name: 'end_to_end_encryption', type: 'string', optional: true, facet: true },
		{ name: 'default_tracking', type: 'string', optional: true, facet: true },
		{ name: 'assessment_tier', type: 'string', optional: true, facet: true },
		{ name: 'categories', type: 'string[]', optional: true, facet: true },
		{ name: 'score_overall', type: 'int32' },
		{ name: 'website_url', type: 'string', optional: true },
		{ name: 'brand_symbol_light', type: 'string', optional: true },
	],
	default_sorting_field: 'score_overall',
};

export const syncServices = task({
	id: 'sync-services',
	run: async () => {
		logger.info('🔄 Starting services sync to Typesense...');

		try {
			// Fetch services from Directus
			logger.info('📥 Fetching services from Directus...');
			const services = await directus.request(
				readItems('services', {
					filter: {
						status: { _eq: 'published' },
					},
					fields: [
						'id',
						'name',
						'slug',
						'short_description',
						'service_status',
						'primary_business_model',
						'governance_model',
						'self_hostable',
						'federated',
						'end_to_end_encryption',
						'default_tracking',
						'assessment_tier',
						'scores',
						'website_url',
						'brand_symbol_light',
						{
							service_categories: [
								{
									service_categories_id: ['name'],
								},
							],
						},
					],
				}),
			);

			logger.info(`  ✓ Found ${services.length} services`);

			// Transform documents
			const documents = services.map((service: any) => {
				// Extract categories
				const categories = service.service_categories?.map(
					(cat: any) => cat.service_categories_id?.name,
				).filter(Boolean) || [];

				// Parse scores
				const scores = typeof service.scores === 'string' 
					? JSON.parse(service.scores) 
					: service.scores;

				return {
					id: service.id,
					name: service.name,
					slug: service.slug,
					short_description: service.short_description || '',
					service_status: service.service_status || '',
					primary_business_model: service.primary_business_model || '',
					governance_model: service.governance_model || '',
					self_hostable: service.self_hostable || false,
					federated: service.federated || false,
					end_to_end_encryption: service.end_to_end_encryption || '',
					default_tracking: service.default_tracking || '',
					assessment_tier: service.assessment_tier || '',
					categories,
					score_overall: scores?.overall || 0,
					website_url: service.website_url || '',
					brand_symbol_light: service.brand_symbol_light || '',
				};
			});

			// Sync to Typesense
			const result = await syncCollection('services', servicesSchema, documents);

			logger.info('✅ Services sync completed!');
			return result;
		} catch (error) {
			logger.error('❌ Services sync failed:', error);
			throw error;
		}
	},
});
