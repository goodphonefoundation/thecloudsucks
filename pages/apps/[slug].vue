<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Fetch app details
const { data: app } = await useAsyncData(`app-${slug}`, () => {
	return useDirectus(
		readItems('mobile_apps', {
			fields: [
				'*',
				'categories.mobile_app_categories_id.id',
				'categories.mobile_app_categories_id.name',
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
				'is_open_source',
				'end_to_end_encryption',
				'requires_phone_number',
				'categories.mobile_app_categories_id.id',
				'categories.mobile_app_categories_id.name',
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

// Markdown rendering
const { toHtml } = useMarkdown();
const tradeoffsHtml = computed(() => toHtml(app.value?.tradeoffs));
const longDescriptionHtml = computed(() => toHtml(app.value?.long_description));

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

				<!-- Assessment -->
				<div v-if="app.tier || app.recommended_use">
					<div class="border dark:border-gray-700 rounded-lg p-6">
						<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">GoodPhone Assessment</h2>
						<div v-if="app.tier" class="mb-2">
							<span
								:class="[
									'inline-flex items-center px-3 py-1.5 text-base font-semibold rounded-lg',
									app.tier === 'A_Sovereign' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
									app.tier === 'B_Aligned' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
									app.tier === 'C_Transitional' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
									app.tier === 'D_Extractive' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								]"
							>
								{{ getTierLabel(app.tier) }}
							</span>
						</div>
						<p v-if="app.recommended_use" class="text-sm text-gray-600 dark:text-gray-400">
							{{ getRecommendationLabel(app.recommended_use) }}
						</p>
						<p v-if="app.summary" class="mt-4 text-gray-700 dark:text-gray-300">{{ app.summary }}</p>
					</div>
				</div>

				<!-- Tradeoffs -->
				<div v-if="tradeoffsHtml">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tradeoffs</h2>
					<TypographyProse :content="tradeoffsHtml" />
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

				<!-- Privacy & Security -->
				<div class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Privacy & Security</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="app.end_to_end_encryption">
							<dt class="font-medium text-gray-700 dark:text-gray-300">E2E Encryption</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.end_to_end_encryption) }}</dd>
						</div>
						<div v-if="app.requires_phone_number !== null">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Phone Number</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ app.requires_phone_number ? 'Required' : 'Not Required' }}</dd>
						</div>
						<div v-if="app.data_collection">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Data Collection</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.data_collection) }}</dd>
						</div>
						<div v-if="app.is_open_source !== null">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Open Source</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ app.is_open_source ? 'Yes' : 'No' }}</dd>
						</div>
					</dl>
				</div>

				<!-- Metadata -->
				<div v-if="app.license || app.funding_model" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Details</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="app.license">
							<dt class="font-medium text-gray-700 dark:text-gray-300">License</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ app.license }}</dd>
						</div>
						<div v-if="app.funding_model">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Funding Model</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(app.funding_model) }}</dd>
						</div>
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
								<span
									v-if="alt.is_open_source"
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
									v-if="!alt.requires_phone_number"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
								>
									No Phone Required
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
				
				<!-- Vendor Information (if provided manually) -->
				<div v-if="app.organization?.vendor_information" class="mt-6 prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Additional Information</h2>
					<div v-html="app.organization.vendor_information"></div>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
