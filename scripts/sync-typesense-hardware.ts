import 'dotenv/config';
import { createDirectus, rest, readItems } from '@directus/sdk';
import Typesense from 'typesense';
import { hardwareSchema } from '../server/utils/typesense';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = parseInt(process.env.TYPESENSE_PORT || '8108');
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || '';

// Initialize clients
const directus = createDirectus(DIRECTUS_URL).with(rest());
const typesense = new Typesense.Client({
	nodes: [
		{
			host: TYPESENSE_HOST,
			port: TYPESENSE_PORT,
			protocol: TYPESENSE_PROTOCOL,
		},
	],
	apiKey: TYPESENSE_API_KEY,
	connectionTimeoutSeconds: 2,
});

async function syncHardware() {
	console.log('🔄 Starting hardware sync to Typesense...\n');

	try {
		// Delete existing collection if it exists
		try {
			await typesense.collections('hardware').delete();
			console.log('✅ Deleted existing hardware collection');
		} catch (error) {
			console.log('ℹ️ No existing hardware collection to delete');
		}

		// Create collection
		await typesense.collections().create(hardwareSchema);
		console.log('✅ Created hardware collection with schema\n');

		// Fetch published hardware from Directus
		console.log('📡 Fetching hardware items from Directus...');
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

		console.log(`✅ Fetched ${hardwareItems.length} published hardware items\n`);

		// Transform and prepare documents
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

		// Import documents to Typesense
		if (documents.length > 0) {
			console.log('📤 Importing documents to Typesense...');
			const importResults = await typesense.collections('hardware')
				.documents()
				.import(documents, { action: 'create' });

			// Check for errors
			const errors = importResults.filter((result: any) => !result.success);
			if (errors.length > 0) {
				console.error('\n❌ Some documents failed to import:');
				errors.forEach((error: any) => {
					console.error(`  - ${error.error || error.document}`);
				});
			}

			console.log(`✅ Successfully imported ${documents.length - errors.length} hardware items`);
			if (errors.length > 0) {
				console.log(`⚠️ Failed to import ${errors.length} hardware items`);
			}
		} else {
			console.log('⚠️ No hardware items to import');
		}

		console.log('\n✨ Sync completed!\n');
	} catch (error) {
		console.error('❌ Sync failed:', error);
		process.exit(1);
	}
}

// Run sync
syncHardware();
