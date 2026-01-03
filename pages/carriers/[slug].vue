<script setup lang="ts">
import type { Carrier } from '~/types';

const route = useRoute();
const slug = route.params.slug as string;

// Fetch carrier details
const { data: carrier } = await useAsyncData(`carrier-${slug}`, () => {
	return useDirectus(
		readItems('carriers', {
			fields: [
				'*',
				'categories.carrier_categories_id.id',
				'categories.carrier_categories_id.name',
				'categories.carrier_categories_id.slug',
				'host_network.id',
				'host_network.name',
				'host_network.slug',
				'privacy_score',
				'autonomy_score',
				'transparency_score',
				'value_score',
				'overall_score',
			],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'published' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Fetch sources for this carrier
const { data: sources } = await useAsyncData(`carrier-sources-${slug}`, async () => {
	if (!carrier.value) return [];
	return useDirectus(
		readItems('carrier_sources', {
			fields: ['*'],
			filter: {
				carrier: { _eq: carrier.value.id },
				status: { _eq: 'published' },
			},
			sort: ['-date_published', 'title'],
		}),
	);
});

// Fetch change logs for this carrier
const { data: changeLogs } = await useAsyncData(`carrier-changelog-${slug}`, async () => {
	if (!carrier.value) return [];
	return useDirectus(
		readItems('carrier_change_log', {
			fields: ['*'],
			filter: {
				carrier: { _eq: carrier.value.id },
				status: { _eq: 'published' },
			},
			sort: ['-date'],
		}),
	);
});

// Fetch alternative carriers in the same categories
const { data: alternatives } = await useAsyncData(`carrier-alternatives-${slug}`, async () => {
	if (!carrier.value || !carrier.value.categories || carrier.value.categories.length === 0) return [];
	
	// Get category IDs
	const categoryIds = carrier.value.categories.map((cat: any) => cat.carrier_categories_id.id);
	
	return useDirectus(
		readItems('carriers', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'brand_logo_light',
				'brand_symbol_light',
				'overall_score',
				'mvno_status',
				'esim_support',
				'5g_available',
				'prepaid_anonymous',
				'categories.carrier_categories_id.id',
				'categories.carrier_categories_id.name',
			],
			filter: {
				status: { _eq: 'published' },
				id: { _neq: carrier.value.id },
				categories: {
					carrier_categories_id: {
						id: { _in: categoryIds },
					},
				},
			},
			sort: ['-overall_score', 'name'],
			limit: 6,
		}),
	);
});

// If carrier not found, show 404
if (!carrier.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Carrier Not Found',
	});
}

// SEO
useHead({
	title: carrier.value.name,
	meta: [
		{
			name: 'description',
			content: carrier.value.short_description || carrier.value.long_description || '',
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

// Helper to get score label and color
const getScoreInfo = (score: number | null | undefined) => {
	if (score === null || score === undefined) return { label: 'Not Rated', color: 'gray', percentage: 0 };
	const labels = ['Hostile', 'Weak', 'Mixed', 'Strong', 'Best-in-Class'];
	const colors = ['red', 'orange', 'yellow', 'green', 'blue'];
	return {
		label: labels[score],
		color: colors[score],
		percentage: (score / 4) * 100,
	};
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

// Tab state
const activeTab = ref('overview');
</script>

<template>
	<BlockContainer v-if="carrier">
		<!-- Header Section -->
		<div class="mb-8">
			<NuxtLink to="/carriers" class="inline-flex items-center text-sm text-primary hover:underline mb-4">
				← Back to Carriers
			</NuxtLink>

			<div class="flex items-start gap-6">
				<div v-if="carrier.brand_symbol_light || carrier.brand_symbol_dark" class="flex-shrink-0">
					<NuxtImg :src="carrier.brand_symbol_light || carrier.brand_symbol_dark" :alt="carrier.name" class="w-24 h-24 rounded-xl" />
				</div>
				<div class="flex-1">
					<h1 class="text-4xl font-bold mb-2">{{ carrier.name }}</h1>
					<p class="text-xl text-gray-600 dark:text-gray-400 mb-4">
						{{ carrier.short_description }}
					</p>

					<!-- Main Badges -->
					<div class="flex flex-wrap gap-2">
						<span
							v-if="carrier.mvno_status === 'mvno'"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							MVNO
						</span>
						<span
							v-if="carrier.esim_support"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
						>
							eSIM Support
						</span>
						<span
							v-if="carrier['5g_available']"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
						>
							5G Available
						</span>
						<span
							v-if="carrier.prepaid_anonymous"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
						>
							Anonymous Prepaid
						</span>
						<span
							v-if="carrier.contract_flexibility === 'no_contract_required'"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
						>
							No Contract Required
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3 mb-8 pb-8 border-b dark:border-gray-700">
			<UButton
				v-if="carrier.website_url"
				:to="carrier.website_url"
				target="_blank"
				color="primary"
				size="lg"
				icon="i-mdi-open-in-new"
			>
				Visit Website
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
					@click="activeTab = 'plans'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'plans'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Plans & Pricing
				</button>
				<button
					@click="activeTab = 'coverage'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'coverage'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Coverage
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
			</nav>
		</div>

		<!-- Overview Tab Content -->
		<div v-show="activeTab === 'overview'">
		<!-- Main Content Grid -->
		<div class="grid md:grid-cols-3 gap-8">
			<!-- Left Column: Description & Categories -->\n			<div class="md:col-span-2 space-y-6">
				<!-- Long Description -->
				<div v-if="carrier.long_description" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">About</h2>
					<div v-html="carrier.long_description"></div>
				</div>

				<!-- Categories -->
				<div v-if="carrier.categories && carrier.categories.length > 0">
					<h2 class="text-2xl font-bold mb-4">Categories</h2>
					<div class="flex flex-wrap gap-2">
						<NuxtLink
							v-for="cat in carrier.categories"
							:key="cat.id"
							:to="`/carriers?category=${cat.carrier_categories_id.slug}`"
							class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
						>
							{{ cat.carrier_categories_id.name }}
						</NuxtLink>
					</div>
				</div>

				<!-- Assessment Summary -->
				<div
					v-if="carrier.assessment_tier || carrier.assessment_recommended_use || carrier.assessment_summary"
					class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
				>
					<div class="flex flex-wrap items-center gap-3 mb-4">
						<h2 class="text-2xl font-bold">GoodPhone Assessment</h2>
						<span
							v-if="carrier.assessment_tier"
							class="px-3 py-1 text-sm font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							{{ getTierLabel(carrier.assessment_tier) }}
						</span>
						<span
							v-if="carrier.assessment_recommended_use"
							:class="[
								'px-3 py-1 text-sm font-bold rounded-full',
								carrier.assessment_recommended_use === 'recommended' &&
									'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
								carrier.assessment_recommended_use === 'situational' &&
									'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
								carrier.assessment_recommended_use === 'avoid' &&
									'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								carrier.assessment_recommended_use === 'compare_only' &&
									'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
							]"
						>
							{{ getRecommendationLabel(carrier.assessment_recommended_use) }}
						</span>
					</div>
					<p v-if="carrier.assessment_summary" class="text-gray-700 dark:text-gray-300">
						{{ carrier.assessment_summary }}
					</p>
				</div>

				<!-- Assessment Content Sections -->
				<div v-if="carrier.assessment_what_it_does" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">What It Does</h2>
					<div v-html="carrier.assessment_what_it_does"></div>
				</div>

				<div v-if="carrier.assessment_why_people_use_it" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Why People Use It</h2>
					<div v-html="carrier.assessment_why_people_use_it"></div>
				</div>

				<div v-if="carrier.assessment_tradeoffs" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Tradeoffs</h2>
					<div v-html="carrier.assessment_tradeoffs"></div>
				</div>

				<div v-if="carrier.assessment_privacy_and_cost" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Privacy & Cost</h2>
					<div v-html="carrier.assessment_privacy_and_cost"></div>
				</div>

				<div v-if="carrier.assessment_network_and_coverage" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Network & Coverage</h2>
					<div v-html="carrier.assessment_network_and_coverage"></div>
				</div>

				<div v-if="carrier.assessment_goodphone_assessment" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">GoodPhone's Assessment</h2>
					<div v-html="carrier.assessment_goodphone_assessment"></div>
				</div>

				<!-- Assessment Scores -->
				<div v-if="carrier.overall_score !== null || carrier.privacy_score !== null">
					<h2 class="text-2xl font-bold mb-4">Assessment Scores</h2>
					<div class="border rounded-lg p-6 dark:border-gray-700 space-y-4">
						<!-- Overall Score -->
						<div v-if="carrier.overall_score !== null" class="pb-4 border-b dark:border-gray-700">
							<div class="flex items-center justify-between mb-2">
								<span class="text-lg font-semibold">Overall Rating</span>
								<span
									:class="[
										'px-3 py-1 text-sm font-bold rounded-full',
										getScoreInfo(carrier.overall_score).color === 'blue' &&
											'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
										getScoreInfo(carrier.overall_score).color === 'green' &&
											'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
										getScoreInfo(carrier.overall_score).color === 'yellow' &&
											'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
										getScoreInfo(carrier.overall_score).color === 'orange' &&
											'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
										getScoreInfo(carrier.overall_score).color === 'red' &&
											'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
									]"
								>
									{{ getScoreInfo(carrier.overall_score).label }}
								</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
								<div
									:class="[
										'h-3 rounded-full transition-all',
										getScoreInfo(carrier.overall_score).color === 'blue' && 'bg-blue-600',
										getScoreInfo(carrier.overall_score).color === 'green' && 'bg-green-600',
										getScoreInfo(carrier.overall_score).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(carrier.overall_score).color === 'orange' && 'bg-orange-600',
										getScoreInfo(carrier.overall_score).color === 'red' && 'bg-red-600',
									]"
									:style="{ width: getScoreInfo(carrier.overall_score).percentage + '%' }"
								></div>
							</div>
						</div>

						<!-- Individual Scores -->
						<div class="space-y-3">
							<div v-if="carrier.privacy_score !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Privacy</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{{ getScoreInfo(carrier.privacy_score).label }}
									</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										:class="[
											'h-2 rounded-full transition-all',
											getScoreInfo(carrier.privacy_score).color === 'blue' && 'bg-blue-600',
											getScoreInfo(carrier.privacy_score).color === 'green' && 'bg-green-600',
											getScoreInfo(carrier.privacy_score).color === 'yellow' && 'bg-yellow-600',
											getScoreInfo(carrier.privacy_score).color === 'orange' && 'bg-orange-600',
											getScoreInfo(carrier.privacy_score).color === 'red' && 'bg-red-600',
										]"
										:style="{ width: getScoreInfo(carrier.privacy_score).percentage + '%' }"
									></div>
								</div>
							</div>

							<div v-if="carrier.autonomy_score !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">User Autonomy</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{{ getScoreInfo(carrier.autonomy_score).label }}
									</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										:class="[
											'h-2 rounded-full transition-all',
											getScoreInfo(carrier.autonomy_score).color === 'blue' && 'bg-blue-600',
											getScoreInfo(carrier.autonomy_score).color === 'green' && 'bg-green-600',
											getScoreInfo(carrier.autonomy_score).color === 'yellow' && 'bg-yellow-600',
											getScoreInfo(carrier.autonomy_score).color === 'orange' && 'bg-orange-600',
											getScoreInfo(carrier.autonomy_score).color === 'red' && 'bg-red-600',
										]"
										:style="{ width: getScoreInfo(carrier.autonomy_score).percentage + '%' }"
									></div>
								</div>
							</div>

							<div v-if="carrier.transparency_score !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Transparency</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{{ getScoreInfo(carrier.transparency_score).label }}
									</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										:class="[
											'h-2 rounded-full transition-all',
											getScoreInfo(carrier.transparency_score).color === 'blue' && 'bg-blue-600',
											getScoreInfo(carrier.transparency_score).color === 'green' && 'bg-green-600',
											getScoreInfo(carrier.transparency_score).color === 'yellow' && 'bg-yellow-600',
											getScoreInfo(carrier.transparency_score).color === 'orange' && 'bg-orange-600',
											getScoreInfo(carrier.transparency_score).color === 'red' && 'bg-red-600',
										]"
										:style="{ width: getScoreInfo(carrier.transparency_score).percentage + '%' }"
									></div>
								</div>
							</div>

							<div v-if="carrier.value_score !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Value</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{{ getScoreInfo(carrier.value_score).label }}
									</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										:class="[
											'h-2 rounded-full transition-all',
											getScoreInfo(carrier.value_score).color === 'blue' && 'bg-blue-600',
											getScoreInfo(carrier.value_score).color === 'green' && 'bg-green-600',
											getScoreInfo(carrier.value_score).color === 'yellow' && 'bg-yellow-600',
											getScoreInfo(carrier.value_score).color === 'orange' && 'bg-orange-600',
											getScoreInfo(carrier.value_score).color === 'red' && 'bg-red-600',
										]"
										:style="{ width: getScoreInfo(carrier.value_score).percentage + '%' }"
									></div>
								</div>
							</div>
						</div>

						<!-- Score Legend -->
						<div class="pt-4 border-t dark:border-gray-700">
							<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Rating Scale:</p>
							<div class="flex flex-wrap gap-2 text-xs">
								<span class="px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
									0 - Hostile
								</span>
								<span class="px-2 py-1 rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
									1 - Weak
								</span>
								<span class="px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
									2 - Mixed
								</span>
								<span class="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
									3 - Strong
								</span>
								<span class="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
									4 - Best-in-Class
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Technical Details -->
			<div class="space-y-6">
				<!-- Network Information -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Network Information</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="carrier.network_type">
							<dt class="text-gray-500 dark:text-gray-400">Network Type</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.network_type) }}</dd>
						</div>
						<div v-if="carrier.mvno_status">
							<dt class="text-gray-500 dark:text-gray-400">MVNO Status</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.mvno_status) }}</dd>
						</div>
						<div v-if="carrier.host_network">
							<dt class="text-gray-500 dark:text-gray-400">Host Network</dt>
							<dd class="font-medium">
								<NuxtLink :to="`/carriers/${carrier.host_network.slug}`" class="text-primary hover:underline">
									{{ carrier.host_network.name }}
								</NuxtLink>
							</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">5G Available</dt>
							<dd class="font-medium">{{ formatField(carrier['5g_available']) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">eSIM Support</dt>
							<dd class="font-medium">{{ formatField(carrier.esim_support) }}</dd>
						</div>
						<div v-if="carrier.coverage_quality">
							<dt class="text-gray-500 dark:text-gray-400">Coverage Quality</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.coverage_quality) }}</dd>
						</div>
						<div v-if="carrier.network_speed_rating">
							<dt class="text-gray-500 dark:text-gray-400">Network Speed</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.network_speed_rating) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Privacy & Account -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Privacy & Account</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="carrier.kyc_requirements">
							<dt class="text-gray-500 dark:text-gray-400">KYC Requirements</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.kyc_requirements) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Prepaid Anonymous</dt>
							<dd class="font-medium">{{ formatField(carrier.prepaid_anonymous) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Account Anonymity</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.account_anonymity) }}</dd>
						</div>
						<div v-if="carrier.data_retention_policy">
							<dt class="text-gray-500 dark:text-gray-400">Data Retention</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.data_retention_policy) }}</dd>
						</div>
						<div v-if="carrier.third_party_sharing">
							<dt class="text-gray-500 dark:text-gray-400">Third Party Sharing</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.third_party_sharing) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Location Tracking</dt>
							<dd class="font-medium">{{ formatField(carrier.location_tracking) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Pricing & Plans -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Pricing & Plans</h3>
					<dl class="space-y-3 text-sm">
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Prepaid Available</dt>
							<dd class="font-medium">{{ formatField(carrier.prepaid_available) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Postpaid Available</dt>
							<dd class="font-medium">{{ formatField(carrier.postpaid_available) }}</dd>
						</div>
						<div v-if="carrier.average_monthly_cost">
							<dt class="text-gray-500 dark:text-gray-400">Avg Monthly Cost</dt>
							<dd class="font-medium">{{ carrier.average_monthly_cost }}</dd>
						</div>
						<div v-if="carrier.contract_flexibility">
							<dt class="text-gray-500 dark:text-gray-400">Contract Flexibility</dt>
							<dd class="font-medium capitalize">{{ formatField(carrier.contract_flexibility) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Company Information -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Company Information</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="carrier.parent_company">
							<dt class="text-gray-500 dark:text-gray-400">Parent Company</dt>
							<dd class="font-medium">{{ carrier.parent_company }}</dd>
						</div>
						<div v-if="carrier.country_of_operation">
							<dt class="text-gray-500 dark:text-gray-400">Country</dt>
							<dd class="font-medium">{{ carrier.country_of_operation }}</dd>
						</div>
						<div v-if="carrier.regions_covered && carrier.regions_covered.length">
							<dt class="text-gray-500 dark:text-gray-400">Regions Covered</dt>
							<dd class="font-medium">
								<div class="flex flex-wrap gap-1">
									<span v-for="region in carrier.regions_covered" :key="region" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 capitalize">
										{{ region }}
									</span>
								</div>
							</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
		</div>

		<!-- Plans & Pricing Tab -->
		<div v-show="activeTab === 'plans'">
			<div class="prose dark:prose-invert max-w-none">
				<h2 class="text-2xl font-bold mb-4">Plans & Pricing</h2>
				<div v-if="carrier.plans" v-html="JSON.stringify(carrier.plans, null, 2)"></div>
				<p v-else class="text-gray-500 dark:text-gray-400">No plan information available yet.</p>
			</div>
		</div>

		<!-- Coverage Tab -->
		<div v-show="activeTab === 'coverage'">
			<div class="prose dark:prose-invert max-w-none">
				<h2 class="text-2xl font-bold mb-4">Coverage Information</h2>
				<div v-if="carrier.coverage_quality" class="space-y-4">
					<div>
						<h3>Coverage Quality</h3>
						<p class="capitalize">{{ formatField(carrier.coverage_quality) }}</p>
					</div>
					<div v-if="carrier.roaming_support">
						<h3>Roaming Support</h3>
						<p>{{ formatField(carrier.roaming_support) }}</p>
					</div>
					<div v-if="carrier.regions_covered && carrier.regions_covered.length">
						<h3>Regions Covered</h3>
						<ul>
							<li v-for="region in carrier.regions_covered" :key="region" class="capitalize">{{ region }}</li>
						</ul>
					</div>
				</div>
				<p v-else class="text-gray-500 dark:text-gray-400">No coverage information available yet.</p>
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
			<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
				<p>No change log entries yet.</p>
			</div>
		</div>

		<!-- Sources Tab Content -->
		<div v-show="activeTab === 'sources'">
			<div v-if="sources && sources.length > 0" class="space-y-4">
				<div v-for="source in sources" :key="source.id" class="border rounded-lg p-6 dark:border-gray-700">
					<div class="flex items-start justify-between mb-3">
						<h3 class="text-lg font-bold flex-1">{{ source.title }}</h3>
						<span v-if="source.type" class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 capitalize">
							{{ source.type }}
						</span>
					</div>
					<div class="space-y-2 text-sm">
						<p v-if="source.publisher" class="text-gray-600 dark:text-gray-400">
							<span class="font-medium">Publisher:</span> {{ source.publisher }}
						</p>
						<p v-if="source.date_published" class="text-gray-600 dark:text-gray-400">
							<span class="font-medium">Date:</span> {{ new Date(source.date_published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
						</p>
						<p v-if="source.quote" class="italic text-gray-700 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3">
							"{{ source.quote }}"
						</p>
						<p v-if="source.notes" class="text-gray-600 dark:text-gray-400">{{ source.notes }}</p>
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
			<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
				<p>No sources documented yet.</p>
			</div>
		</div>

		<!-- Alternatives Tab Content -->
		<div v-show="activeTab === 'alternatives'">
			<div v-if="alternatives && alternatives.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div v-for="alt in alternatives" :key="alt.id" class="border rounded-lg p-6 hover:shadow-lg transition-all dark:border-gray-700">
					<div class="flex items-start gap-4 mb-4">
						<div v-if="alt.brand_symbol_light" class="flex-shrink-0">
							<NuxtImg :src="alt.brand_symbol_light" :alt="alt.name" class="w-12 h-12 rounded-lg" />
						</div>
						<div class="flex-1">
							<NuxtLink :to="`/carriers/${alt.slug}`" class="hover:text-primary transition-colors">
								<h3 class="text-lg font-semibold">{{ alt.name }}</h3>
							</NuxtLink>
							<div class="flex flex-wrap gap-1 mt-2">
								<span v-if="alt.mvno_status === 'mvno'" class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
									MVNO
								</span>
								<span v-if="alt.esim_support" class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
									eSIM
								</span>
								<span v-if="alt['5g_available']" class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
									5G
								</span>
							</div>
						</div>
					</div>
					<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ alt.short_description }}</p>
					<NuxtLink :to="`/carriers/${alt.slug}`" class="text-sm text-primary hover:underline">
						View Details →
					</NuxtLink>
				</div>
			</div>
			<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
				<p>No alternatives found in the same categories.</p>
			</div>
		</div>
	</BlockContainer>
</template>
