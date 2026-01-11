import { task, logger } from '@trigger.dev/sdk/v3';
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import { syncCollection } from './lib/typesense';

const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const DIRECTUS_TOKEN = process.env.DIRECTUS_SERVER_TOKEN || '';

const directus = createDirectus(DIRECTUS_URL)
	.with(rest())
	.with(staticToken(DIRECTUS_TOKEN));

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
		{ name: 'overall_score', type: 'int32' },
		{ name: 'website_url', type: 'string', optional: true },
		{ name: 'brand_symbol_light', type: 'string', optional: true },
	],
	default_sorting_field: 'overall_score',
};

export const syncCarriers = task({
	id: 'sync-carriers',
	run: async () => {
		logger.info('🔄 Starting carriers sync to Typesense...');

		try {
			// Fetch carriers from Directus
			logger.info('📥 Fetching carriers from Directus...');
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

			logger.info(`  ✓ Found ${carriers.length} carriers`);

			// Transform documents
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

			// Sync to Typesense
			const result = await syncCollection('carriers', carriersSchema, documents);

			logger.info('✅ Carriers sync completed!');
			return result;
		} catch (error) {
			logger.error('❌ Carriers sync failed:', error);
			throw error;
		}
	},
});
