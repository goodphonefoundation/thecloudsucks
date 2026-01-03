import 'dotenv/config';
import { createDirectus, rest, readItems } from '@directus/sdk';
import Typesense from 'typesense';
import { servicesSchema } from '../server/utils/typesense';

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

async function syncServices() {
	console.log('🔄 Starting services sync to Typesense...\n');

	try {
		// Delete existing collection if it exists
		try {
			await typesense.collections('services').delete();
			console.log('✅ Deleted existing services collection');
		} catch (error) {
			console.log('ℹ️ No existing services collection to delete');
		}

		// Create collection
		await typesense.collections().create(servicesSchema);
		console.log('✅ Created services collection with schema\n');

		// Fetch published services from Directus
		console.log('📡 Fetching services from Directus...');
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

		console.log(`✅ Fetched ${services.length} published services\n`);

		// Transform and prepare documents
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

		// Import documents to Typesense
		if (documents.length > 0) {
			console.log('📤 Importing documents to Typesense...');
			const importResults = await typesense.collections('services')
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

			console.log(`✅ Successfully imported ${documents.length - errors.length} services`);
			if (errors.length > 0) {
				console.log(`⚠️ Failed to import ${errors.length} services`);
			}
		} else {
			console.log('⚠️ No services to import');
		}

		console.log('\n✨ Sync completed!\n');
	} catch (error) {
		console.error('❌ Sync failed:', error);
		process.exit(1);
	}
}

// Run sync
syncServices();
