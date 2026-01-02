<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Fetch app details
const { data: app } = await useAsyncData(`app-${slug}`, () => {
	return useDirectus(
		readItems('mobile_apps', {
			fields: ['*'],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'active' },
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
				<p v-if="app.developer_name" class="text-xl text-gray-600 dark:text-gray-400 mb-2 text-center">
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
	</BlockContainer>
</template>
