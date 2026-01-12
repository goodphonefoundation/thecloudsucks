<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Fetch app details
const { data: app } = await useAsyncData(`app-${slug}`, () => {
	return useDirectus(
		readItems('mobile_apps', {
			fields: [
				'*',
				'assessment_type',
				'categories.mobile_app_categories_id.id',
				'categories.mobile_app_categories_id.name',
				'privacy_assessment',
				'privacy_assessment_notes',
				'ethical_design_assessment',
				'ethical_design_notes',
				'scam_risk_assessment',
				'scam_risk_notes',
				'mental_health_assessment',
				'mental_health_notes',
				'autonomy_assessment',
				'autonomy_assessment_notes',
				'control_ownership_assessment',
				'control_ownership_assessment_notes',
				'human_impact_assessment',
				'human_impact_assessment_notes',
				'resilience_assessment',
				'resilience_assessment_notes',
				'transparency_assessment',
				'transparency_assessment_notes',
				'assessment_overall_score',
				'assessment_completion_date',
				'assessment_version',
				'mobsf_metadata',
				'mobsf_permissions',
				'mobsf_manifest_findings',
				'mobsf_binary_analysis',
				'mobsf_components',
				'mobsf_scan_date',
				'mobsf_security_score',
				'organization.id',
				'organization.name',
				'organization.country',
				'organization.ownership_type',
				'organization.website_url',
				'organization.vendor_information',
				'organization.business_id',
				'organization.business_description',
				'organization.business_logo',
				'organization.linkedin_profile',
				'organization.linkedin_industry_category',
				'organization.naics',
				'organization.naics_description',
				'organization.sic_code',
				'organization.sic_code_description',
				'organization.number_of_employees_range',
				'organization.yearly_revenue_range',
				'organization.ticker',
				'organization.city_name',
				'organization.region_name',
				'organization.street',
				'organization.zip_code',
				'organization.locations_distribution',
				'organization.governance_leadership_concentration',
				'organization.governance_legal_accountability',
				'organization.governance_transparency',
				'organization.governance_stakeholder_representation',
				'organization.governance_succession_planning',
				'organization.governance_funding_transparency',
				'organization.governance_resistance_to_pressure',
				'organization.governance_model',
				'organization.governance_risk_indicators',
				'organization.governance_positive_signals',
				'organization.governance_assessment_notes',
				'organization.governance_assessment_date',
				'organization.governance_assessment_version',
				'organization.governance_overall_score',
				'organization.business_model',
				'organization.funding_transparency',
				'organization.bus_factor_risk',
				'github_governance_assessment.id',
				'github_governance_assessment.repo_url',
				'github_governance_assessment.fork_count',
				'github_governance_assessment.open_issues_count',
				'github_governance_assessment.license',
				'github_governance_assessment.contributor_count_total',
				'github_governance_assessment.contributor_count_period',
				'github_governance_assessment.top_contributor_percentage',
				'github_governance_assessment.has_governance_file',
				'github_governance_assessment.has_code_of_conduct',
				'github_governance_assessment.has_contributing_guide',
				'github_governance_assessment.score_overall',
				'github_governance_assessment.score_contribution_diversity',
				'github_governance_assessment.score_decision_transparency',
				'github_governance_assessment.score_fork_viability',
				'github_governance_assessment.date_updated',
				'github_governance_assessment.ai_summary',
				'feature_values.id',
				'feature_values.feature_id.id',
				'feature_values.feature_id.name',
				'feature_values.feature_id.slug',
				'feature_values.feature_id.data_type',
				'feature_values.feature_id.display_section',
				'feature_values.feature_id.icon',
				'feature_values.value_boolean',
				'feature_values.value_text',
				'feature_values.value_dropdown',
				'feature_values.value_number',
				'feature_values.notes',
				'feature_values.confidence',
			],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'active' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Fetch sources for this app
const { data: sources } = await useAsyncData(`app-sources-${slug}`, async () => {
	if (!app.value) return [];
	return useDirectus(
		readItems('mobile_app_sources', {
			fields: ['*'],
			filter: {
				mobile_app: { _eq: app.value.id },
				status: { _eq: 'published' },
			},
			sort: ['-date_published', 'title'],
		}),
	);
});

// Fetch change logs for this app
const { data: changeLogs } = await useAsyncData(`app-changelog-${slug}`, async () => {
	if (!app.value) return [];
	return useDirectus(
		readItems('mobile_app_change_log', {
			fields: ['*'],
			filter: {
				mobile_app: { _eq: app.value.id },
				status: { _eq: 'published' },
			},
			sort: ['-date'],
		}),
	);
});

// Fetch alternative apps in the same categories
const { data: alternatives } = await useAsyncData(`app-alternatives-${slug}`, async () => {
	if (!app.value || !app.value.categories || app.value.categories.length === 0) return [];
	
	// Get category IDs
	const categoryIds = app.value.categories.map((cat: any) => cat.mobile_app_categories_id.id);
	
	return useDirectus(
		readItems('mobile_apps', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'app_icon_light',
				'tier',
				'categories.mobile_app_categories_id.id',
				'categories.mobile_app_categories_id.name',
				'feature_values.feature_id.slug',
				'feature_values.value_boolean',
				'feature_values.value_dropdown',
			],
			filter: {
				status: { _eq: 'active' },
				id: { _neq: app.value.id },
				categories: {
					mobile_app_categories_id: {
						id: { _in: categoryIds },
					},
				},
			},
			sort: ['name'],
			limit: 6,
		}),
	);
});

// If app not found, show 404
if (!app.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'App Not Found',
	});
}

// SEO
useHead({
	title: app.value.name,
	meta: [
		{
			name: 'description',
			content: app.value.short_description || '',
		},
	],
});

// Helper functions
const formatField = (value: any) => {
	if (value === null || value === undefined) return 'Unknown';
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';
	if (typeof value === 'string') return value.replace(/_/g, ' ');
	return value;
};

// Helper to format tier label
const getTierLabel = (tier: string | null | undefined) => {
	if (!tier) return null;
	const labels: Record<string, string> = {
		A_Sovereign: 'Tier A – Recommended',
		B_Aligned: 'Tier B – Generally Good',
		C_Transitional: 'Tier C – Use with Caution',
		D_Extractive: 'Tier D – Avoid',
	};
	return labels[tier] || tier;
};

// Helper to get tier description
const getTierDescription = (tier: string | null | undefined) => {
	if (!tier) return null;
	const descriptions: Record<string, string> = {
		A_Sovereign: 'Tools that put users in control. These products respect privacy, give users real choices, and avoid unnecessary lock-in. Data can be accessed, moved, or self-hosted, and the system is transparent enough to trust over time.',
		B_Aligned: 'Tools that work well but have some limitations. These options follow good practices and avoid major harms, but still rely on some centralized control or impose moderate exit costs. They are reasonable choices for most people today.',
		C_Transitional: 'Tools that improve on mainstream platforms but still constrain users. These products make efforts toward better privacy or openness, but meaningful lock-in, gatekeeping, or dependency remains. They may be acceptable in some contexts, but trade-offs are significant.',
		D_Extractive: 'Tools that primarily benefit the platform, not the user. These systems rely on surveillance, restrictive control, or dependency. Users have little transparency or ability to leave without loss. They represent the extractive end of the ecosystem.',
	};
	return descriptions[tier] || null;
};

// Helper to format recommendation label
const getRecommendationLabel = (rec: string | null | undefined) => {
	if (!rec) return null;
	const labels: Record<string, string> = {
		recommended: 'Recommended',
		situational: 'Situational',
		avoid: 'Avoid',
		compare_only: 'Compare Only',
	};
	return labels[rec] || rec;
};

// Markdown rendering
const { toHtml } = useMarkdown();
const tradeoffsHtml = computed(() => toHtml(app.value?.tradeoffs));
const longDescriptionHtml = computed(() => toHtml(app.value?.long_description));

// Assessment data parsing
const hasAssessment = computed(() => {
	return app.value?.assessment_overall_score !== null && app.value?.assessment_overall_score !== undefined;
});

const privacySubcomponents = computed(() => {
	if (!app.value?.privacy_assessment) return [];
	const assessment = typeof app.value.privacy_assessment === 'string' 
		? JSON.parse(app.value.privacy_assessment) 
		: app.value.privacy_assessment;
	return [
		{ label: 'Data Minimization', score: assessment.data_minimization || 0, maxScore: 5 },
		{ label: 'Transparency', score: assessment.transparency || 0, maxScore: 5 },
		{ label: 'User Control', score: assessment.user_control || 0, maxScore: 5 },
		{ label: 'Security Posture', score: assessment.security_posture || 0, maxScore: 5 },
		{ label: 'Sharing Practices', score: assessment.sharing_practices || 0, maxScore: 5 },
		{ label: 'Compliance', score: assessment.compliance || 0, maxScore: 5 },
	];
});

const ethicalDesignSubcomponents = computed(() => {
	if (!app.value?.ethical_design_assessment) return [];
	const assessment = typeof app.value.ethical_design_assessment === 'string' 
		? JSON.parse(app.value.ethical_design_assessment) 
		: app.value.ethical_design_assessment;
	return [
		{ label: 'Algorithmic Fairness', score: assessment.algorithmic_fairness || 0, maxScore: 5 },
		{ label: 'Informed Consent', score: assessment.informed_consent_quality || 0, maxScore: 5 },
		{ label: 'Safety Protocols', score: assessment.safety_protocols || 0, maxScore: 5 },
		{ label: 'Accountability', score: assessment.developer_accountability || 0, maxScore: 5 },
		{ label: 'Dark Pattern Avoidance', score: assessment.dark_pattern_avoidance || 0, maxScore: 5 },
	];
});

const scamRiskSubcomponents = computed(() => {
	if (!app.value?.scam_risk_assessment) return [];
	const assessment = typeof app.value.scam_risk_assessment === 'string' 
		? JSON.parse(app.value.scam_risk_assessment) 
		: app.value.scam_risk_assessment;
	return [
		{ label: 'Monetization Ethics', score: assessment.monetization_ethics || 0, maxScore: 5 },
		{ label: 'Content Authenticity', score: assessment.content_authenticity || 0, maxScore: 5 },
		{ label: 'Refund Clarity', score: assessment.withdrawal_refund_clarity || 0, maxScore: 5 },
		{ label: 'Reputation History', score: assessment.reputation_history || 0, maxScore: 5 },
		{ label: 'Review Reliability', score: assessment.user_review_reliability || 0, maxScore: 5 },
	];
});

const mentalHealthSubcomponents = computed(() => {
	if (!app.value?.mental_health_assessment) return [];
	const assessment = typeof app.value.mental_health_assessment === 'string' 
		? JSON.parse(app.value.mental_health_assessment) 
		: app.value.mental_health_assessment;
	return [
		{ label: 'Low Addiction Risk', score: assessment.addiction_risk || 0, maxScore: 5 },
		{ label: 'Harmful Content Protection', score: assessment.harmful_content_exposure || 0, maxScore: 5 },
		{ label: 'Positive Impact', score: assessment.positive_impact_features || 0, maxScore: 5 },
		{ label: 'Age-Appropriate Design', score: assessment.age_appropriate_design || 0, maxScore: 5 },
	];
});

const privacyScore = computed(() => {
	return privacySubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

const ethicalDesignScore = computed(() => {
	return ethicalDesignSubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

const scamRiskScore = computed(() => {
	return scamRiskSubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

const mentalHealthScore = computed(() => {
	return mentalHealthSubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

// New Assessment Dimensions
const autonomySubcomponents = computed(() => {
	if (!app.value?.autonomy_assessment) return [];
	const assessment = typeof app.value.autonomy_assessment === 'string' 
		? JSON.parse(app.value.autonomy_assessment) 
		: app.value.autonomy_assessment;
	return [
		{ label: 'Vendor Lock-in Freedom', score: assessment.vendor_lock_in || 0, maxScore: 5 },
		{ label: 'Platform Independence', score: assessment.platform_independence || 0, maxScore: 5 },
		{ label: 'Data Portability', score: assessment.data_portability || 0, maxScore: 5 },
		{ label: 'Alternative Choices', score: assessment.alternative_choices || 0, maxScore: 5 },
		{ label: 'Minimal Dependencies', score: assessment.forced_dependencies || 0, maxScore: 5 },
	];
});

const controlOwnershipSubcomponents = computed(() => {
	if (!app.value?.control_ownership_assessment) return [];
	const assessment = typeof app.value.control_ownership_assessment === 'string' 
		? JSON.parse(app.value.control_ownership_assessment) 
		: app.value.control_ownership_assessment;
	return [
		{ label: 'Data Ownership Rights', score: assessment.data_ownership_rights || 0, maxScore: 5 },
		{ label: 'Access Control', score: assessment.access_control || 0, maxScore: 5 },
		{ label: 'Deletion Rights', score: assessment.deletion_rights || 0, maxScore: 5 },
		{ label: 'Modification Control', score: assessment.modification_control || 0, maxScore: 5 },
		{ label: 'Identity Control', score: assessment.identity_control || 0, maxScore: 5 },
		{ label: 'Intellectual Property', score: assessment.intellectual_property || 0, maxScore: 5 },
	];
});

const humanImpactSubcomponents = computed(() => {
	if (!app.value?.human_impact_assessment) return [];
	const assessment = typeof app.value.human_impact_assessment === 'string' 
		? JSON.parse(app.value.human_impact_assessment) 
		: app.value.human_impact_assessment;
	return [
		{ label: 'Human Rights Support', score: assessment.human_rights_support || 0, maxScore: 5 },
		{ label: 'Accessibility', score: assessment.accessibility || 0, maxScore: 5 },
		{ label: 'Digital Wellbeing', score: assessment.digital_wellbeing || 0, maxScore: 5 },
		{ label: 'Community Benefit', score: assessment.community_benefit || 0, maxScore: 5 },
		{ label: 'Environmental Impact', score: assessment.environmental_impact || 0, maxScore: 5 },
	];
});

const resilienceSubcomponents = computed(() => {
	if (!app.value?.resilience_assessment) return [];
	const assessment = typeof app.value.resilience_assessment === 'string' 
		? JSON.parse(app.value.resilience_assessment) 
		: app.value.resilience_assessment;
	return [
		{ label: 'Technical Resilience', score: assessment.technical_resilience || 0, maxScore: 5 },
		{ label: 'Organizational Resilience', score: assessment.organizational_resilience || 0, maxScore: 5 },
		{ label: 'Community Resilience', score: assessment.community_resilience || 0, maxScore: 5 },
		{ label: 'Financial Resilience', score: assessment.financial_resilience || 0, maxScore: 5 },
		{ label: 'Governance Resilience', score: assessment.governance_resilience || 0, maxScore: 5 },
		{ label: 'Fork Viability', score: assessment.fork_viability || 0, maxScore: 5 },
	];
});

const transparencySubcomponents = computed(() => {
	if (!app.value?.transparency_assessment) return [];
	const assessment = typeof app.value.transparency_assessment === 'string' 
		? JSON.parse(app.value.transparency_assessment) 
		: app.value.transparency_assessment;
	return [
		{ label: 'Code Transparency', score: assessment.code_transparency || 0, maxScore: 5 },
		{ label: 'Operational Transparency', score: assessment.operational_transparency || 0, maxScore: 5 },
		{ label: 'Financial Transparency', score: assessment.financial_transparency || 0, maxScore: 5 },
		{ label: 'Governance Transparency', score: assessment.governance_transparency || 0, maxScore: 5 },
		{ label: 'Data Practice Transparency', score: assessment.data_practice_transparency || 0, maxScore: 5 },
		{ label: 'Audit Transparency', score: assessment.audit_transparency || 0, maxScore: 5 },
	];
});

const autonomyScore = computed(() => {
	return autonomySubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

const controlOwnershipScore = computed(() => {
	return controlOwnershipSubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

const humanImpactScore = computed(() => {
	return humanImpactSubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

const resilienceScore = computed(() => {
	return resilienceSubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

const transparencyScore = computed(() => {
	return transparencySubcomponents.value.reduce((sum, item) => sum + (item.score || 0), 0);
});

// Feature grouping computed property
const featuresBySection = computed(() => {
	if (!app.value?.feature_values) return {};
	
	const grouped: Record<string, Array<{ feature: any; value: any }>> = {};
	
	app.value.feature_values.forEach((fv: any) => {
		if (!fv.feature_id) return;
		
		const section = fv.feature_id.display_section || 'other';
		
		if (!grouped[section]) {
			grouped[section] = [];
		}
		
		grouped[section].push({
			feature: fv.feature_id,
			value: {
				id: fv.id,
				value_boolean: fv.value_boolean,
				value_text: fv.value_text,
				value_dropdown: fv.value_dropdown,
				value_number: fv.value_number,
				notes: fv.notes,
				confidence: fv.confidence,
			},
		});
	});
	
	return grouped;
});

const getSectionTitle = (section: string) => {
	const titles: Record<string, string> = {
		privacy_security: 'Privacy & Security',
		technical: 'Technical',
		user_experience: 'User Experience',
		other: 'Other',
	};
	return titles[section] || section;
};

// Tab state
const activeTab = ref('overview');
</script>

<template>
	<BlockContainer v-if="app">
		<!-- Header Section -->
		<div class="mb-8">
			<NuxtLink
				to="/apps"
				class="inline-flex items-center text-sm text-primary hover:underline mb-6"
			>
				← Back to Apps
			</NuxtLink>
			
			<!-- App Icon (centered square) -->
			<div v-if="app.app_icon_light || app.app_icon_dark" class="mb-6 flex items-center justify-center">
				<div class="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
					<img 
						:src="`/api/proxy/assets/${app.app_icon_dark || app.app_icon_light}`" 
						:alt="app.name" 
						class="w-full h-full object-cover dark:hidden" 
					/>
					<img 
						:src="`/api/proxy/assets/${app.app_icon_light || app.app_icon_dark}`" 
						:alt="app.name" 
						class="w-full h-full object-cover hidden dark:block" 
					/>
				</div>
			</div>
			
			<div>
				<h1 class="text-4xl font-bold mb-3 text-gray-900 dark:text-white text-center">{{ app.name }}</h1>
				<p v-if="app.organization?.name" class="text-xl text-gray-600 dark:text-gray-400 mb-2 text-center">
					by 
					<NuxtLink 
						v-if="app.organization.website_url" 
						:to="app.organization.website_url" 
						target="_blank"
						class="hover:text-primary"
					>
						{{ app.organization.name }}
					</NuxtLink>
					<span v-else>{{ app.organization.name }}</span>
				</p>
				<p v-else-if="app.developer_name" class="text-xl text-gray-600 dark:text-gray-400 mb-2 text-center">
					by {{ app.developer_name }}
				</p>
				<p class="text-xl text-gray-600 dark:text-gray-400 mb-4 text-center">
					{{ app.short_description }}
				</p>
				
				<!-- Main Badges -->
				<div class="flex flex-wrap gap-2 justify-center">
					<span
						v-if="app.category"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 capitalize"
					>
						{{ formatField(app.category) }}
					</span>
					<span
						v-if="!app.requires_phone_number"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						No Phone Required
					</span>
					<span
						v-if="app.tier"
						:class="[
							'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full',
							app.tier === 'A_Sovereign' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
							app.tier === 'B_Aligned' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
							app.tier === 'C_Transitional' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
							app.tier === 'D_Extractive' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
						]"
					>
						{{ getTierLabel(app.tier) }}
					</span>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3 mb-8 pb-8 border-b dark:border-gray-700 justify-center">
			<UButton
				v-if="app.website_url"
				:to="app.website_url"
				target="_blank"
				color="primary"
				size="lg"
				icon="i-mdi-open-in-new"
			>
				Visit Website
			</UButton>
			<UButton
				v-if="app.android_url"
				:to="app.android_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-google-play"
			>
				Play Store
			</UButton>
			<UButton
				v-if="app.ios_url"
				:to="app.ios_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-apple"
			>
				App Store
			</UButton>
			<UButton
				v-if="app.repo_url"
				:to="app.repo_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-github"
			>
				Source Code
			</UButton>
		</div>

		<!-- Tab Navigation -->
		<div class="border-b dark:border-gray-700 mb-8">
			<nav class="flex gap-8" aria-label="Tabs">
				<button
					@click="activeTab = 'overview'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'overview'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Overview
				</button>
				<button
					@click="activeTab = 'changelog'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'changelog'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Change Log
					<span v-if="changeLogs && changeLogs.length" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
						{{ changeLogs.length }}
					</span>
				</button>
				<button
					v-if="app.github_governance_assessment"
					@click="activeTab = 'github'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'github'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					GitHub Analysis
				</button>
				<button
					@click="activeTab = 'sources'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'sources'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Sources
					<span v-if="sources && sources.length" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
						{{ sources.length }}
					</span>
				</button>
				<button
					@click="activeTab = 'alternatives'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'alternatives'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Alternatives
					<span v-if="alternatives && alternatives.length" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
						{{ alternatives.length }}
					</span>
				</button>
				<button
					v-if="app.organization"
					@click="activeTab = 'organization'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'organization'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Organization
				</button>
				<button
					@click="activeTab = 'technical'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'technical'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Technical Details
				</button>
				<button
					v-if="app.mobsf_metadata"
					@click="activeTab = 'security'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'security'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Security Report
					<span v-if="app.mobsf_security_score !== null" class="ml-2 px-2 py-0.5 text-xs rounded-full" :class="[
						app.mobsf_security_score >= 80 ? 'bg-red-200 dark:bg-red-900' :
						app.mobsf_security_score >= 50 ? 'bg-yellow-200 dark:bg-yellow-900' :
						'bg-green-200 dark:bg-green-900'
					]">
						{{ app.mobsf_security_score }}
					</span>
				</button>
			</nav>
		</div>

		<!-- Overview Tab Content -->
		<div v-show="activeTab === 'overview'">
		<!-- Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-8">
				<!-- About -->
				<div v-if="longDescriptionHtml">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About</h2>
					<TypographyProse :content="longDescriptionHtml" />
				</div>

				<!-- Why People Use It -->
				<div v-if="app.why_people_use_it">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Why People Use It</h2>
					<p class="text-gray-700 dark:text-gray-300">{{ app.why_people_use_it }}</p>
				</div>

				<!-- Tradeoffs -->
				<div v-if="tradeoffsHtml">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tradeoffs</h2>
					<TypographyProse :content="tradeoffsHtml" />
				</div>

				<!-- Screenshots -->
				<div v-if="app.playstore_screenshots && app.playstore_screenshots.length">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Screenshots</h2>
					<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
						<a
							v-for="(screenshot, index) in app.playstore_screenshots"
							:key="index"
							:href="screenshot"
							target="_blank"
							class="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
						>
							<img
								:src="screenshot"
								:alt="`${app.name} screenshot ${index + 1}`"
								class="w-full h-auto object-cover aspect-[9/16] group-hover:scale-105 transition-transform duration-200"
								loading="lazy"
							/>
							<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
								<span class="opacity-0 group-hover:opacity-100 text-white text-sm font-medium">View Full Size</span>
							</div>
						</a>
					</div>
				</div>

				<!-- Assessment -->
				<div>
					<div class="border dark:border-gray-700 rounded-lg p-6">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Brax Guide Recommendation</h2>
						<div class="mb-2">
							<span
								v-if="app.brax_recommended_use"
								:class="[
									'inline-flex items-center px-3 py-1.5 text-base font-semibold rounded-lg',
									app.brax_recommended_use === 'A_Sovereign' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
									app.brax_recommended_use === 'B_Aligned' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
									app.brax_recommended_use === 'C_Transitional' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
									app.brax_recommended_use === 'D_Extractive' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								]"
							>
								{{ getTierLabel(app.brax_recommended_use) }}
							</span>
						<span v-else class="inline-flex items-center px-3 py-1.5 text-base font-semibold rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
								Not Assessed
							</span>
						</div>
						<p v-if="getTierDescription(app.brax_recommended_use)" class="mt-3 text-sm text-gray-600 dark:text-gray-400 italic">{{ getTierDescription(app.brax_recommended_use) }}</p>
						<p v-if="app.summary" class="mt-4 text-gray-700 dark:text-gray-300">{{ app.summary }}</p>
						<p v-else class="mt-4 text-gray-600 dark:text-gray-400 italic">No assessment summary available</p>
						
						<!-- Assessment Context -->
						<div v-if="app.assessment_type || app.audience_level || app.confidence" class="mt-6 pt-6 border-t dark:border-gray-700">
							<h3 class="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Assessment Context</h3>
							<div v-if="app.assessment_type" class="mb-4">
								<AssessmentTypeBadge :assessment-type="app.assessment_type" />
							</div>
							<dl class="grid grid-cols-2 gap-4 text-sm">
								<div v-if="app.audience_level">
									<dt class="font-medium text-gray-700 dark:text-gray-300">Audience Level</dt>
									<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.audience_level) }}</dd>
								</div>
								<div v-if="app.confidence">
									<dt class="font-medium text-gray-700 dark:text-gray-300">Confidence</dt>
									<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.confidence) }}</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>

				<!-- Comprehensive Assessment Framework -->
				<div v-if="hasAssessment" class="space-y-6">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Comprehensive Assessment</h2>
					
					<!-- Overall Score Card -->
					<AssessmentScoreCard
						:overall-score="app.assessment_overall_score"
						:privacy-score="privacyScore"
						:ethical-design-score="ethicalDesignScore"
						:scam-risk-score="scamRiskScore"
						:mental-health-score="mentalHealthScore"
						:autonomy-score="autonomyScore"
						:control-ownership-score="controlOwnershipScore"
						:transparency-score="transparencyScore"
						:resilience-score="resilienceScore"
						:human-impact-score="humanImpactScore"
						:assessment-date="app.assessment_completion_date"
						:assessment-version="app.assessment_version"
					/>
					
					<!-- Dimension Details -->
					<div class="space-y-4">
						<AssessmentDimensionDetail
							v-if="privacySubcomponents.length"
							title="Privacy Protection"
							:total-score="privacyScore"
							:max-total="30"
							:subcomponents="privacySubcomponents"
							:notes="app.privacy_assessment_notes"
							:default-expanded="false"
						/>
						
						<AssessmentDimensionDetail
							v-if="ethicalDesignSubcomponents.length"
							title="Ethical Design & Governance"
							:total-score="ethicalDesignScore"
							:max-total="25"
							:subcomponents="ethicalDesignSubcomponents"
							:notes="app.ethical_design_notes"
							:default-expanded="false"
						/>
						
						<AssessmentDimensionDetail
							v-if="scamRiskSubcomponents.length"
							title="Scam & Manipulation Risk"
							:total-score="scamRiskScore"
							:max-total="25"
							:subcomponents="scamRiskSubcomponents"
							:notes="app.scam_risk_notes"
							:default-expanded="false"
						/>
						
						<AssessmentDimensionDetail
							v-if="mentalHealthSubcomponents.length"
							title="Mental Health Impact"
							:total-score="mentalHealthScore"
							:max-total="20"
							:subcomponents="mentalHealthSubcomponents"
							:notes="app.mental_health_notes"
							:default-expanded="false"
						/>
						
					<AssessmentDimensionDetail
						title="Autonomy"
						:total-score="autonomyScore"
						:max-total="25"
						:subcomponents="autonomySubcomponents"
						:notes="app.autonomy_assessment_notes"
						:default-expanded="false"
					/>
					
					<AssessmentDimensionDetail
						title="Control & Ownership"
						:total-score="controlOwnershipScore"
						:max-total="30"
						:subcomponents="controlOwnershipSubcomponents"
						:notes="app.control_ownership_assessment_notes"
						:default-expanded="false"
					/>
					
					<AssessmentDimensionDetail
						title="Human Impact"
						:total-score="humanImpactScore"
						:max-total="25"
						:subcomponents="humanImpactSubcomponents"
						:notes="app.human_impact_assessment_notes"
						:default-expanded="false"
					/>
					
					<AssessmentDimensionDetail
						title="Resilience"
						:total-score="resilienceScore"
						:max-total="30"
						:subcomponents="resilienceSubcomponents"
						:notes="app.resilience_assessment_notes"
						:default-expanded="false"
					/>
					
					<AssessmentDimensionDetail
						title="Transparency"
						:total-score="transparencyScore"
						:max-total="30"
						:subcomponents="transparencySubcomponents"
						:notes="app.transparency_assessment_notes"
						:default-expanded="false"
					/>
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Organization Card -->
				<OrganizationCard v-if="app.organization" :organization="app.organization" />
				<!-- Platform Support -->
				<div v-if="app.platforms_supported" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Platforms</h3>
					<div class="space-y-2">
						<div v-if="app.platforms_supported.includes('android')" class="flex items-center gap-2">
							<span class="text-green-500">✓</span>
							<span>Android</span>
						</div>
						<div v-if="app.platforms_supported.includes('ios')" class="flex items-center gap-2">
							<span class="text-green-500">✓</span>
							<span>iOS</span>
						</div>
					</div>
				</div>

				<!-- Dynamic Features by Section -->
				<div 
					v-for="(features, section) in featuresBySection" 
					:key="section" 
					class="border dark:border-gray-700 rounded-lg p-6"
				>
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{{ getSectionTitle(section) }}</h3>
					<dl class="space-y-3 text-sm">
						<FeaturesFeatureDisplay
							v-for="item in features"
							:key="item.value.id"
							:feature="item.feature"
							:value="item.value"
						/>
					</dl>
				</div>

				<!-- App Metadata -->
				<div v-if="app.cloud_dependency || app.app_store_dependency || app.alternative_distribution?.length || app.replaces?.length" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">App Metadata</h3>
					<dl class="space-y-3 text-sm">
						<template v-if="app.cloud_dependency">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Cloud Dependency</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.cloud_dependency) }}</dd>
						</template>
						<template v-if="app.app_store_dependency">
							<dt class="font-medium text-gray-700 dark:text-gray-300">App Store</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.app_store_dependency) }}</dd>
						</template>
						<template v-if="app.alternative_distribution?.length">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Alternative Distribution</dt>
							<dd class="text-gray-600 dark:text-gray-400">
								<span v-for="(dist, index) in app.alternative_distribution" :key="index">
									{{ formatField(dist) }}<span v-if="index < app.alternative_distribution.length - 1">, </span>
								</span>
							</dd>
						</template>
						<template v-if="app.replaces?.length">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Replaces</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ app.replaces.join(', ') }}</dd>
						</template>
					</dl>
				</div>


				<!-- Metadata -->
				<div v-if="app.license || app.funding_model" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Details</h3>
					<dl class="space-y-3 text-sm">
						<template v-if="app.license">
							<dt class="font-medium text-gray-700 dark:text-gray-300">License</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ app.license }}</dd>
						</template>
						<template v-if="app.funding_model">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Funding Model</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.funding_model) }}</dd>
						</template>
					</dl>
				</div>
			</div>
		</div>
		</div>


		<!-- Change Log Tab Content -->
		<div v-show="activeTab === 'changelog'">
			<div v-if="changeLogs && changeLogs.length > 0" class="space-y-4">
				<div v-for="log in changeLogs" :key="log.id" class="border rounded-lg p-6 dark:border-gray-700">
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<h3 class="text-lg font-bold">{{ log.title }}</h3>
								<span
									v-if="log.impact"
									:class="[
										'px-2 py-1 text-xs font-medium rounded-full capitalize',
										log.impact === 'positive' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
										log.impact === 'negative' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
										log.impact === 'neutral' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
									]"
								>
									{{ log.impact }}
								</span>
							</div>
							<p v-if="log.date" class="text-sm text-gray-500 dark:text-gray-400">
								{{ new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
							</p>
						</div>
					</div>
					<div v-if="log.description" class="prose dark:prose-invert max-w-none text-sm" v-html="log.description"></div>
					<a
						v-if="log.source_url"
						:href="log.source_url"
						target="_blank"
						class="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
					>
						Source
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
						</svg>
					</a>
				</div>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No change log entries available for this app.</p>
			</div>
		</div>

		<!-- GitHub Analysis Tab Content -->
		<div v-show="activeTab === 'github'">
			<div v-if="app.github_governance_assessment" class="space-y-6">
				<!-- Repository Overview -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Repository Overview</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Contributors (Total)</div>
							<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.github_governance_assessment.contributor_count_total?.toLocaleString() || 'N/A' }}</div>
						</div>
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Forks</div>
							<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.github_governance_assessment.fork_count?.toLocaleString() || 'N/A' }}</div>
						</div>
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Open Issues</div>
							<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.github_governance_assessment.open_issues_count?.toLocaleString() || 'N/A' }}</div>
						</div>
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">License</div>
							<div class="text-lg font-bold text-gray-900 dark:text-white">{{ app.github_governance_assessment.license || 'Unknown' }}</div>
						</div>
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Top Contributor %</div>
							<div class="text-lg font-bold text-gray-900 dark:text-white">{{ app.github_governance_assessment.top_contributor_percentage ? Number(app.github_governance_assessment.top_contributor_percentage).toFixed(1) : 'N/A' }}%</div>
						</div>
					</div>
					<div v-if="app.github_governance_assessment.repo_url" class="mt-4">
						<a :href="app.github_governance_assessment.repo_url" target="_blank" class="inline-flex items-center gap-2 text-primary hover:underline">
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
							</svg>
							View Repository
						</a>
					</div>
				</div>

				<!-- Governance Scores -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Governance Assessment</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Overall Score</div>
							<div class="text-3xl font-bold" :class="[
								app.github_governance_assessment.score_overall >= 3 ? 'text-green-600 dark:text-green-400' :
								app.github_governance_assessment.score_overall >= 2 ? 'text-yellow-600 dark:text-yellow-400' :
								'text-red-600 dark:text-red-400'
							]">
								{{ app.github_governance_assessment.score_overall || 'N/A' }}
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 4</div>
						</div>
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Contribution Diversity</div>
							<div class="text-lg font-semibold text-gray-900 dark:text-white">
								{{ app.github_governance_assessment.score_contribution_diversity || 'N/A' }} / 4
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Higher is better</div>
						</div>
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Decision Transparency</div>
							<div class="text-lg font-semibold text-gray-900 dark:text-white">
								{{ app.github_governance_assessment.score_decision_transparency || 'N/A' }} / 4
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Higher is better</div>
						</div>
						<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Fork Viability</div>
							<div class="text-lg font-semibold text-gray-900 dark:text-white">
								{{ app.github_governance_assessment.score_fork_viability || 'N/A' }} / 4
							</div>
							<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Higher is better</div>
						</div>
					</div>
				</div>

				<!-- Analysis Summary -->
				<div v-if="app.github_governance_assessment.ai_summary" class="border rounded-lg p-6 dark:border-gray-700">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI-Generated Summary</h2>
					<div class="prose dark:prose-invert max-w-none">
						<p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ app.github_governance_assessment.ai_summary }}</p>
					</div>
				</div>

				<!-- Repository Features -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Repository Features</h2>
					<div class="flex flex-wrap gap-3">
						<span v-if="app.github_governance_assessment.has_governance_file" class="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
							<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							Governance File
						</span>
						<span v-if="app.github_governance_assessment.has_code_of_conduct" class="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
							<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							Code of Conduct
						</span>
						<span v-if="app.github_governance_assessment.has_contributing_guide" class="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
							<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							Contributing Guide
						</span>
					</div>
				</div>

				<!-- Last Updated -->
				<div v-if="app.github_governance_assessment.date_updated" class="text-sm text-gray-500 dark:text-gray-400 text-center">
					Analysis last updated: {{ new Date(app.github_governance_assessment.date_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
				</div>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No GitHub governance data available for this app.</p>
			</div>
		</div>

		<!-- Sources Tab Content -->
		<div v-show="activeTab === 'sources'">
			<div v-if="sources && sources.length > 0" class="space-y-4">
				<div v-for="source in sources" :key="source.id" class="border rounded-lg p-6 dark:border-gray-700">
					<div class="flex items-start justify-between mb-2">
						<h3 class="text-lg font-bold">{{ source.title }}</h3>
						<span
							v-if="source.type"
							class="px-2 py-1 text-xs font-medium rounded-full capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							{{ source.type }}
						</span>
					</div>
					<div class="space-y-2 text-sm">
						<p v-if="source.publisher" class="text-gray-600 dark:text-gray-400">
							<span class="font-medium">Publisher:</span> {{ source.publisher }}
						</p>
						<p v-if="source.date_published" class="text-gray-600 dark:text-gray-400">
							<span class="font-medium">Published:</span>
							{{ new Date(source.date_published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
						</p>
						<p v-if="source.quote" class="text-gray-700 dark:text-gray-300 italic border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3">
							"{{ source.quote }}"
						</p>
						<p v-if="source.notes" class="text-gray-600 dark:text-gray-400">
							{{ source.notes }}
						</p>
						<a
							v-if="source.url"
							:href="source.url"
							target="_blank"
							class="inline-flex items-center gap-1 text-primary hover:underline mt-2"
						>
							View Source
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
							</svg>
						</a>
					</div>
				</div>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No sources available for this app.</p>
			</div>
		</div>

		<!-- Alternatives Tab Content -->
		<div v-show="activeTab === 'alternatives'">
			<div v-if="alternatives && alternatives.length > 0" class="grid md:grid-cols-2 gap-6">
				<NuxtLink 
					v-for="alt in alternatives" 
					:key="alt.id" 
					:to="`/apps/${alt.slug}`"
					class="border rounded-lg p-6 hover:shadow-lg transition-shadow dark:border-gray-700 hover:border-primary dark:hover:border-primary"
				>
					<div class="flex items-start gap-4 mb-4">
						<div v-if="alt.app_icon_light" class="flex-shrink-0">
							<img 
								:src="`/api/proxy/assets/${alt.app_icon_light}`" 
								:alt="alt.name" 
								class="w-16 h-16 rounded-lg object-contain" 
							/>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 mb-2">
								<h3 class="text-xl font-semibold">{{ alt.name }}</h3>
								<span v-if="alt.tier" :class="[
									'px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap flex-shrink-0',
									alt.tier === 'A_Sovereign' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
									alt.tier === 'B_Aligned' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
									alt.tier === 'C_Transitional' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
									alt.tier === 'D_Extractive' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								]">
									{{ getTierLabel(alt.tier) }}
								</span>
							</div>
							<div class="flex flex-wrap gap-2">
								<template v-for="fv in alt.feature_values" :key="fv.feature_id?.slug">
									<span
										v-if="fv.feature_id?.slug === 'is_open_source' && fv.value_boolean"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
									>
										Open Source
									</span>
									<span
										v-if="fv.feature_id?.slug === 'e2e_encryption' && fv.value_dropdown === 'yes'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									>
										E2E Encrypted
									</span>
									<span
										v-if="fv.feature_id?.slug === 'requires_phone_number' && !fv.value_boolean"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
									>
										No Phone Required
									</span>
								</template>
							</div>
						</div>
					</div>
					<p class="text-gray-600 dark:text-gray-400 text-sm">{{ alt.short_description }}</p>
					<div v-if="alt.categories && alt.categories.length" class="mt-4 flex flex-wrap gap-2">
						<span
							v-for="cat in alt.categories.slice(0, 3)"
							:key="cat.id"
							class="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800"
						>
							{{ cat.mobile_app_categories_id.name }}
						</span>
					</div>
				</NuxtLink>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No alternative apps found in the same categories.</p>
			</div>
		</div>

		<!-- Organization Tab Content -->
		<div v-show="activeTab === 'organization' && app.organization">
			<div class="max-w-4xl">
				<OrganizationCard :organization="app.organization" variant="full" />
				
				<!-- Governance Assessment -->
				<div v-if="app.organization?.governance_overall_score !== null && app.organization?.governance_overall_score !== undefined" class="mt-6 space-y-6">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Leadership & Governance Assessment</h2>
					
					<!-- Overall Score Card -->
					<div class="border rounded-lg p-6 dark:border-gray-700">
						<div class="flex items-center justify-between mb-4">
							<div>
								<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Overall Governance Score</h3>
								<p v-if="app.organization.governance_model" class="text-sm text-gray-600 dark:text-gray-400">{{ app.organization.governance_model }}</p>
							</div>
							<div class="text-right">
								<div class="text-4xl font-bold" :class="[
									app.organization.governance_overall_score >= 21 ? 'text-green-600 dark:text-green-400' :
									app.organization.governance_overall_score >= 14 ? 'text-yellow-600 dark:text-yellow-400' :
									'text-red-600 dark:text-red-400'
								]">
									{{ app.organization.governance_overall_score }}
								</div>
								<div class="text-sm text-gray-600 dark:text-gray-400">out of 28</div>
								<div v-if="app.organization.governance_assessment_date" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
									Assessed: {{ new Date(app.organization.governance_assessment_date).toLocaleDateString() }}
								</div>
							</div>
						</div>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Governance assessment measures structural safeguards against capture, coercion, and abuse of power.
						</p>
					</div>

					<!-- Governance Dimensions -->
					<div class="border rounded-lg p-6 dark:border-gray-700">
						<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Governance Dimensions</h3>
						<div class="grid md:grid-cols-2 gap-4">
							<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Leadership Concentration</div>
								<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.organization.governance_leadership_concentration ?? 'N/A' }} / 4</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Decision-making authority distribution</div>
							</div>
							<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Legal Accountability</div>
								<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.organization.governance_legal_accountability ?? 'N/A' }} / 4</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Legal entity transparency</div>
							</div>
							<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Governance Transparency</div>
								<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.organization.governance_transparency ?? 'N/A' }} / 4</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Rules and decision visibility</div>
							</div>
							<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Stakeholder Representation</div>
								<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.organization.governance_stakeholder_representation ?? 'N/A' }} / 4</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Community influence on outcomes</div>
							</div>
							<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Succession Planning</div>
								<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.organization.governance_succession_planning ?? 'N/A' }} / 4</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Leadership continuity mechanisms</div>
							</div>
							<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Funding Transparency</div>
								<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.organization.governance_funding_transparency ?? 'N/A' }} / 4</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Funding sources and expectations</div>
							</div>
							<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Resistance to Pressure</div>
								<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.organization.governance_resistance_to_pressure ?? 'N/A' }} / 4</div>
								<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Structural resilience to coercion</div>
							</div>
						</div>
					</div>

					<!-- Positive Signals -->
					<div v-if="app.organization.governance_positive_signals" class="border rounded-lg p-6 dark:border-gray-700">
						<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Positive Governance Signals</h3>
						<div class="prose dark:prose-invert max-w-none">
							<div v-html="app.organization.governance_positive_signals"></div>
						</div>
					</div>

					<!-- Risk Indicators -->
					<div v-if="app.organization.governance_risk_indicators" class="border rounded-lg p-6 dark:border-gray-700 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
						<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Governance Risk Indicators</h3>
						<div class="prose dark:prose-invert max-w-none">
							<div v-html="app.organization.governance_risk_indicators"></div>
						</div>
					</div>

					<!-- Assessment Notes -->
					<div v-if="app.organization.governance_assessment_notes" class="border rounded-lg p-6 dark:border-gray-700">
						<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Assessment Context</h3>
						<div class="prose dark:prose-invert max-w-none">
							<div v-html="app.organization.governance_assessment_notes"></div>
						</div>
						<div v-if="app.organization.governance_assessment_version" class="text-sm text-gray-500 dark:text-gray-400 mt-4">
							Framework version: {{ app.organization.governance_assessment_version }}
						</div>
					</div>
				</div>
				
				<!-- Business Information -->
				<div v-if="app.organization?.business_id || app.organization?.ticker || app.organization?.linkedin_profile || app.organization?.naics || app.organization?.sic_code" class="mt-6 space-y-6">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Business Information</h2>
					
					<div class="border rounded-lg p-6 dark:border-gray-700">
						<dl class="grid md:grid-cols-2 gap-4 text-sm">
							<template v-if="app.organization.business_id">
								<dt class="font-medium text-gray-700 dark:text-gray-300">Business ID</dt>
								<dd class="text-gray-600 dark:text-gray-400">{{ app.organization.business_id }}</dd>
							</template>
							<template v-if="app.organization.ticker">
								<dt class="font-medium text-gray-700 dark:text-gray-300">Stock Ticker</dt>
								<dd class="text-gray-600 dark:text-gray-400">{{ app.organization.ticker }}</dd>
							</template>
							<template v-if="app.organization.linkedin_profile">
								<dt class="font-medium text-gray-700 dark:text-gray-300">LinkedIn</dt>
								<dd class="text-gray-600 dark:text-gray-400">
									<a :href="app.organization.linkedin_profile" target="_blank" class="text-primary hover:underline">
										View Profile
									</a>
								</dd>
							</template>
							<template v-if="app.organization.linkedin_industry_category">
								<dt class="font-medium text-gray-700 dark:text-gray-300">Industry</dt>
								<dd class="text-gray-600 dark:text-gray-400">{{ app.organization.linkedin_industry_category }}</dd>
							</template>
							<template v-if="app.organization.naics">
								<dt class="font-medium text-gray-700 dark:text-gray-300">NAICS Code</dt>
								<dd class="text-gray-600 dark:text-gray-400">{{ app.organization.naics }}<span v-if="app.organization.naics_description"> - {{ app.organization.naics_description }}</span></dd>
							</template>
							<template v-if="app.organization.sic_code">
								<dt class="font-medium text-gray-700 dark:text-gray-300">SIC Code</dt>
								<dd class="text-gray-600 dark:text-gray-400">{{ app.organization.sic_code }}<span v-if="app.organization.sic_code_description"> - {{ app.organization.sic_code_description }}</span></dd>
							</template>
						</dl>
						<div v-if="app.organization.business_description" class="mt-4 pt-4 border-t dark:border-gray-700">
							<h4 class="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
							<p class="text-sm text-gray-700 dark:text-gray-300">{{ app.organization.business_description }}</p>
						</div>
					</div>
				</div>

				<!-- Company Size -->
				<div v-if="app.organization?.number_of_employees_range || app.organization?.yearly_revenue_range" class="mt-6 space-y-6">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Company Size</h2>
					
					<div class="border rounded-lg p-6 dark:border-gray-700">
						<div class="grid md:grid-cols-2 gap-6">
							<div v-if="app.organization.number_of_employees_range">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Employees</div>
								<div class="text-xl font-bold text-gray-900 dark:text-white">{{ app.organization.number_of_employees_range }}</div>
							</div>
							<div v-if="app.organization.yearly_revenue_range">
								<div class="text-sm text-gray-500 dark:text-gray-400 mb-2">Annual Revenue</div>
								<div class="text-xl font-bold text-gray-900 dark:text-white">{{ app.organization.yearly_revenue_range }}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Locations -->
				<div v-if="app.organization?.country || app.organization?.city_name || app.organization?.street" class="mt-6 space-y-6">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Location</h2>
					
					<div class="border rounded-lg p-6 dark:border-gray-700">
						<div class="space-y-2 text-sm">
							<div v-if="app.organization.street" class="text-gray-700 dark:text-gray-300">{{ app.organization.street }}</div>
							<div class="text-gray-700 dark:text-gray-300">
								<span v-if="app.organization.city_name">{{ app.organization.city_name }}</span><span v-if="app.organization.city_name && app.organization.region_name">, </span><span v-if="app.organization.region_name">{{ app.organization.region_name }}</span>
								<span v-if="app.organization.zip_code"> {{ app.organization.zip_code }}</span>
							</div>
							<div v-if="app.organization.country" class="font-medium text-gray-900 dark:text-white">{{ app.organization.country }}</div>
							<div v-if="app.organization.locations_distribution" class="mt-4 pt-4 border-t dark:border-gray-700">
								<span class="font-medium text-gray-700 dark:text-gray-300">Locations: </span>
								<span class="text-gray-600 dark:text-gray-400">{{ app.organization.locations_distribution }}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Business Model -->
				<div v-if="app.organization?.business_model || app.organization?.funding_transparency" class="mt-6 space-y-6">
					<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Business Model</h2>
					
					<div class="border rounded-lg p-6 dark:border-gray-700">
						<dl class="grid md:grid-cols-2 gap-4 text-sm">
							<template v-if="app.organization.business_model">
								<dt class="font-medium text-gray-700 dark:text-gray-300">Business Model</dt>
								<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.organization.business_model) }}</dd>
							</template>
							<template v-if="app.organization.funding_transparency">
								<dt class="font-medium text-gray-700 dark:text-gray-300">Funding Transparency</dt>
								<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.organization.funding_transparency) }}</dd>
							</template>
						</dl>
					</div>
				</div>

				<!-- Vendor Information (if provided manually) -->
				<div v-if="app.organization?.vendor_information" class="mt-6 prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Additional Information</h2>
					<div v-html="app.organization.vendor_information"></div>
				</div>
			</div>
		</div>

		<!-- Technical Details Tab Content -->
		<div v-show="activeTab === 'technical'">
			<div class="space-y-6">
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Technical Details</h2>

				<!-- Package & Distribution -->
				<div class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Package Information</h3>
					<dl class="grid md:grid-cols-2 gap-4 text-sm">
						<template v-if="app.package_id">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Package ID</dt>
							<dd class="text-gray-600 dark:text-gray-400 font-mono">{{ app.package_id }}</dd>
						</template>
						<template v-if="app.alternative_distribution">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Alternative Distribution</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ app.alternative_distribution }}</dd>
						</template>
						<template v-if="app.app_store_dependency !== null && app.app_store_dependency !== undefined">
							<dt class="font-medium text-gray-700 dark:text-gray-300">App Store Dependency</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ app.app_store_dependency ? 'Yes' : 'No' }}</dd>
						</template>
					</dl>
				</div>

				<!-- Categories -->
				<div v-if="app.primary_category || app.secondary_categories?.length" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Categories</h3>
					<div class="space-y-3">
						<div v-if="app.primary_category">
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Primary: </span>
							<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">{{ app.primary_category }}</span>
						</div>
						<div v-if="app.secondary_categories?.length">
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary: </span>
							<div class="mt-2 flex flex-wrap gap-2">
								<span v-for="category in app.secondary_categories" :key="category" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
									{{ category }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Platform Support -->
				<div class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Platform Support</h3>
					<div class="grid md:grid-cols-2 gap-6">
						<div v-if="app.android_url" class="flex items-start space-x-3">
							<div class="flex-shrink-0">
								<div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
									<span class="text-xl">🤖</span>
								</div>
							</div>
							<div>
								<div class="font-medium text-gray-900 dark:text-white">Android</div>
								<a :href="app.android_url" target="_blank" class="text-sm text-primary hover:underline">View on Play Store</a>
							</div>
						</div>
						<div v-if="app.ios_url" class="flex items-start space-x-3">
							<div class="flex-shrink-0">
								<div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
									<span class="text-xl">🍎</span>
								</div>
							</div>
							<div>
								<div class="font-medium text-gray-900 dark:text-white">iOS</div>
								<a :href="app.ios_url" target="_blank" class="text-sm text-primary hover:underline">View on App Store</a>
							</div>
						</div>
						<div v-if="app.website_url" class="flex items-start space-x-3">
							<div class="flex-shrink-0">
								<div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
									<span class="text-xl">🌐</span>
								</div>
							</div>
							<div>
								<div class="font-medium text-gray-900 dark:text-white">Web</div>
								<a :href="app.website_url" target="_blank" class="text-sm text-primary hover:underline break-all">{{ app.website_url }}</a>
							</div>
						</div>
						<div v-if="app.repo_url" class="flex items-start space-x-3">
							<div class="flex-shrink-0">
								<div class="w-10 h-10 rounded-lg bg-gray-900 dark:bg-gray-700 flex items-center justify-center">
									<span class="text-xl">💻</span>
								</div>
							</div>
							<div>
								<div class="font-medium text-gray-900 dark:text-white">Source Code</div>
								<a :href="app.repo_url" target="_blank" class="text-sm text-primary hover:underline break-all">{{ app.repo_url }}</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Security Report Tab Content -->
		<div v-show="activeTab === 'security' && app.mobsf_metadata">
			<div class="space-y-8">
				<!-- Security Score Overview -->
				<div class="border dark:border-gray-700 rounded-lg p-6">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Security Analysis</h2>
						<div class="text-right">
							<div class="text-4xl font-bold" :class="[
								app.mobsf_security_score >= 70 ? 'text-green-600 dark:text-green-400' :
								app.mobsf_security_score >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
								'text-red-600 dark:text-red-400'
							]">
								{{ app.mobsf_security_score }}/100
							</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Security Score</div>
							<div v-if="app.mobsf_scan_date" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
								Scanned: {{ new Date(app.mobsf_scan_date).toLocaleDateString() }}
							</div>
						</div>
					</div>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Higher scores indicate better security. This report was generated using MobSF static analysis and scorecard.
					</p>
				</div>

				<!-- App Metadata -->
				<div v-if="app.mobsf_metadata" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">App Information</h3>
					<div class="grid md:grid-cols-2 gap-4">
						<div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Package Name:</span>
							<span class="text-sm text-gray-600 dark:text-gray-400 ml-2">{{ app.mobsf_metadata.package_name }}</span>
						</div>
						<div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Version:</span>
							<span class="text-sm text-gray-600 dark:text-gray-400 ml-2">{{ app.mobsf_metadata.version_name }} ({{ app.mobsf_metadata.version_code }})</span>
						</div>
						<div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Target SDK:</span>
							<span class="text-sm text-gray-600 dark:text-gray-400 ml-2">{{ app.mobsf_metadata.target_sdk }}</span>
						</div>
						<div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Min SDK:</span>
							<span class="text-sm text-gray-600 dark:text-gray-400 ml-2">{{ app.mobsf_metadata.min_sdk }}</span>
						</div>
						<div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">File Size:</span>
							<span class="text-sm text-gray-600 dark:text-gray-400 ml-2">{{ app.mobsf_metadata.size }}</span>
						</div>
						<div>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">MD5:</span>
							<span class="text-sm text-gray-600 dark:text-gray-400 ml-2 font-mono text-xs">{{ app.mobsf_metadata.md5 }}</span>
						</div>
					</div>
				</div>

				<!-- Permissions Analysis -->
				<div v-if="app.mobsf_permissions" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Permissions Analysis</h3>
					
					<!-- Malware Permissions Summary -->
					<div v-if="app.mobsf_permissions.malware_permissions" class="mb-6">
						<div class="flex items-center justify-between mb-3">
							<h4 class="font-semibold text-gray-900 dark:text-white">Permission Summary</h4>
						</div>
						<div class="grid md:grid-cols-2 gap-4 mb-4">
							<div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
								<div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ app.mobsf_permissions.malware_permissions.total_malware_permissions || 0 }}</div>
								<div class="text-sm text-gray-600 dark:text-gray-400">Malware-Associated</div>
							</div>
							<div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
								<div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ app.mobsf_permissions.malware_permissions.total_other_permissions || 0 }}</div>
								<div class="text-sm text-gray-600 dark:text-gray-400">Other Permissions</div>
							</div>
						</div>

						<!-- Top Malware Permissions -->
						<div v-if="app.mobsf_permissions.malware_permissions.top_malware_permissions?.length" class="mb-4">
							<h5 class="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ High-Risk Permissions</h5>
							<div class="space-y-2">
								<div v-for="perm in app.mobsf_permissions.malware_permissions.top_malware_permissions" :key="perm" class="text-xs font-mono bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
									{{ perm }}
								</div>
							</div>
						</div>
					</div>

					<!-- All Permissions Table -->
					<div v-if="app.mobsf_permissions.permissions && Object.keys(app.mobsf_permissions.permissions).length" class="overflow-x-auto">
						<h4 class="font-semibold text-gray-900 dark:text-white mb-3">All Permissions</h4>
						<table class="min-w-full text-sm">
							<thead class="bg-gray-50 dark:bg-gray-800">
								<tr>
									<th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Permission</th>
									<th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
									<th class="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Description</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 dark:divide-gray-700">
								<tr v-for="(details, perm) in app.mobsf_permissions.permissions" :key="perm">
									<td class="px-4 py-2 font-mono text-xs">{{ perm }}</td>
									<td class="px-4 py-2">
										<span :class="[
											'px-2 py-1 text-xs rounded-full',
											details.status === 'dangerous' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
											details.status === 'normal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
											'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
										]">
											{{ details.status || 'unknown' }}
										</span>
									</td>
									<td class="px-4 py-2 text-gray-600 dark:text-gray-400">{{ details.description }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- Certificate Information -->
				<div v-if="app.mobsf_certificate?.certificate_analysis" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Code Signing Certificate</h3>
					
					<!-- Certificate Summary -->
					<div v-if="app.mobsf_certificate.certificate_analysis.certificate_summary" class="grid md:grid-cols-3 gap-4 mb-6">
						<div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
							<div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ app.mobsf_certificate.certificate_analysis.certificate_summary.high || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">High Severity Issues</div>
						</div>
						<div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
							<div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ app.mobsf_certificate.certificate_analysis.certificate_summary.warning || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
						</div>
						<div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
							<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ app.mobsf_certificate.certificate_analysis.certificate_summary.info || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Info</div>
						</div>
					</div>

					<!-- Certificate Details -->
					<div v-if="app.mobsf_certificate.certificate_analysis.certificate_info" class="mb-6">
						<h4 class="font-semibold text-gray-900 dark:text-white mb-3">Certificate Details</h4>
						<div class="bg-gray-50 dark:bg-gray-800 p-4 rounded text-sm font-mono whitespace-pre-line text-gray-600 dark:text-gray-400">
							{{ app.mobsf_certificate.certificate_analysis.certificate_info }}
						</div>
					</div>

					<!-- Certificate Findings -->
					<div v-if="app.mobsf_certificate.certificate_analysis.certificate_findings?.length" class="space-y-3">
						<h4 class="font-semibold text-gray-900 dark:text-white mb-3">Certificate Security Issues</h4>
						<div v-for="(finding, idx) in app.mobsf_certificate.certificate_analysis.certificate_findings" :key="idx" class="border-l-4 p-4 rounded" :class="[
							finding[0] === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
							finding[0] === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
							'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
						]">
							<div class="flex items-start justify-between mb-2">
								<h5 class="font-semibold text-gray-900 dark:text-white">{{ finding[2] }}</h5>
								<span :class="[
									'px-2 py-1 text-xs rounded-full uppercase font-semibold',
									finding[0] === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
									finding[0] === 'warning' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
									'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
								]">
									{{ finding[0] }}
								</span>
							</div>
							<p class="text-sm text-gray-600 dark:text-gray-400">{{ finding[1] }}</p>
						</div>
					</div>
				</div>

				<!-- Manifest Findings -->
				<div v-if="app.mobsf_manifest_findings?.manifest_findings?.length" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Security Findings</h3>
					
					<!-- Summary Stats -->
					<div v-if="app.mobsf_manifest_findings.manifest_summary" class="grid md:grid-cols-3 gap-4 mb-6">
						<div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
							<div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ app.mobsf_manifest_findings.manifest_summary.high || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">High Severity</div>
						</div>
						<div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
							<div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ app.mobsf_manifest_findings.manifest_summary.warning || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
						</div>
						<div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
							<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ app.mobsf_manifest_findings.manifest_summary.info || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Info</div>
						</div>
					</div>

					<!-- Findings List -->
					<div class="space-y-3">
						<div v-for="finding in app.mobsf_manifest_findings.manifest_findings" :key="finding.rule" class="border-l-4 p-4 rounded" :class="[
							finding.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
							finding.severity === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
							'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
						]">
							<div class="flex items-start justify-between mb-2">
								<h4 class="font-semibold text-gray-900 dark:text-white" v-html="finding.title"></h4>
								<span :class="[
									'px-2 py-1 text-xs rounded-full uppercase font-semibold',
									finding.severity === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
									finding.severity === 'warning' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
									'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
								]">
									{{ finding.severity }}
								</span>
							</div>
							<p class="text-sm text-gray-600 dark:text-gray-400">{{ finding.description }}</p>
						</div>
					</div>
				</div>

				<!-- Components -->
				<div v-if="app.mobsf_components" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">App Components</h3>
					<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div v-if="app.mobsf_components.activities" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
							<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.mobsf_components.activities?.length || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Activities</div>
						</div>
						<div v-if="app.mobsf_components.services" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
							<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.mobsf_components.services?.length || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Services</div>
						</div>
						<div v-if="app.mobsf_components.receivers" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
							<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.mobsf_components.receivers?.length || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Receivers</div>
						</div>
						<div v-if="app.mobsf_components.libraries" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
							<div class="text-2xl font-bold text-gray-900 dark:text-white">{{ app.mobsf_components.libraries?.length || 0 }}</div>
							<div class="text-sm text-gray-600 dark:text-gray-400">Libraries</div>
						</div>
					</div>
				</div>

				<!-- Binary Analysis Summary -->
				<div v-if="app.mobsf_binary_analysis?.length" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Binary Analysis</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ app.mobsf_binary_analysis.length }} native libraries analyzed</p>
					<div class="space-y-2 max-h-96 overflow-y-auto">
						<div v-for="(lib, idx) in app.mobsf_binary_analysis" :key="idx" class="text-xs font-mono bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
							{{ lib.name }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
