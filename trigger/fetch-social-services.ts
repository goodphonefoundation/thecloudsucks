import { task, logger } from "@trigger.dev/sdk/v3";
import { researchSocialServices } from "./lib/perplexity";
import { createMultipleServices } from "./lib/directus";

export interface FetchSocialServicesPayload {
	count?: number;
}

export const fetchSocialServices = task({
	id: "fetch-social-services",
	run: async (payload: FetchSocialServicesPayload = {}) => {
		const count = payload.count || 5;
		
		logger.info(`🔍 Starting research for ${count} social services using Perplexity AI...`);

		try {
			// Step 1: Research services using Perplexity
			logger.info("📡 Querying Perplexity API...");
			const services = await researchSocialServices(count);
			
			logger.info(`✅ Received ${services.length} services from Perplexity`);
			logger.info("Services found:", services.map(s => s.name).join(", "));

			// Step 2: Create services in Directus
			logger.info("📝 Creating services in Directus...");
			const results = await createMultipleServices(services);

			// Step 3: Generate summary
			const created = results.filter(r => r.status === 'created');
			const duplicates = results.filter(r => r.status === 'duplicate');
			const errors = results.filter(r => r.status === 'error');

			logger.info(`\n📊 Summary:`);
			logger.info(`✅ Created: ${created.length}`);
			logger.info(`🔄 Duplicates: ${duplicates.length}`);
			logger.info(`❌ Errors: ${errors.length}`);

			// Log details for each result
			if (created.length > 0) {
				logger.info(`\n✅ Successfully created services:`);
				created.forEach(result => {
					logger.info(`  - ${result.service.name}`);
					logger.info(`    URL: ${result.url}`);
				});
			}

			if (duplicates.length > 0) {
				logger.info(`\n🔄 Duplicate services (already exist):`);
				duplicates.forEach(result => {
					logger.info(`  - ${result.service.name}: ${result.error}`);
				});
			}

			if (errors.length > 0) {
				logger.error(`\n❌ Failed to create services:`);
				errors.forEach(result => {
					logger.error(`  - ${result.service.name}: ${result.error}`);
				});
			}

			// Return structured result
			return {
				success: true,
				total: services.length,
				created: created.length,
				duplicates: duplicates.length,
				errors: errors.length,
				results: results.map(r => ({
					name: r.service.name,
					status: r.status,
					url: r.url,
					error: r.error,
				})),
			};
		} catch (error) {
			logger.error("❌ Task failed:", error);
			throw error;
		}
	},
});
