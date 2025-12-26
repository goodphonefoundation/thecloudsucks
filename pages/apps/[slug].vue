<script setup lang="ts">
import type { App } from '~/types';

const route = useRoute();
const slug = route.params.slug as string;

// Fetch app details
const { data: app } = await useAsyncData(`app-${slug}`, () => {
	return useDirectus(
		readItems('apps', {
			fields: [
				'*',
				'categories.app_categories_id.id',
				'categories.app_categories_id.name',
				'categories.app_categories_id.slug',
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
			content: app.value.short_description || app.value.long_description || '',
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
	if (type === 'app_status') {
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
</script>

<template>
	<BlockContainer v-if="app">
		<!-- Header Section -->
		<div class="mb-8">
			<NuxtLink
				to="/services"
				class="inline-flex items-center text-sm text-primary hover:underline mb-4"
			>
				← Back to Apps
			</NuxtLink>
			
			<div class="flex items-start gap-6">
				<div v-if="app.icon" class="flex-shrink-0">
					<NuxtImg :src="app.icon" :alt="app.name" class="w-24 h-24 rounded-xl" />
				</div>
				<div class="flex-1">
					<h1 class="text-4xl font-bold mb-2">{{ app.name }}</h1>
					<p class="text-xl text-gray-600 dark:text-gray-400 mb-4">
						{{ app.short_description }}
					</p>
					
					<!-- Main Badges -->
					<div class="flex flex-wrap gap-2">
						<span
							v-if="app.is_open_source"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
						>
							Open Source
						</span>
						<span
							v-if="app.end_to_end_encryption === 'yes'"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							E2E Encrypted
						</span>
						<span
							v-if="app.default_tracking === 'none'"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
						>
							No Tracking
						</span>
						<span
							v-if="app.self_hostable"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
						>
							Self-Hostable
						</span>
						<span
							v-if="app.federated"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
						>
							Federated
						</span>
						<span
							v-if="app.app_status"
							:class="[
								'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full capitalize',
								app.app_status === 'active' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
								app.app_status === 'deprecated' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								app.app_status === 'watch' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
								app.app_status === 'unknown' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
							]"
						>
							{{ app.app_status }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3 mb-8 pb-8 border-b dark:border-gray-700">
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
			<UButton
				v-if="app.docs_url"
				:to="app.docs_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-book-open"
			>
				Documentation
			</UButton>
			<UButton
				v-if="app.privacy_policy_url"
				:to="app.privacy_policy_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-shield-check"
			>
				Privacy Policy
			</UButton>
			<UButton
				v-if="app.terms_url"
				:to="app.terms_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-file-document"
			>
				Terms of Service
			</UButton>
		</div>

		<!-- Main Content Grid -->
		<div class="grid md:grid-cols-3 gap-8">
			<!-- Left Column: Description & Categories -->
			<div class="md:col-span-2 space-y-6">
				<!-- Long Description -->
				<div v-if="app.long_description" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">About</h2>
					<div v-html="app.long_description"></div>
				</div>

				<!-- Categories -->
				<div v-if="app.categories && app.categories.length > 0">
					<h2 class="text-2xl font-bold mb-4">Categories</h2>
					<div class="flex flex-wrap gap-2">
						<NuxtLink
							v-for="cat in app.categories"
							:key="cat.id"
							:to="`/services?category=${cat.app_categories_id.slug}`"
							class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
						>
							{{ cat.app_categories_id.name }}
						</NuxtLink>
					</div>
				</div>

				<!-- Assessment Summary -->
				<div v-if="app.assessment_tier || app.assessment_recommended_use || app.assessment_summary" class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
					<div class="flex flex-wrap items-center gap-3 mb-4">
						<h2 class="text-2xl font-bold">GoodPhone Assessment</h2>
						<span v-if="app.assessment_tier" class="px-3 py-1 text-sm font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
							{{ getTierLabel(app.assessment_tier) }}
						</span>
						<span v-if="app.assessment_recommended_use" :class="[
							'px-3 py-1 text-sm font-bold rounded-full',
							app.assessment_recommended_use === 'recommended' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
							app.assessment_recommended_use === 'situational' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
							app.assessment_recommended_use === 'avoid' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
							app.assessment_recommended_use === 'compare_only' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
						]">
							{{ getRecommendationLabel(app.assessment_recommended_use) }}
						</span>
					</div>
					<p v-if="app.assessment_summary" class="text-gray-700 dark:text-gray-300">{{ app.assessment_summary }}</p>
				</div>

				<!-- Assessment Content Sections -->
				<div v-if="app.assessment_what_it_does" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">What It Does</h2>
					<div v-html="app.assessment_what_it_does"></div>
				</div>

				<div v-if="app.assessment_why_people_use_it" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Why People Use It</h2>
					<div v-html="app.assessment_why_people_use_it"></div>
				</div>

				<div v-if="app.assessment_tradeoffs" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Tradeoffs</h2>
					<div v-html="app.assessment_tradeoffs"></div>
				</div>

				<div v-if="app.assessment_data_and_control" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Data & Control</h2>
					<div v-html="app.assessment_data_and_control"></div>
				</div>

				<div v-if="app.assessment_governance_and_business" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">Governance & Business</h2>
					<div v-html="app.assessment_governance_and_business"></div>
				</div>

				<div v-if="app.assessment_goodphone_assessment" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">GoodPhone's Assessment</h2>
					<div v-html="app.assessment_goodphone_assessment"></div>
				</div>

				<!-- Assessment Scores -->
				<div v-if="app.score_overall !== null || app.score_privacy !== null">
					<h2 class="text-2xl font-bold mb-4">Assessment Scores</h2>
					<div class="border rounded-lg p-6 dark:border-gray-700 space-y-4">
						<!-- Overall Score -->
						<div v-if="app.score_overall !== null" class="pb-4 border-b dark:border-gray-700">
							<div class="flex items-center justify-between mb-2">
								<span class="text-lg font-semibold">Overall Rating</span>
								<span :class="[
									'px-3 py-1 text-sm font-bold rounded-full',
									getScoreInfo(app.score_overall).color === 'blue' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
									getScoreInfo(app.score_overall).color === 'green' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
									getScoreInfo(app.score_overall).color === 'yellow' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
									getScoreInfo(app.score_overall).color === 'orange' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
									getScoreInfo(app.score_overall).color === 'red' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								]">
									{{ getScoreInfo(app.score_overall).label }}
								</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
								<div :class="[
									'h-3 rounded-full transition-all',
									getScoreInfo(app.score_overall).color === 'blue' && 'bg-blue-600',
									getScoreInfo(app.score_overall).color === 'green' && 'bg-green-600',
									getScoreInfo(app.score_overall).color === 'yellow' && 'bg-yellow-600',
									getScoreInfo(app.score_overall).color === 'orange' && 'bg-orange-600',
									getScoreInfo(app.score_overall).color === 'red' && 'bg-red-600',
								]" :style="{ width: getScoreInfo(app.score_overall).percentage + '%' }"></div>
							</div>
						</div>

						<!-- Individual Scores -->
						<div class="space-y-3">
							<div v-if="app.score_privacy !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Privacy</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ getScoreInfo(app.score_privacy).label }}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div :class="[
										'h-2 rounded-full transition-all',
										getScoreInfo(app.score_privacy).color === 'blue' && 'bg-blue-600',
										getScoreInfo(app.score_privacy).color === 'green' && 'bg-green-600',
										getScoreInfo(app.score_privacy).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(app.score_privacy).color === 'orange' && 'bg-orange-600',
										getScoreInfo(app.score_privacy).color === 'red' && 'bg-red-600',
									]" :style="{ width: getScoreInfo(app.score_privacy).percentage + '%' }"></div>
								</div>
							</div>

							<div v-if="app.score_autonomy !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">User Autonomy</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ getScoreInfo(app.score_autonomy).label }}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div :class="[
										'h-2 rounded-full transition-all',
										getScoreInfo(app.score_autonomy).color === 'blue' && 'bg-blue-600',
										getScoreInfo(app.score_autonomy).color === 'green' && 'bg-green-600',
										getScoreInfo(app.score_autonomy).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(app.score_autonomy).color === 'orange' && 'bg-orange-600',
										getScoreInfo(app.score_autonomy).color === 'red' && 'bg-red-600',
									]" :style="{ width: getScoreInfo(app.score_autonomy).percentage + '%' }"></div>
								</div>
							</div>

							<div v-if="app.score_transparency !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Transparency</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ getScoreInfo(app.score_transparency).label }}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div :class="[
										'h-2 rounded-full transition-all',
										getScoreInfo(app.score_transparency).color === 'blue' && 'bg-blue-600',
										getScoreInfo(app.score_transparency).color === 'green' && 'bg-green-600',
										getScoreInfo(app.score_transparency).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(app.score_transparency).color === 'orange' && 'bg-orange-600',
										getScoreInfo(app.score_transparency).color === 'red' && 'bg-red-600',
									]" :style="{ width: getScoreInfo(app.score_transparency).percentage + '%' }"></div>
								</div>
							</div>

							<div v-if="app.score_governance !== null">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Governance</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ getScoreInfo(app.score_governance).label }}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div :class="[
										'h-2 rounded-full transition-all',
										getScoreInfo(app.score_governance).color === 'blue' && 'bg-blue-600',
										getScoreInfo(app.score_governance).color === 'green' && 'bg-green-600',
										getScoreInfo(app.score_governance).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(app.score_governance).color === 'orange' && 'bg-orange-600',
										getScoreInfo(app.score_governance).color === 'red' && 'bg-red-600',
									]" :style="{ width: getScoreInfo(app.score_governance).percentage + '%' }"></div>
								</div>
							</div>
						</div>

						<!-- Score Legend -->
						<div class="pt-4 border-t dark:border-gray-700">
							<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Rating Scale:</p>
							<div class="flex flex-wrap gap-2 text-xs">
								<span class="px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">0 - Hostile</span>
								<span class="px-2 py-1 rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">1 - Weak</span>
								<span class="px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">2 - Mixed</span>
								<span class="px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">3 - Strong</span>
								<span class="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">4 - Best-in-Class</span>
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
							<dd class="font-medium capitalize">{{ formatField(app.end_to_end_encryption) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Default Tracking</dt>
							<dd class="font-medium capitalize">{{ formatField(app.default_tracking) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Data Portability</dt>
							<dd class="font-medium capitalize">{{ formatField(app.data_portability) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Technical Info -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Technical Information</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="app.license_type">
							<dt class="text-gray-500 dark:text-gray-400">License</dt>
							<dd class="font-medium">{{ app.license_type }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Open Source</dt>
							<dd class="font-medium">{{ formatField(app.is_open_source) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Self-Hostable</dt>
							<dd class="font-medium">{{ formatField(app.self_hostable) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Federated</dt>
							<dd class="font-medium">{{ formatField(app.federated) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Organization Info -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Organization</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="app.vendor">
							<dt class="text-gray-500 dark:text-gray-400">Vendor</dt>
							<dd class="font-medium">{{ app.vendor }}</dd>
						</div>
						<div v-if="app.governance_model">
							<dt class="text-gray-500 dark:text-gray-400">Governance Model</dt>
							<dd class="font-medium capitalize">{{ formatField(app.governance_model) }}</dd>
						</div>
						<div v-if="app.primary_business_model">
							<dt class="text-gray-500 dark:text-gray-400">Business Model</dt>
							<dd class="font-medium capitalize">{{ formatField(app.primary_business_model) }}</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
