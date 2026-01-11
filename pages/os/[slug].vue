<script setup lang="ts">
import type { OperatingSystem } from '~/types';

const route = useRoute();
const slug = route.params.slug as string;

// Fetch OS details
const { data: os } = await useAsyncData(`os-${slug}`, () => {
	return useDirectus(
		readItems('operating_systems', {
			fields: [
				'*',
				'assessment_type',
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
				'organization.number_of_employees_range',
				'organization.yearly_revenue_range',
				'organization.ticker',
				'organization.city_name',
				'organization.region_name',
			],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'published' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// If OS not found, show 404
if (!os.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Operating System Not Found',
	});
}

// SEO
useHead({
	title: os.value.name,
	meta: [
		{
			name: 'description',
			content: os.value.tagline || os.value.description || '',
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
		A_Sovereign: 'A - Sovereign',
		B_Aligned: 'B - Aligned',
		C_Transitional: 'C - Transitional',
		D_Extractive: 'D - Extractive',
	};
	return labels[tier] || tier;
};

// Helper to get tier color
const getTierColor = (tier: string | null | undefined) => {
	if (!tier) return 'gray';
	const colors: Record<string, string> = {
		A_Sovereign: 'blue',
		B_Aligned: 'green',
		C_Transitional: 'yellow',
		D_Extractive: 'red',
	};
	return colors[tier] || 'gray';
};

// Helper to get risk color
const getRiskColor = (risk: string | null | undefined) => {
	if (!risk) return 'gray';
	if (risk === 'high') return 'red';
	if (risk === 'medium') return 'yellow';
	if (risk === 'low') return 'green';
	return 'gray';
};

// Helper to get score percentage (0-10 scale)
const getScorePercentage = (score: number | null | undefined) => {
	if (score === null || score === undefined) return 0;
	return (score / 10) * 100;
};
</script>

<template>
	<BlockContainer v-if="os">
		<!-- Header Section -->
		<div class="mb-8">
			<NuxtLink
				to="/os"
				class="inline-flex items-center text-sm text-primary hover:underline mb-6"
			>
				← Back to Operating Systems
			</NuxtLink>
			
			<!-- Logo Container -->
			<div v-if="os.logo_light || os.logo_dark" class="mb-6 flex items-center justify-center w-full h-32 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl p-6">
				<!-- Light theme: use dark logo -->
				<img 
					:src="`/api/proxy/assets/${os.logo_dark || os.logo_light}`" 
					:alt="os.name" 
					class="h-full max-w-md object-contain dark:hidden" 
				/>
				<!-- Dark theme: use light logo -->
				<img 
					:src="`/api/proxy/assets/${os.logo_light || os.logo_dark}`" 
					:alt="os.name" 
					class="h-full max-w-md object-contain hidden dark:block" 
				/>
			</div>
			
			<div>
				<h1 class="text-4xl font-bold mb-3 text-gray-900 dark:text-white">{{ os.name }}</h1>
				<p v-if="os.tagline" class="text-xl text-gray-600 dark:text-gray-400 mb-4">
					{{ os.tagline }}
				</p>
				
				<!-- Main Badges -->
				<div class="flex flex-wrap gap-2">
					<AssessmentTypeBadge :assessment-type="os.assessment_type" />
					<span
						v-if="os.is_open_source"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						Open Source
					</span>
					<span
						v-if="os.telemetry_default === 'none'"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						No Telemetry
					</span>
					<span
						v-if="os.bootloader_unlockable === 'yes'"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
					>
						Bootloader Unlockable
					</span>
					<span
						v-if="os.root_access_available"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
					>
						Root Access
					</span>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3 mb-8 pb-8 border-b dark:border-gray-700">
			<UButton
				v-if="os.website_url"
				:to="os.website_url"
				target="_blank"
				color="primary"
				size="lg"
				icon="i-mdi-open-in-new"
			>
				Visit Website
			</UButton>
			<UButton
				v-if="os.source_code_url"
				:to="os.source_code_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-github"
			>
				Source Code
			</UButton>
			<UButton
				v-if="os.documentation_url"
				:to="os.documentation_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-book-open"
			>
				Documentation
			</UButton>
			<UButton
				v-if="os.privacy_policy_url"
				:to="os.privacy_policy_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-shield-check"
			>
				Privacy Policy
			</UButton>
		</div>

		<!-- Main Content -->
		<div class="grid md:grid-cols-3 gap-8">
			<!-- Left Column: Description & Assessment -->\
			<div class="md:col-span-2 space-y-6">
				<!-- Description -->
				<div v-if="os.description" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About</h2>
					<div v-html="os.description"></div>
				</div>

				<!-- GoodPhone Assessment -->
				<div v-if="os.tier || os.tier_rationale" class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
					<div class="flex flex-wrap items-center gap-3 mb-4">
						<h2 class="text-2xl font-bold">GoodPhone Assessment</h2>
						<span v-if="os.tier" :class="[
							'px-3 py-1 text-sm font-bold rounded-full',
							getTierColor(os.tier) === 'blue' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
							getTierColor(os.tier) === 'green' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
							getTierColor(os.tier) === 'yellow' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
							getTierColor(os.tier) === 'red' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
						]">
							{{ getTierLabel(os.tier) }}
						</span>
					</div>
					<p v-if="os.tier_rationale" class="text-gray-700 dark:text-gray-300">{{ os.tier_rationale }}</p>
				</div>

				<!-- Values Scores -->
				<div v-if="os.scores">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Values Assessment</h2>
					<div class="border rounded-lg p-6 dark:border-gray-700 space-y-4">
						<div v-if="os.scores.autonomy !== null && os.scores.autonomy !== undefined">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium">Autonomy</span>
								<span class="text-xs text-gray-600 dark:text-gray-400">{{ os.scores.autonomy }}/10</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div class="h-2 rounded-full bg-blue-600 transition-all" :style="{ width: getScorePercentage(os.scores.autonomy) + '%' }"></div>
							</div>
						</div>
						
						<div v-if="os.scores.transparency !== null && os.scores.transparency !== undefined">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium">Transparency</span>
								<span class="text-xs text-gray-600 dark:text-gray-400">{{ os.scores.transparency }}/10</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div class="h-2 rounded-full bg-green-600 transition-all" :style="{ width: getScorePercentage(os.scores.transparency) + '%' }"></div>
							</div>
						</div>
						
						<div v-if="os.scores.control_ownership !== null && os.scores.control_ownership !== undefined">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium">Control & Ownership</span>
								<span class="text-xs text-gray-600 dark:text-gray-400">{{ os.scores.control_ownership }}/10</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div class="h-2 rounded-full bg-purple-600 transition-all" :style="{ width: getScorePercentage(os.scores.control_ownership) + '%' }"></div>
							</div>
						</div>
						
						<div v-if="os.scores.resilience !== null && os.scores.resilience !== undefined">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium">Resilience</span>
								<span class="text-xs text-gray-600 dark:text-gray-400">{{ os.scores.resilience }}/10</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div class="h-2 rounded-full bg-orange-600 transition-all" :style="{ width: getScorePercentage(os.scores.resilience) + '%' }"></div>
							</div>
						</div>
						
						<div v-if="os.scores.human_impact !== null && os.scores.human_impact !== undefined">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium">Human Impact</span>
								<span class="text-xs text-gray-600 dark:text-gray-400">{{ os.scores.human_impact }}/10</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div class="h-2 rounded-full bg-pink-600 transition-all" :style="{ width: getScorePercentage(os.scores.human_impact) + '%' }"></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Usage Notes -->
				<div v-if="os.usage_notes" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Usage Considerations</h2>
					<div v-html="os.usage_notes"></div>
				</div>
			</div>

			<!-- Right Column: Technical Details -->
			<div class="space-y-6">
				<!-- Organization Card -->
				<OrganizationCard v-if="os.organization" :organization="os.organization" />
				<!-- Classification -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Classification</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="os.os_scope">
							<dt class="text-gray-500 dark:text-gray-400">OS Scope</dt>
							<dd class="font-medium capitalize">{{ formatField(os.os_scope) }}</dd>
						</div>
						<div v-if="os.kernel_type">
							<dt class="text-gray-500 dark:text-gray-400">Kernel Type</dt>
							<dd class="font-medium uppercase">{{ os.kernel_type }}</dd>
						</div>
						<div v-if="os.base_distribution">
							<dt class="text-gray-500 dark:text-gray-400">Base Distribution</dt>
							<dd class="font-medium">{{ os.base_distribution }}</dd>
						</div>
					</dl>
				</div>

				<!-- Governance & Maintainer -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Governance</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="os.governance_model">
							<dt class="text-gray-500 dark:text-gray-400">Governance Model</dt>
							<dd class="font-medium capitalize">{{ formatField(os.governance_model) }}</dd>
						</div>
						<div v-if="os.maintainer_org">
							<dt class="text-gray-500 dark:text-gray-400">Maintainer</dt>
							<dd class="font-medium">{{ os.maintainer_org }}</dd>
						</div>
						<div v-if="os.funding_model">
							<dt class="text-gray-500 dark:text-gray-400">Funding Model</dt>
							<dd class="font-medium">{{ os.funding_model }}</dd>
						</div>
						<div v-if="os.community_influence">
							<dt class="text-gray-500 dark:text-gray-400">Community Influence</dt>
							<dd class="font-medium capitalize">{{ formatField(os.community_influence) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Openness & Control -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Openness & Control</h3>
					<dl class="space-y-3 text-sm">
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Open Source</dt>
							<dd class="font-medium">{{ formatField(os.is_open_source) }}</dd>
						</div>
						<div v-if="os.license">
							<dt class="text-gray-500 dark:text-gray-400">License</dt>
							<dd class="font-medium">{{ os.license }}</dd>
						</div>
						<div v-if="os.bootloader_unlockable">
							<dt class="text-gray-500 dark:text-gray-400">Bootloader Unlockable</dt>
							<dd class="font-medium capitalize">{{ formatField(os.bootloader_unlockable) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Root Access</dt>
							<dd class="font-medium">{{ formatField(os.root_access_available) }}</dd>
						</div>
						<div v-if="os.custom_rom_support">
							<dt class="text-gray-500 dark:text-gray-400">Custom ROM Support</dt>
							<dd class="font-medium capitalize">{{ formatField(os.custom_rom_support) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Ecosystem Dependencies -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ecosystem Dependencies</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="os.google_services_included">
							<dt class="text-gray-500 dark:text-gray-400">Google Services</dt>
							<dd class="font-medium capitalize">{{ formatField(os.google_services_included) }}</dd>
						</div>
						<div v-if="os.apple_services_dependency">
							<dt class="text-gray-500 dark:text-gray-400">Apple Services Dependency</dt>
							<dd class="font-medium capitalize">{{ formatField(os.apple_services_dependency) }}</dd>
						</div>
						<div v-if="os.microsoft_cloud_dependency">
							<dt class="text-gray-500 dark:text-gray-400">Microsoft Cloud Dependency</dt>
							<dd class="font-medium capitalize">{{ formatField(os.microsoft_cloud_dependency) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Privacy & Telemetry -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Privacy & Telemetry</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="os.telemetry_default">
							<dt class="text-gray-500 dark:text-gray-400">Default Telemetry</dt>
							<dd class="font-medium capitalize">{{ formatField(os.telemetry_default) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Telemetry Disableable</dt>
							<dd class="font-medium">{{ formatField(os.telemetry_disableable) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Cloud Account Required</dt>
							<dd class="font-medium">{{ formatField(os.cloud_account_required) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Privacy by Default</dt>
							<dd class="font-medium">{{ formatField(os.privacy_by_default) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Security Features -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Security Features</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="os.app_isolation_sandboxing">
							<dt class="text-gray-500 dark:text-gray-400">App Sandboxing</dt>
							<dd class="font-medium capitalize">{{ formatField(os.app_isolation_sandboxing) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Verified Boot</dt>
							<dd class="font-medium">{{ formatField(os.verified_boot) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Full Disk Encryption</dt>
							<dd class="font-medium">{{ formatField(os.full_disk_encryption) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Binary Reproducibility</dt>
							<dd class="font-medium">{{ formatField(os.binary_reproducibility) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Risk Assessment -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Risk Assessment</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="os.resistance_to_coercion">
							<dt class="text-gray-500 dark:text-gray-400">Resistance to Coercion</dt>
							<dd class="font-medium capitalize">{{ formatField(os.resistance_to_coercion) }}</dd>
						</div>
						<div v-if="os.law_enforcement_target_risk">
							<dt class="text-gray-500 dark:text-gray-400">Law Enforcement Risk</dt>
							<dd :class="[
								'font-medium capitalize',
								getRiskColor(os.law_enforcement_target_risk) === 'red' && 'text-red-600 dark:text-red-400',
								getRiskColor(os.law_enforcement_target_risk) === 'yellow' && 'text-yellow-600 dark:text-yellow-400',
								getRiskColor(os.law_enforcement_target_risk) === 'green' && 'text-green-600 dark:text-green-400',
							]">
								{{ formatField(os.law_enforcement_target_risk) }}
							</dd>
						</div>
						<div v-if="os.jurisdictional_exposure">
							<dt class="text-gray-500 dark:text-gray-400">Jurisdictional Exposure</dt>
							<dd class="font-medium">{{ os.jurisdictional_exposure }}</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
