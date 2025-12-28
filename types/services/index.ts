export interface Service {
	id: string;
	status?: 'draft' | 'published' | 'archived';
	name: string;
	slug: string;
	short_description: string;
	long_description?: string | null;
	website_url?: string | null;
	repo_url?: string | null;
	docs_url?: string | null;
	privacy_policy_url?: string | null;
	terms_url?: string | null;
  icon?: string | null // Brand icon URL (auto-fetched from Brandfetch)
  brand_logo_light?: string | object | null // M2O to directus_files
  brand_logo_dark?: string | object | null // M2O to directus_files
  brand_symbol_light?: string | object | null // M2O to directus_files
  brand_symbol_dark?: string | object | null // M2O to directus_files
	service_status?: 'active' | 'deprecated' | 'watch' | 'unknown';
	license_type?: string | null;
	license_type_client?: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'AGPL-3.0' | 'BSD-3-Clause' | 'MPL-2.0' | 'LGPL-3.0' | 'ISC' | 'EPL-2.0' | 'Proprietary' | 'Mixed' | 'Unknown' | null;
	license_type_server?: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'AGPL-3.0' | 'BSD-3-Clause' | 'MPL-2.0' | 'LGPL-3.0' | 'ISC' | 'EPL-2.0' | 'Proprietary' | 'Mixed' | 'Unknown' | null;
	vendor?: string | null;
	primary_business_model?:
		| 'subscription'
		| 'one_time_purchase'
		| 'donation'
		| 'ads'
		| 'data_monetization'
		| 'enterprise'
		| 'mixed'
		| 'unknown';
	governance_model?: 'corporate' | 'foundation' | 'community_project' | 'coop' | 'public_sector' | 'unknown';
	data_portability?: 'strong' | 'partial' | 'weak' | 'unknown';
	self_hostable?: boolean;
	federated?: boolean;
	end_to_end_encryption?: 'yes' | 'partial' | 'no' | 'unknown';
	default_tracking?: 'none' | 'low' | 'moderate' | 'high' | 'unknown';
	score_privacy?: 0 | 1 | 2 | 3 | 4 | null;
	score_autonomy?: 0 | 1 | 2 | 3 | 4 | null;
	score_transparency?: 0 | 1 | 2 | 3 | 4 | null;
	score_governance?: 0 | 1 | 2 | 3 | 4 | null;
	score_overall?: 0 | 1 | 2 | 3 | 4 | null;
	assessment_tier?: 'A_Sovereign' | 'B_Aligned' | 'C_Transitional' | 'D_Extractive' | null;
	assessment_summary?: string | null;
	assessment_what_it_does?: string | null;
	assessment_why_people_use_it?: string | null;
	assessment_tradeoffs?: string | null;
	assessment_data_and_control?: string | null;
	assessment_governance_and_business?: string | null;
	assessment_goodphone_assessment?: string | null;
	assessment_recommended_use?: 'recommended' | 'situational' | 'avoid' | 'compare_only' | null;
	categories?: ServiceCategoryJunction[];
}

export interface ServiceCategory {
	id: string;
	status?: 'draft' | 'published' | 'archived';
	name: string;
	slug: string;
	description?: string | null;
	risk_profile?: 'low' | 'medium' | 'high' | null;
	order?: number | null;
}

export interface ServiceCategoryJunction {
	id: string;
	services_id: string;
	service_categories_id: string | ServiceCategory;
}

export interface Source {
	id: string;
	status?: 'draft' | 'published' | 'archived';
	title: string;
	url?: string | null;
	publication_date?: string | null;
	author?: string | null;
	publisher?: string | null;
	source_type?: 'article' | 'paper' | 'blog' | 'documentation' | 'whitepaper' | 'video' | 'social' | 'official' | 'other';
	summary?: string | null;
	access_date?: string | null;
}
