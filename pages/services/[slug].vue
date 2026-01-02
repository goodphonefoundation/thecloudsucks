<script setup lang="ts">
import type { Service } from '~/types';

const route = useRoute();
const slug = route.params.slug as string;

// Fetch service details
const { data: service } = await useAsyncData(`service-${slug}`, () => {
	return useDirectus(
		readItems('services', {
			fields: [
				'*',
				'categories.service_categories_id.id',
				'categories.service_categories_id.name',
				'categories.service_categories_id.slug',
				'vendor.id',
				'vendor.name',
				'hosting_modes.hosting_modes_id.id',
				'hosting_modes.hosting_modes_id.name',
				'score_privacy',
				'score_autonomy',
				'score_transparency',
				'score_governance',
				'score_overall',
			],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'published' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Fetch sources for this service
const { data: sources } = await useAsyncData(`service-sources-${slug}`, async () => {
	if (!service.value) return [];
	return useDirectus(
		readItems('service_sources', {
			fields: ['*'],
			filter: {
				service: { _eq: service.value.id },
				status: { _eq: 'published' },
			},
			sort: ['-date_published', 'title'],
		}),
	);
});

// Fetch change logs for this service
const { data: changeLogs } = await useAsyncData(`service-changelog-${slug}`, async () => {
	if (!service.value) return [];
	return useDirectus(
		readItems('service_change_log', {
			fields: ['*'],
			filter: {
				service: { _eq: service.value.id },
				status: { _eq: 'published' },
			},
			sort: ['-date'],
		}),
	);
});

// Fetch alternative services in the same categories
const { data: alternatives } = await useAsyncData(`service-alternatives-${slug}`, async () => {
	if (!service.value || !service.value.categories || service.value.categories.length === 0) return [];
	
	// Get category IDs
	const categoryIds = service.value.categories.map((cat: any) => cat.service_categories_id.id);
	
	return useDirectus(
		readItems('services', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'brand_logo_light',
				'brand_symbol_light',
				'score_overall',
				'end_to_end_encryption',
				'default_tracking',
				'self_hostable',
				'federated',
				'open_source_clients',
				'open_source_server',
				'categories.service_categories_id.id',
				'categories.service_categories_id.name',
			],
			filter: {
				status: { _eq: 'published' },
				id: { _neq: service.value.id },
				categories: {
					service_categories_id: {
						id: { _in: categoryIds },
					},
				},
			},
			sort: ['-score_overall', 'name'],
			limit: 6,
		}),
	);
});

// If service not found, show 404
if (!service.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Service Not Found',
	});
}

// SEO
useHead({
	title: service.value.name,
	meta: [
		{
			name: 'description',
			content: service.value.short_description || service.value.long_description || '',
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

const getBadgeColor = (type: string, value: any) => {
	if (type === 'is_open_source' && value) return 'green';
	if (type === 'end_to_end_encryption' && value === 'yes') return 'blue';
	if (type === 'default_tracking' && value === 'none') return 'purple';
	if (type === 'self_hostable' && value) return 'orange';
	if (type === 'federated' && value) return 'pink';

	if (type === 'service_status') {
		if (value === 'active') return 'green';
		if (value === 'deprecated') return 'red';
		if (value === 'watch') return 'yellow';
	}

	return 'gray';
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
	<BlockContainer v-if="service">
		<!-- Header Section -->
		<div class="mb-8">
			<NuxtLink to="/services" class="inline-flex items-center text-sm text-primary hover:underline mb-4">
				← Back to Services
			</NuxtLink>

			<div class="flex items-start gap-6">
				<div v-if="service.icon" class="flex-shrink-0">
					<NuxtImg :src="service.icon" :alt="service.name" class="w-24 h-24 rounded-xl" />
				</div>
				<div class="flex-1">
					<h1 class="text-4xl font-bold mb-2">{{ service.name }}</h1>
					<p class="text-xl text-gray-600 dark:text-gray-400 mb-4">
						{{ service.short_description }}
					</p>

					<!-- Main Badges -->
					<div class="flex flex-wrap gap-2">
						<span
							v-if="service.is_open_source"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
						>
							Open Source
						</span>
						<span
							v-if="service.end_to_end_encryption === 'yes'"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							E2E Encrypted
						</span>
						<span
							v-if="service.default_tracking === 'none'"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
						>
							No Tracking
						</span>
						<span
							v-if="service.self_hostable"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
						>
							Self-Hostable
						</span>
						<span
							v-if="service.federated"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
						>
							Federated
						</span>
						<span
							v-if="service.service_status"
							:class="[
								'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full capitalize',
								service.service_status === 'active' &&
									'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
								service.service_status === 'deprecated' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								service.service_status === 'watch' &&
									'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
								service.service_status === 'unknown' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
							]"
						>
							{{ service.service_status }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3 mb-8 pb-8 border-b dark:border-gray-700">
			<UButton
				v-if="service.website_url"
				:to="service.website_url"
				target="_blank"
				color="primary"
				size="lg"
				icon="i-mdi-open-in-new"
			>
				Visit Website
			</UButton>
			<UButton
				v-if="service.repo_url"
				:to="service.repo_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-github"
			>
				Source Code
			</UButton>
			<UButton
				v-if="service.docs_url"
				:to="service.docs_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-book-open"
			>
				Documentation
			</UButton>
			<UButton
				v-if="service.privacy_policy_url"
				:to="service.privacy_policy_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-shield-check"
			>
				Privacy Policy
			</UButton>
			<UButton
				v-if="service.terms_url"
				:to="service.terms_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-file-document"
			>
				Terms of Service
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
			<!-- Left Column: Description & Categories -->
			<div class="md:col-span-2 space-y-6">
				<!-- Long Description -->
				<div v-if="service.long_description" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">About</h2>
					<div v-html="service.long_description"></div>
				</div>

				<!-- Categories -->
				<div v-if="service.categories && service.categories.length > 0">
					<h2 class="text-2xl font-bold mb-4">Categories</h2>
					<div class="flex flex-wrap gap-2">
						<NuxtLink
							v-for="cat in service.categories"
							:key="cat.id"
							:to="`/services?category=${cat.service_categories_id.slug}`"
							class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
						>
							{{ cat.service_categories_id.name }}
						</NuxtLink>
					</div>
				</div>

				<!-- Assessment Summary -->
				<div
					v-if="service.assessment_tier || service.assessment_recommended_use || service.assessment_summary"
					class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
				>
					<div class="flex flex-wrap items-center gap-3 mb-4">
						<h2 class="text-2xl font-bold">GoodPhone Assessment</h2>
						<span
							v-if="service.assessment_tier"
							class="px-3 py-1 text-sm font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							{{ getTierLabel(service.assessment_tier) }}
						</span>
						<span
							v-if="service.assessment_recommended_use"
							:class="[
								'px-3 py-1 text-sm font-bold rounded-full',
								service.assessment_recommended_use === 'recommended' &&
									'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
								service.assessment_recommended_use === 'situational' &&
									'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
								service.assessment_recommended_use === 'avoid' &&
									'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								service.assessment_recommended_use === 'compare_only' &&
									'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
							]"
						>
							{{ getRecommendationLabel(service.assessment_recommended_use) }}
						</span>
					</div>
					<p v-if="service.assessment_summary" class="text-gray-700 dark:text-gray-300">
						{{ service.assessment_summary }}
					</p>
				</div>

				<!-- Assessment Content Sections -->
				<div v-if="service.assessment_what_it_does" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">What It Does</h2>
					<div v-html="service.assessment_what_it_does"></div>
				</div>

				<div v-if="service.assessment_why_people_use_it" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Why People Use It</h2>
					<div v-html="service.assessment_why_people_use_it"></div>
				</div>

				<div v-if="service.assessment_tradeoffs" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Tradeoffs</h2>
					<div v-html="service.assessment_tradeoffs"></div>
				</div>

				<div v-if="service.assessment_data_and_control" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Data & Control</h2>
					<div v-html="service.assessment_data_and_control"></div>
				</div>

				<div v-if="service.assessment_governance_and_business" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Governance & Business</h2>
					<div v-html="service.assessment_governance_and_business"></div>
				</div>

				<div v-if="service.assessment_goodphone_assessment" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">GoodPhone's Assessment</h2>
					<div v-html="service.assessment_goodphone_assessment"></div>
				</div>

				<!-- Assessment Scores -->
				<div v-if="service.score_overall !== null || service.score_privacy !== null">
					<h2 class="text-2xl font-bold mb-4">Assessment Scores</h2>
					<div class="border rounded-lg p-6 dark:border-gray-700 space-y-4">
						<!-- Overall Score -->
						<div v-if="service.score_overall !== null" class="pb-4 border-b dark:border-gray-700">
							<div class="flex items-center justify-between mb-2">
								<span class="text-lg font-semibold">Overall Rating</span>
								<span
									:class="[
										'px-3 py-1 text-sm font-bold rounded-full',
										getScoreInfo(service.score_overall).color === 'blue' &&
											'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
										getScoreInfo(service.score_overall).color === 'green' &&
											'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
										getScoreInfo(service.score_overall).color === 'yellow' &&
											'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
										getScoreInfo(service.score_overall).color === 'orange' &&
											'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
										getScoreInfo(service.score_overall).color === 'red' &&
											'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
									]"
								>
									{{ getScoreInfo(service.score_overall).label }}
								</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
								<div
									:class="[
										'h-3 rounded-full transition-all',
										getScoreInfo(service.score_overall).color === 'blue' && 'bg-blue-600',
										getScoreInfo(service.score_overall).color === 'green' && 'bg-green-600',
										getScoreInfo(service.score_overall).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(service.score_overall).color === 'orange' && 'bg-orange-600',
										getScoreInfo(service.score_overall).color === 'red' && 'bg-red-600',
									]"
									:style="{ width: getScoreInfo(service.score_overall).percentage + '%' }"
								></div>
							</div>
						</div>

						<!-- Individual Scores -->
						<div class="space-y-3">
							<div v-if="service.score_privacy !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Privacy</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{{ getScoreInfo(service.score_privacy).label }}
									</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										:class="[
											'h-2 rounded-full transition-all',
											getScoreInfo(service.score_privacy).color === 'blue' && 'bg-blue-600',
											getScoreInfo(service.score_privacy).color === 'green' && 'bg-green-600',
											getScoreInfo(service.score_privacy).color === 'yellow' && 'bg-yellow-600',
											getScoreInfo(service.score_privacy).color === 'orange' && 'bg-orange-600',
											getScoreInfo(service.score_privacy).color === 'red' && 'bg-red-600',
										]"
										:style="{ width: getScoreInfo(service.score_privacy).percentage + '%' }"
									></div>
								</div>
							</div>

							<div v-if="service.score_autonomy !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">User Autonomy</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{{ getScoreInfo(service.score_autonomy).label }}
									</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										:class="[
											'h-2 rounded-full transition-all',
											getScoreInfo(service.score_autonomy).color === 'blue' && 'bg-blue-600',
											getScoreInfo(service.score_autonomy).color === 'green' && 'bg-green-600',
											getScoreInfo(service.score_autonomy).color === 'yellow' && 'bg-yellow-600',
											getScoreInfo(service.score_autonomy).color === 'orange' && 'bg-orange-600',
											getScoreInfo(service.score_autonomy).color === 'red' && 'bg-red-600',
										]"
										:style="{ width: getScoreInfo(service.score_autonomy).percentage + '%' }"
									></div>
								</div>
							</div>

							<div v-if="service.score_transparency !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Transparency</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{{ getScoreInfo(service.score_transparency).label }}
									</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										:class="[
											'h-2 rounded-full transition-all',
											getScoreInfo(service.score_transparency).color === 'blue' && 'bg-blue-600',
											getScoreInfo(service.score_transparency).color === 'green' && 'bg-green-600',
											getScoreInfo(service.score_transparency).color === 'yellow' && 'bg-yellow-600',
											getScoreInfo(service.score_transparency).color === 'orange' && 'bg-orange-600',
											getScoreInfo(service.score_transparency).color === 'red' && 'bg-red-600',
										]"
										:style="{ width: getScoreInfo(service.score_transparency).percentage + '%' }"
									></div>
								</div>
							</div>

							<div v-if="service.score_governance !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Governance</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{{ getScoreInfo(service.score_governance).label }}
									</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div
										:class="[
											'h-2 rounded-full transition-all',
											getScoreInfo(service.score_governance).color === 'blue' && 'bg-blue-600',
											getScoreInfo(service.score_governance).color === 'green' && 'bg-green-600',
											getScoreInfo(service.score_governance).color === 'yellow' && 'bg-yellow-600',
											getScoreInfo(service.score_governance).color === 'orange' && 'bg-orange-600',
											getScoreInfo(service.score_governance).color === 'red' && 'bg-red-600',
										]"
										:style="{ width: getScoreInfo(service.score_governance).percentage + '%' }"
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
				<!-- Privacy & Security -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Privacy & Security</h3>
					<dl class="space-y-3 text-sm">
						<div>
							<dt class="text-gray-500 dark:text-gray-400">End-to-End Encryption</dt>
							<dd class="font-medium capitalize">{{ formatField(service.end_to_end_encryption) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Default Tracking</dt>
							<dd class="font-medium capitalize">{{ formatField(service.default_tracking) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Data Portability</dt>
							<dd class="font-medium capitalize">{{ formatField(service.data_portability) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Technical Info -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Technical Information</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="service.open_source_clients">
							<dt class="text-gray-500 dark:text-gray-400">Open Source Clients</dt>
							<dd class="font-medium capitalize">{{ formatField(service.open_source_clients) }}</dd>
						</div>
						<div v-if="service.open_source_server">
							<dt class="text-gray-500 dark:text-gray-400">Open Source Server</dt>
							<dd class="font-medium capitalize">{{ formatField(service.open_source_server) }}</dd>
						</div>
						<div v-if="service.license_type_client">
							<dt class="text-gray-500 dark:text-gray-400">Client License</dt>
							<dd class="font-medium">{{ service.license_type_client }}</dd>
						</div>
						<div v-if="service.license_type_server">
							<dt class="text-gray-500 dark:text-gray-400">Server License</dt>
							<dd class="font-medium">{{ service.license_type_server }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Self-Hostable</dt>
							<dd class="font-medium">{{ formatField(service.self_hostable) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Federated</dt>
							<dd class="font-medium">{{ formatField(service.federated) }}</dd>
						</div>
						<div v-if="service.hosting_modes && service.hosting_modes.length">
							<dt class="text-gray-500 dark:text-gray-400">Hosting Modes</dt>
							<dd class="font-medium">
								<div class="flex flex-wrap gap-1">
									<span v-for="mode in service.hosting_modes" :key="mode.id" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800">
										{{ mode.hosting_modes_id.name }}
									</span>
								</div>
							</dd>
						</div>
						<div v-if="service.platforms_supported && service.platforms_supported.length">
							<dt class="text-gray-500 dark:text-gray-400">Platforms</dt>
							<dd class="font-medium">
								<div class="flex flex-wrap gap-1">
									<span v-for="platform in service.platforms_supported" :key="platform" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 capitalize">
										{{ platform }}
									</span>
								</div>
							</dd>
						</div>
						<div v-if="service.protocols && service.protocols.length">
							<dt class="text-gray-500 dark:text-gray-400">Protocols</dt>
							<dd class="font-medium">
								<div class="flex flex-wrap gap-1">
									<span v-for="protocol in service.protocols" :key="protocol" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800">
										{{ protocol }}
									</span>
								</div>
							</dd>
						</div>
						<div v-if="service.features && service.features.length">
							<dt class="text-gray-500 dark:text-gray-400">Features</dt>
							<dd class="font-medium">
								<div class="flex flex-wrap gap-1">
									<span v-for="feature in service.features" :key="feature" class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 capitalize">
										{{ formatField(feature) }}
									</span>
								</div>
							</dd>
						</div>
						<div v-if="service.simultaneous_devices">
							<dt class="text-gray-500 dark:text-gray-400">Simultaneous Devices</dt>
							<dd class="font-medium">{{ service.simultaneous_devices }}</dd>
						</div>
						<div v-if="service.audience_level">
							<dt class="text-gray-500 dark:text-gray-400">Audience Level</dt>
							<dd class="font-medium capitalize">{{ service.audience_level }}</dd>
						</div>
					</dl>
				</div>

				<!-- Audit & Security -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Audit & Security</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="service.audit_claimed !== null">
							<dt class="text-gray-500 dark:text-gray-400">Audited</dt>
							<dd class="font-medium">{{ formatField(service.audit_claimed) }}</dd>
						</div>
						<div v-if="service.audit_links && service.audit_links.length">
							<dt class="text-gray-500 dark:text-gray-400">Audit Reports</dt>
							<dd class="space-y-1">
								<a v-for="(audit, idx) in service.audit_links" :key="idx" :href="audit.url" target="_blank" class="block text-primary hover:underline text-xs">
									View Report {{ idx + 1 }}
								</a>
							</dd>
						</div>
						<div v-if="service.logging_policy">
							<dt class="text-gray-500 dark:text-gray-400">Logging Policy</dt>
							<dd class="font-medium capitalize">{{ formatField(service.logging_policy) }}</dd>
						</div>
						<div v-if="service.warrant_canary !== null">
							<dt class="text-gray-500 dark:text-gray-400">Warrant Canary</dt>
							<dd class="font-medium">{{ formatField(service.warrant_canary) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Organization Info -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Organization</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="service.vendor">
							<dt class="text-gray-500 dark:text-gray-400">Vendor</dt>
							<dd class="font-medium">{{ service.vendor.name }}</dd>
						</div>
						<div v-if="service.jurisdiction">
							<dt class="text-gray-500 dark:text-gray-400">Jurisdiction</dt>
							<dd class="font-medium">{{ service.jurisdiction }}</dd>
						</div>
						<div v-if="service.ownership">
							<dt class="text-gray-500 dark:text-gray-400">Ownership</dt>
							<dd class="font-medium">{{ service.ownership }}</dd>
						</div>
						<div v-if="service.governance_model">
							<dt class="text-gray-500 dark:text-gray-400">Governance Model</dt>
							<dd class="font-medium capitalize">{{ formatField(service.governance_model) }}</dd>
						</div>
						<div v-if="service.primary_business_model">
							<dt class="text-gray-500 dark:text-gray-400">Business Model</dt>
							<dd class="font-medium capitalize">{{ formatField(service.primary_business_model) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Values Assessment (New Scoring System) -->
				<div v-if="service.scores" class="border rounded-lg p-6 dark:border-gray-700">
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-lg font-semibold">Values Assessment</h3>
						<span v-if="service.confidence" :class="[
							'px-2 py-1 text-xs font-medium rounded-full',
							service.confidence === 'high' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
							service.confidence === 'medium' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
							service.confidence === 'low' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
						]">
							{{ service.confidence }} confidence
						</span>
					</div>
					<dl class="space-y-4 text-sm">
						<div v-if="service.scores.autonomy !== null && service.scores.autonomy !== undefined">
							<div class="flex items-center justify-between mb-1">
								<dt class="text-gray-500 dark:text-gray-400">Autonomy</dt>
								<dd class="font-medium">{{ service.scores.autonomy }}/4</dd>
							</div>
							<p v-if="service.score_justifications?.autonomy" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
								{{ service.score_justifications.autonomy }}
							</p>
						</div>
						<div v-if="service.scores.control_ownership !== null && service.scores.control_ownership !== undefined">
							<div class="flex items-center justify-between mb-1">
								<dt class="text-gray-500 dark:text-gray-400">Control & Ownership</dt>
								<dd class="font-medium">{{ service.scores.control_ownership }}/4</dd>
							</div>
							<p v-if="service.score_justifications?.control_ownership" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
								{{ service.score_justifications.control_ownership }}
							</p>
						</div>
						<div v-if="service.scores.human_impact !== null && service.scores.human_impact !== undefined">
							<div class="flex items-center justify-between mb-1">
								<dt class="text-gray-500 dark:text-gray-400">Human Impact</dt>
								<dd class="font-medium">{{ service.scores.human_impact }}/4</dd>
							</div>
							<p v-if="service.score_justifications?.human_impact" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
								{{ service.score_justifications.human_impact }}
							</p>
						</div>
						<div v-if="service.scores.resilience !== null && service.scores.resilience !== undefined">
							<div class="flex items-center justify-between mb-1">
								<dt class="text-gray-500 dark:text-gray-400">Resilience</dt>
								<dd class="font-medium">{{ service.scores.resilience }}/4</dd>
							</div>
							<p v-if="service.score_justifications?.resilience" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
								{{ service.score_justifications.resilience }}
							</p>
						</div>
						<div v-if="service.scores.transparency !== null && service.scores.transparency !== undefined">
							<div class="flex items-center justify-between mb-1">
								<dt class="text-gray-500 dark:text-gray-400">Transparency</dt>
								<dd class="font-medium">{{ service.scores.transparency }}/4</dd>
							</div>
							<p v-if="service.score_justifications?.transparency" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
								{{ service.score_justifications.transparency }}
							</p>
						</div>
					</dl>
				</div>

				<!-- Additional Links -->
				<div v-if="service.apps_download_url" class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Downloads</h3>
					<a :href="service.apps_download_url" target="_blank" class="text-primary hover:underline text-sm">
						Download Apps
					</a>
				</div>

				<!-- Disclaimer -->
				<div v-if="service.disclaimer" class="border rounded-lg p-6 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
					<h3 class="text-lg font-semibold mb-2">Notice</h3>
					<p class="text-sm text-gray-700 dark:text-gray-300">{{ service.disclaimer }}</p>
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
				<p class="text-gray-500 dark:text-gray-400">No change log entries available for this service.</p>
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
				<p class="text-gray-500 dark:text-gray-400">No sources available for this service.</p>
			</div>
		</div>

		<!-- Alternatives Tab Content -->
		<div v-show="activeTab === 'alternatives'">
			<div v-if="alternatives && alternatives.length > 0" class="grid md:grid-cols-2 gap-6">
				<NuxtLink 
					v-for="alt in alternatives" 
					:key="alt.id" 
					:to="`/services/${alt.slug}`"
					class="border rounded-lg p-6 hover:shadow-lg transition-shadow dark:border-gray-700 hover:border-primary dark:hover:border-primary"
				>
					<div class="flex items-start gap-4 mb-4">
						<div v-if="alt.brand_logo_light || alt.brand_symbol_light" class="flex-shrink-0">
							<img 
								:src="`/api/proxy/assets/${alt.brand_logo_light || alt.brand_symbol_light}`" 
								:alt="alt.name" 
								class="w-16 h-16 rounded-lg object-contain" 
							/>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 mb-2">
								<h3 class="text-xl font-semibold">{{ alt.name }}</h3>
								<span v-if="alt.score_overall !== null" :class="[
									'px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap flex-shrink-0',
									getScoreInfo(alt.score_overall).color === 'blue' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
									getScoreInfo(alt.score_overall).color === 'green' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
									getScoreInfo(alt.score_overall).color === 'yellow' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
									getScoreInfo(alt.score_overall).color === 'orange' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
									getScoreInfo(alt.score_overall).color === 'red' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
									getScoreInfo(alt.score_overall).color === 'gray' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
								]">
									{{ getScoreInfo(alt.score_overall).label }}
								</span>
							</div>
							<div class="flex flex-wrap gap-2">
								<span
									v-if="alt.open_source_clients === 'yes' || alt.open_source_server === 'yes'"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
								>
									Open Source
								</span>
								<span
									v-if="alt.end_to_end_encryption === 'yes'"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
								>
									E2E Encrypted
								</span>
								<span
									v-if="alt.default_tracking === 'none'"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
								>
									No Tracking
								</span>
								<span
									v-if="alt.self_hostable"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
								>
									Self-Hostable
								</span>
								<span
									v-if="alt.federated"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
								>
									Federated
								</span>
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
							{{ cat.service_categories_id.name }}
						</span>
					</div>
				</NuxtLink>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No alternative services found in the same categories.</p>
			</div>
		</div>
	</BlockContainer>
</template>
