import { task, logger } from '@trigger.dev/sdk/v3';
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import { syncCollection } from './lib/typesense';

const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const DIRECTUS_TOKEN = process.env.DIRECTUS_SERVER_TOKEN || '';

const directus = createDirectus(DIRECTUS_URL)
	.with(rest())
	.with(staticToken(DIRECTUS_TOKEN));

// Hardware collection schema
const hardwareSchema = {
	name: 'hardware',
	fields: [
		{ name: 'id', type: 'string' },
		{ name: 'name', type: 'string' },
		{ name: 'slug', type: 'string' },
		{ name: 'short_description', type: 'string', optional: true },
		{ name: 'manufacturer', type: 'string', optional: true },
		{ name: 'hardware_type', type: 'string', optional: true, facet: true },
		{ name: 'repairability', type: 'string', optional: true, facet: true },
		{ name: 'bootloader_unlockable', type: 'string', optional: true, facet: true },
		{ name: 'tier', type: 'string', optional: true, facet: true },
		{ name: 'overall_score', type: 'int32' },
		{ name: 'brand_symbol_light', type: 'string', optional: true },
	],
	default_sorting_field: 'overall_score',
};

export const syncHardware = task({
	id: 'sync-hardware',
	run: async () => {
		logger.info('🔄 Starting hardware sync to Typesense...');

		try {
			// Fetch hardware from Directus
			logger.info('📥 Fetching hardware items from Directus...');
			const hardwareItems = await directus.request(
				readItems('hardware_items', {
					filter: {
						status: { _eq: 'published' },
					},
					fields: [
						'id',
						'name',
						'slug',
						'short_description',
						'manufacturer',
						'hardware_type',
						'repairability',
						'bootloader_unlockable',
						'tier',
						'scores',
						'brand_symbol_light',
					],
				}),
			);

			logger.info(`  ✓ Found ${hardwareItems.length} hardware items`);

			// Transform documents
			const documents = hardwareItems.map((item: any) => {
				// Parse scores
				const scores = typeof item.scores === 'string' 
					? JSON.parse(item.scores) 
					: item.scores;

				return {
					id: item.id,
					name: item.name,
					slug: item.slug,
					short_description: item.short_description || '',
					manufacturer: item.manufacturer || '',
					hardware_type: item.hardware_type || '',
					repairability: item.repairability || '',
					bootloader_unlockable: item.bootloader_unlockable || '',
					tier: item.tier || '',
					overall_score: scores?.overall || 0,
					brand_symbol_light: item.brand_symbol_light || '',
				};
			});

			// Sync to Typesense
			const result = await syncCollection('hardware', hardwareSchema, documents);

			logger.info('✅ Hardware sync completed!');
			return result;
		} catch (error) {
			logger.error('❌ Hardware sync failed:', error);
			throw error;
		}
	},
});
