export interface App {
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
	icon?: string | null;
	app_status?: 'active' | 'deprecated' | 'watch' | 'unknown';
	is_open_source?: boolean;
	license_type?: string | null;
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
	categories?: AppCategoryJunction[];
	assessments?: AppAssessment[];
}

export interface AppCategory {
	id: string;
	status?: 'draft' | 'published' | 'archived';
	name: string;
	slug: string;
	description?: string | null;
	risk_profile?: 'low' | 'medium' | 'high' | null;
	order?: number | null;
}

export interface AppCategoryJunction {
	id: string;
	apps_id: string;
	app_categories_id: string | AppCategory;
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

export interface AppAssessment {
	id: string;
	status?: 'draft' | 'published' | 'archived';
	app_id: string | App;
	assessment_date?: string | null;
	verdict?: string | null;
	recommendation?: string | null;
	sources?: AppAssessmentSource[];
}

export interface AppAssessmentSource {
	id: string;
	app_assessments_id: string;
	sources_id: string | Source;
}
