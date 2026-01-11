import { createDirectus, rest, readItems, createItem, staticToken } from '@directus/sdk';
import type { ServiceResearchData } from './perplexity';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://directus.thecloud.sucks';
const DIRECTUS_TOKEN = process.env.DIRECTUS_SERVER_TOKEN || '';

// Temporarily disabled for deployment - will be set in Trigger.dev dashboard
// if (!DIRECTUS_TOKEN) {
// 	throw new Error('DIRECTUS_SERVER_TOKEN environment variable is not set');
// }

// Initialize Directus client with authentication
const directus = createDirectus(DIRECTUS_URL)
	.with(rest())
	.with(staticToken(DIRECTUS_TOKEN));

/**
 * Generate a URL-safe slug from a service name
 */
export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Check if a service already exists by name or URL
 */
export async function checkDuplicateService(name: string, websiteUrl: string): Promise<boolean> {
	try {
		const services = await directus.request(
			readItems('services', {
				filter: {
					_or: [
						{ name: { _eq: name } },
						{ website_url: { _eq: websiteUrl } },
					],
				},
				fields: ['id', 'name'],
				limit: 1,
			})
		);

		return services.length > 0;
	} catch (error) {
		console.error('Error checking for duplicate service:', error);
		throw error;
	}
}

/**
 * Get or create service categories
 */
export async function getOrCreateCategories(categoryNames: string[]): Promise<string[]> {
	if (!categoryNames || categoryNames.length === 0) {
		return [];
	}

	try {
		// First, try to find existing categories
		const existingCategories = await directus.request(
			readItems('service_categories', {
				filter: {
					name: { _in: categoryNames },
				},
				fields: ['id', 'name'],
			})
		);

		const existingNames = existingCategories.map((cat: any) => cat.name);
		const existingIds = existingCategories.map((cat: any) => cat.id);
		
		// Find categories that need to be created
		const newCategoryNames = categoryNames.filter(name => !existingNames.includes(name));
		
		// Create new categories
		const newCategoryIds: string[] = [];
		for (const name of newCategoryNames) {
			try {
				const newCategory = await directus.request(
					createItem('service_categories', {
						name,
						slug: generateSlug(name),
						status: 'published',
					})
				);
				newCategoryIds.push((newCategory as any).id);
			} catch (error) {
				console.error(`Failed to create category "${name}":`, error);
			}
		}

		return [...existingIds, ...newCategoryIds];
	} catch (error) {
		console.error('Error managing categories:', error);
		throw error;
	}
}

/**
 * Create a new service in Directus
 */
export async function createService(serviceData: ServiceResearchData): Promise<{ id: string; url: string }> {
	try {
		const slug = generateSlug(serviceData.name);
		
		// Get category IDs
		const categoryIds = await getOrCreateCategories(serviceData.categories || []);

		// Prepare the service data
		const newService: any = {
			status: 'draft', // Set to draft for review
			name: serviceData.name,
			slug,
			short_description: serviceData.short_description,
			long_description: serviceData.long_description || '',
			website_url: serviceData.website_url,
			repo_url: serviceData.repo_url || null,
			docs_url: serviceData.docs_url || null,
			privacy_policy_url: serviceData.privacy_policy_url || null,
			terms_url: serviceData.terms_url || null,
			self_hostable: serviceData.self_hostable,
			federated: serviceData.federated,
			end_to_end_encryption: serviceData.end_to_end_encryption,
			open_source_clients: serviceData.open_source_clients,
			open_source_server: serviceData.open_source_server,
			primary_business_model: serviceData.primary_business_model || 'unknown',
			governance_model: serviceData.governance_model || 'unknown',
			service_status: 'active',
			// Default scores (to be manually reviewed)
			score_privacy: 0,
			score_autonomy: 0,
			score_transparency: 0,
			score_governance: 0,
			score_overall: 0,
			assessment_tier: null,
			default_tracking: 'unknown',
			data_portability: 'unknown',
			confidence: 'low', // AI-generated data needs review
			notes_editorial: 'Auto-generated from Perplexity AI research. Requires manual review and validation.',
		};

		// Create the service
		const createdService = await directus.request(
			createItem('services', newService)
		);

		const serviceId = (createdService as any).id;

		// Add category relationships
		if (categoryIds.length > 0) {
			for (const categoryId of categoryIds) {
				try {
					await directus.request(
						createItem('services_service_categories', {
							services_id: serviceId,
							service_categories_id: categoryId,
						})
					);
				} catch (error) {
					console.error(`Failed to link category ${categoryId} to service ${serviceId}:`, error);
				}
			}
		}

		const serviceUrl = `${DIRECTUS_URL}/admin/content/services/${serviceId}`;

		return {
			id: serviceId,
			url: serviceUrl,
		};
	} catch (error) {
		console.error('Error creating service in Directus:', error);
		throw error;
	}
}

export interface CreateServiceResult {
	service: ServiceResearchData;
	status: 'created' | 'duplicate' | 'error';
	id?: string;
	url?: string;
	error?: string;
}

/**
 * Process multiple services and create them in Directus
 */
export async function createMultipleServices(services: ServiceResearchData[]): Promise<CreateServiceResult[]> {
	const results: CreateServiceResult[] = [];

	for (const service of services) {
		try {
			// Check for duplicates
			const isDuplicate = await checkDuplicateService(service.name, service.website_url);
			
			if (isDuplicate) {
				results.push({
					service,
					status: 'duplicate',
					error: `Service "${service.name}" already exists`,
				});
				continue;
			}

			// Create the service
			const { id, url } = await createService(service);
			
			results.push({
				service,
				status: 'created',
				id,
				url,
			});
		} catch (error) {
			results.push({
				service,
				status: 'error',
				error: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	}

	return results;
}
