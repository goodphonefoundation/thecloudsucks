export interface HardwareItem {
	id: string;
	status?: 'active' | 'watch' | 'deprecated' | 'unknown';
	sort?: number | null;
	name: string;
	slug: string;
	hardware_type?: 'router' | 'phone' | 'tablet' | 'laptop' | 'desktop' | 'nas' | 'other' | null;
	manufacturer?: string | null;
	website_url?: string | null;
	repo_url?: string | null;
	docs_url?: string | null;
	privacy_policy_url?: string | null;
	short_description: string;
	long_description?: string | null;
	brand_logo_light?: string | object | null; // M2O to directus_files
	brand_logo_dark?: string | object | null; // M2O to directus_files
	brand_symbol_light?: string | object | null; // M2O to directus_files
	brand_symbol_dark?: string | object | null; // M2O to directus_files
	repairability?: 'high' | 'medium' | 'low' | 'unknown' | null;
	parts_availability?: 'good' | 'limited' | 'none' | 'unknown' | null;
	warranty_years?: number | null;
	software_support_years?: number | null;
	security_updates_policy?: string | null;
	bootloader_unlockable?: 'yes' | 'no' | 'partial' | 'unknown' | null;
	open_firmware_support?: 'yes' | 'partial' | 'no' | 'unknown' | null;
	alternative_os_support?: string | null;
	telemetry_default?: 'none' | 'low' | 'moderate' | 'high' | 'unknown' | null;
	cloud_dependency?: 'none' | 'optional' | 'required' | 'unknown' | null;
	key_specs?: Record<string, any> | null; // JSON object for hardware-specific specs
	compatibility_notes?: string | null;
	tier?: 'A_Sovereign' | 'B_Aligned' | 'C_Transitional' | 'D_Extractive' | null;
	recommended_use?: 'recommended' | 'situational' | 'avoid' | 'compare_only' | null;
	audience_level?: 'beginner' | 'intermediate' | 'advanced' | 'all' | null;
	summary: string;
	tradeoffs?: string | null;
	supply_chain_notes?: string | null;
	scores?: {
		privacy?: 0 | 1 | 2 | 3 | 4;
		autonomy?: 0 | 1 | 2 | 3 | 4;
		transparency?: 0 | 1 | 2 | 3 | 4;
		governance?: 0 | 1 | 2 | 3 | 4;
		overall?: 0 | 1 | 2 | 3 | 4;
	} | null;
	score_justifications?: Record<string, string> | null;
}

export interface BlockHardwareShowcase {
	id: string;
	headline?: string | null;
	content?: string | null;
}
