import Typesense from 'typesense';

export const getTypesenseClient = () => {
	const config = useRuntimeConfig();

	return new Typesense.Client({
		nodes: [
			{
				host: config.typesenseHost || 'localhost',
				port: parseInt(config.typesensePort || '8108'),
				protocol: config.typesenseProtocol || 'http',
			},
		],
		apiKey: config.typesenseApiKey,
		connectionTimeoutSeconds: 2,
	});
};

// Carriers collection schema
export const carriersSchema = {
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

// Services collection schema
export const servicesSchema = {
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

// Hardware collection schema
export const hardwareSchema = {
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
