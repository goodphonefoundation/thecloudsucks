export interface OperatingSystem {
	id: string;
	status?: 'published' | 'draft' | 'archived';
	sort?: number | null;
	user_created?: string | null;
	date_created?: string | null;
	user_updated?: string | null;
	date_updated?: string | null;
	
	// Core Identity
	name: string;
	slug: string;
	tagline?: string | null;
	description?: string | null;
	
	// Branding
	logo_light?: string | object | null; // M2O to directus_files
	logo_dark?: string | object | null; // M2O to directus_files
	
	// URLs
	website_url?: string | null;
	documentation_url?: string | null;
	source_code_url?: string | null;
	privacy_policy_url?: string | null;
	
	// Classification
	os_scope?: 'mobile' | 'desktop' | 'server' | 'embedded' | null;
	kernel_type?: 'linux' | 'bsd' | 'nt' | 'xnu' | 'other' | null;
	base_distribution?: string | null;
	
	// Governance
	governance_model?: 'community' | 'foundation' | 'corporate' | 'hybrid' | null;
	maintainer_org?: string | null;
	funding_model?: string | null;
	
	// Openness
	is_open_source?: boolean | null;
	license?: string | null;
	is_copyleft?: boolean | null;
	
	// Control & Modifiability
	bootloader_unlockable?: 'yes' | 'no' | 'varies' | 'na' | null;
	root_access_available?: boolean | null;
	custom_rom_support?: 'high' | 'medium' | 'low' | 'none' | 'na' | null;
	
	// Software Distribution
	package_manager?: string | null;
	third_party_repos_allowed?: boolean | null;
	sideloading_allowed?: boolean | null;
	
	// Ecosystem Dependencies
	google_services_included?: 'yes' | 'optional' | 'no' | 'na' | null;
	apple_services_dependency?: 'high' | 'medium' | 'low' | 'none' | 'na' | null;
	microsoft_cloud_dependency?: 'high' | 'medium' | 'low' | 'none' | 'na' | null;
	
	// Privacy & Control
	telemetry_default?: 'none' | 'minimal_optin' | 'optout' | 'mandatory' | null;
	telemetry_disableable?: boolean | null;
	cloud_account_required?: boolean | null;
	forced_updates?: boolean | null;
	update_control_level?: 'full' | 'partial' | 'none' | null;
	
	// Security
	network_kill_switch?: boolean | null;
	app_isolation_sandboxing?: 'strong' | 'moderate' | 'weak' | 'none' | null;
	mac_selinux_apparmor?: 'enforcing' | 'permissive' | 'available' | 'none' | null;
	verified_boot?: boolean | null;
	full_disk_encryption?: boolean | null;
	binary_reproducibility?: boolean | null;
	
	// Risk Assessment
	resistance_to_coercion?: 'strong' | 'moderate' | 'weak' | 'none' | null;
	law_enforcement_target_risk?: 'high' | 'medium' | 'low' | null;
	jurisdictional_exposure?: string | null;
	
	// Community & Transparency
	foss_percentage?: number | null; // 0-100
	transparency_level?: 'high' | 'medium' | 'low' | null;
	community_influence?: 'high' | 'medium' | 'low' | 'none' | null;
	
	// User Experience
	privacy_by_default?: boolean | null;
	adware_bloatware?: 'none' | 'removable' | 'permanent' | null;
	
	// GoodPhone Assessment
	tier: 'A_Sovereign' | 'B_Aligned' | 'C_Transitional' | 'D_Extractive';
	tier_rationale?: string | null;
	// Note: Scores standardized to match Services/Apps/Hardware
	// Migration: control_ownership → autonomy, resilience → privacy, human_impact → governance
	scores?: {
		privacy?: number; // 0-4 scale
		autonomy?: number; // 0-4 scale
		transparency?: number; // 0-4 scale
		governance?: number; // 0-4 scale
		overall?: number; // 0-4 scale
	} | null;
	usage_notes?: string | null;
	alternative_recommendations?: string | null;
	last_audit_date?: string | null;
}

export interface BlockOsShowcase {
	id: string;
	headline?: string | null;
	content?: string | null;
}
