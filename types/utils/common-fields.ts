/**
 * Common field types shared across all showcase categories
 */

// Publication status (used by all content types in Directus)
export type PublishStatus = 'draft' | 'published' | 'archived';

// Service/App/Hardware/OS status (lifecycle state)
export type ItemStatus = 'active' | 'deprecated' | 'watch' | 'unknown';

// Assessment tier (used by all categories)
export type AssessmentTier = 'A_Sovereign' | 'B_Aligned' | 'C_Transitional' | 'D_Extractive';

// Recommendation level
export type RecommendationLevel = 'recommended' | 'situational' | 'avoid' | 'compare_only';

// Assessment scores (0-4 scale, standardized across all categories)
export interface AssessmentScores {
	privacy?: 0 | 1 | 2 | 3 | 4 | null;
	autonomy?: 0 | 1 | 2 | 3 | 4 | null;
	transparency?: 0 | 1 | 2 | 3 | 4 | null;
	governance?: 0 | 1 | 2 | 3 | 4 | null;
	overall?: 0 | 1 | 2 | 3 | 4 | null;
}

// Privacy/Encryption levels
export type EncryptionLevel = 'yes' | 'partial' | 'no' | 'unknown';
export type TrackingLevel = 'none' | 'low' | 'moderate' | 'high' | 'unknown';
export type DataPortability = 'strong' | 'partial' | 'weak' | 'unknown';

// Governance models
export type GovernanceModel = 
	| 'corporate' 
	| 'foundation' 
	| 'community_project' 
	| 'community'
	| 'coop' 
	| 'public_sector' 
	| 'hybrid'
	| 'unknown';

// Business models
export type BusinessModel =
	| 'subscription'
	| 'one_time_purchase'
	| 'donation'
	| 'ads'
	| 'data_monetization'
	| 'enterprise'
	| 'mixed'
	| 'unknown';

// Branding assets (M2O to directus_files)
export interface BrandingAssets {
	brand_logo_light?: string | object | null;
	brand_logo_dark?: string | object | null;
	brand_symbol_light?: string | object | null;
	brand_symbol_dark?: string | object | null;
}

// Common URL fields
export interface CommonUrls {
	website_url?: string | null;
	repo_url?: string | null;
	docs_url?: string | null;
	privacy_policy_url?: string | null;
	terms_url?: string | null;
}

// Base metadata fields
export interface BaseMetadata {
	id: string;
	status?: PublishStatus;
	sort?: number | null;
	user_created?: string | null;
	date_created?: string | null;
	user_updated?: string | null;
	date_updated?: string | null;
}
