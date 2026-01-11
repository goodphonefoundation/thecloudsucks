import { task, logger } from '@trigger.dev/sdk/v3';
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';
import { syncCollection } from './lib/typesense';

const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const DIRECTUS_TOKEN = process.env.DIRECTUS_SERVER_TOKEN || '';

const directus = createDirectus(DIRECTUS_URL)
	.with(rest())
	.with(staticToken(DIRECTUS_TOKEN));

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

export const syncOS = task({
	id: 'sync-os',
	run: async () => {
		logger.info('🔄 Starting operating systems sync to Typesense...');

		try {
			// Fetch operating systems from Directus
			logger.info('📥 Fetching operating systems from Directus...');
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

			logger.info(`  ✓ Found ${operatingSystems.length} operating systems`);

			// Transform documents
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

			// Sync to Typesense
			const result = await syncCollection('operating_systems', osSchema, documents);

			logger.info('✅ Operating systems sync completed!');
			return result;
		} catch (error) {
			logger.error('❌ Operating systems sync failed:', error);
			throw error;
		}
	},
});
