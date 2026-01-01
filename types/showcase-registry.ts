/**
 * Central registry of showcase types and their configurations
 * Provides metadata about each showcase category
 */

export interface ShowcaseConfig {
	collectionName: string;
	categoriesCollection?: string;
	junctionTable?: string;
	hasCategories: boolean;
	brandingFields: string[];
	urlFields: string[];
	searchFields: string[];
	filterFields: string[];
	statusField: 'status' | 'app_status' | 'service_status';
	detailRoute: string;
}

export const SHOWCASE_CONFIGS: Record<string, ShowcaseConfig> = {
	services: {
		collectionName: 'services',
		categoriesCollection: 'service_categories',
		junctionTable: 'services_service_categories',
		hasCategories: true,
		brandingFields: ['brand_logo_light', 'brand_logo_dark', 'brand_symbol_light', 'brand_symbol_dark'],
		urlFields: ['website_url', 'repo_url', 'docs_url', 'privacy_policy_url', 'terms_url'],
		searchFields: ['name', 'short_description', 'long_description'],
		filterFields: [
			'open_source_clients',
			'open_source_server',
			'end_to_end_encryption',
			'default_tracking',
			'self_hostable',
			'federated',
		],
		statusField: 'service_status',
		detailRoute: '/services',
	},

	apps: {
		collectionName: 'apps',
		categoriesCollection: 'app_categories',
		junctionTable: 'apps_app_categories',
		hasCategories: true,
		brandingFields: ['brand_logo_light', 'brand_logo_dark', 'brand_symbol_light', 'brand_symbol_dark'],
		urlFields: ['website_url', 'repo_url', 'docs_url', 'privacy_policy_url', 'terms_url'],
		searchFields: ['name', 'short_description', 'long_description'],
		filterFields: [
			'is_open_source',
			'end_to_end_encryption',
			'default_tracking',
			'self_hostable',
			'federated',
		],
		statusField: 'app_status',
		detailRoute: '/apps',
	},

	operating_systems: {
		collectionName: 'operating_systems',
		hasCategories: false,
		brandingFields: ['logo_light', 'logo_dark'],
		urlFields: ['website_url', 'documentation_url', 'source_code_url', 'privacy_policy_url'],
		searchFields: ['name', 'tagline', 'description'],
		filterFields: [
			'is_open_source',
			'root_access_available',
			'bootloader_unlockable',
			'telemetry_default',
			'cloud_account_required',
			'binary_reproducibility',
		],
		statusField: 'status',
		detailRoute: '/os',
	},

	hardware_items: {
		collectionName: 'hardware_items',
		hasCategories: false,
		brandingFields: ['brand_logo_light', 'brand_logo_dark', 'brand_symbol_light', 'brand_symbol_dark'],
		urlFields: ['website_url', 'repo_url', 'docs_url', 'privacy_policy_url'],
		searchFields: ['name', 'manufacturer', 'short_description', 'long_description'],
		filterFields: [
			'bootloader_unlockable',
			'open_firmware_support',
			'telemetry_default',
			'cloud_dependency',
			'repairability',
		],
		statusField: 'status',
		detailRoute: '/hardware',
	},
};

/**
 * Get configuration for a showcase type
 */
export function getShowcaseConfig(type: string): ShowcaseConfig | null {
	return SHOWCASE_CONFIGS[type] || null;
}

/**
 * Check if showcase type has categories
 */
export function hasCategories(type: string): boolean {
	const config = getShowcaseConfig(type);
	return config?.hasCategories || false;
}

/**
 * Get all showcase types
 */
export function getAllShowcaseTypes(): string[] {
	return Object.keys(SHOWCASE_CONFIGS);
}
