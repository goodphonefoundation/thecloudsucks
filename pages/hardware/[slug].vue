<script setup lang="ts">
import type { HardwareItem } from '~/types';

const route = useRoute();
const slug = route.params.slug as string;

// Fetch hardware model details with brand info
const { data: hardware } = await useAsyncData(`hardware-${slug}`, () => {
	return useDirectus(
		readItems('hardware_models', {
			fields: [
				'*',
				'brand.id',
				'brand.name',
				'brand.slug',
				'brand.website_url',
				'brand.brand_logo_light',
				'brand.brand_logo_dark',
				'brand.brand_symbol_light',
				'brand.brand_symbol_dark',
			],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'active' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Note: Sources and change logs reference the old hardware_items collection
// These will need to be migrated separately or will be empty for new models
const { data: sources } = await useAsyncData(`hardware-sources-${slug}`, async () => {
	return [];
	// TODO: Update hardware_sources collection to reference hardware_models
	// if (!hardware.value) return [];
	// return useDirectus(
	// 	readItems('hardware_sources', {
	// 		fields: ['*'],
	// 		filter: {
	// 			hardware_model: { _eq: hardware.value.id },
	// 			status: { _eq: 'published' },
	// 		},
	// 		sort: ['-date_published', 'title'],
	// 	}),
	// );
});

const { data: changeLogs } = await useAsyncData(`hardware-changelog-${slug}`, async () => {
	return [];
	// TODO: Update hardware_change_log collection to reference hardware_models
	// if (!hardware.value) return [];
	// return useDirectus(
	// 	readItems('hardware_change_log', {
	// 		fields: ['*'],
	// 		filter: {
	// 			hardware_model: { _eq: hardware.value.id },
	// 			status: { _eq: 'published' },
	// 		},
	// 		sort: ['-date'],
	// 	}),
	// );
});

// Fetch alternative hardware models of the same type
const { data: alternatives } = await useAsyncData(`hardware-alternatives-${slug}`, async () => {
	if (!hardware.value || !hardware.value.hardware_type) return [];
	
	return useDirectus(
		readItems('hardware_models', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'brand.brand_logo_light',
				'brand.brand_symbol_light',
				'tier',
				'bootloader_unlockable',
				'open_firmware_support',
				'hardware_type',
			],
			filter: {
				status: { _eq: 'active' },
				id: { _neq: hardware.value.id },
				hardware_type: { _eq: hardware.value.hardware_type },
			},
			sort: ['name'],
			limit: 6,
		}),
	);
});

// If hardware not found, show 404
if (!hardware.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Hardware Not Found',
	});
}

// SEO
useHead({
	title: hardware.value.name,
	meta: [
		{
			name: 'description',
			content: hardware.value.short_description || '',
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
	if (type === 'bootloader_unlockable' && value === 'yes') return 'green';
	if (type === 'open_firmware_support' && value === 'yes') return 'blue';
	if (type === 'telemetry_default' && value === 'none') return 'purple';
	if (type === 'repairability' && value === 'high') return 'green';
	if (type === 'parts_availability' && value === 'good') return 'green';
	if (type === 'cloud_dependency' && value === 'none') return 'purple';
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

// Markdown rendering
const { toHtml } = useMarkdown();
const tradeoffsHtml = computed(() => toHtml(hardware.value?.tradeoffs));
const longDescriptionHtml = computed(() => toHtml(hardware.value?.long_description));

// Tab state
const activeTab = ref('overview');
</script>

<template>
	<BlockContainer v-if="hardware">
		<!-- Header Section -->
		<div class="mb-8">
			<NuxtLink
				to="/hardware"
				class="inline-flex items-center text-sm text-primary hover:underline mb-6"
			>
				← Back to Hardware
			</NuxtLink>
			
			<!-- Logo Container (full width, rectangular) -->
			<div v-if="hardware.brand?.brand_logo_light || hardware.brand?.brand_logo_dark" class="mb-6 flex items-center justify-center w-full h-32 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl p-6">
				<!-- Light theme: use dark brand logo -->
				<img 
					:src="`/api/proxy/assets/${hardware.brand.brand_logo_dark || hardware.brand.brand_logo_light}`" 
					:alt="hardware.name" 
					class="h-full max-w-md object-contain dark:hidden" 
				/>
				<!-- Dark theme: use light brand logo -->
				<img 
					:src="`/api/proxy/assets/${hardware.brand.brand_logo_light || hardware.brand.brand_logo_dark}`" 
					:alt="hardware.name" 
					class="h-full max-w-md object-contain hidden dark:block" 
				/>
			</div>
			
			<div>
				<h1 class="text-4xl font-bold mb-3 text-gray-900 dark:text-white">{{ hardware.name }}</h1>
				<p v-if="hardware.brand?.name" class="text-xl text-gray-600 dark:text-gray-400 mb-2">
					by <NuxtLink v-if="hardware.brand.website_url" :to="hardware.brand.website_url" target="_blank" class="hover:text-primary">{{ hardware.brand.name }}</NuxtLink>
					<span v-else>{{ hardware.brand.name }}</span>
				</p>
				<p class="text-xl text-gray-600 dark:text-gray-400 mb-4">
					{{ hardware.short_description }}
				</p>
				
				<!-- Main Badges -->
				<div class="flex flex-wrap gap-2">
					<span
						v-if="hardware.hardware_type"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 capitalize"
					>
						{{ formatField(hardware.hardware_type) }}
					</span>
					<span
						v-if="hardware.bootloader_unlockable === 'yes'"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						Bootloader Unlockable
					</span>
					<span
						v-if="hardware.open_firmware_support === 'yes'"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						Open Firmware Support
					</span>
					<span
						v-if="hardware.telemetry_default === 'none'"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						No Telemetry
					</span>
					<span
						v-if="hardware.repairability === 'high'"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						High Repairability
					</span>
					<span
						v-if="hardware.cloud_dependency === 'none'"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						No Cloud Dependency
					</span>
					<span
						v-if="hardware.status"
						:class="[
							'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full capitalize',
							hardware.status === 'active' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
							hardware.status === 'deprecated' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
							hardware.status === 'watch' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
							hardware.status === 'unknown' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
						]"
					>
						{{ hardware.status }}
					</span>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3 mb-8 pb-8 border-b dark:border-gray-700">
			<UButton
				v-if="hardware.gsmarena_url"
				:to="hardware.gsmarena_url"
				target="_blank"
				color="primary"
				size="lg"
				icon="i-mdi-open-in-new"
			>
				View on GSMArena
			</UButton>
			<UButton
				v-if="hardware.brand?.website_url"
				:to="hardware.brand.website_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-domain"
			>
				{{ hardware.brand.name }} Website
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
		<!-- Main Content -->
		<div class="grid md:grid-cols-3 gap-8">
			<!-- Left Column: Description & Assessment -->
			<div class="md:col-span-2 space-y-6">
				<!-- Long Description -->
				<div v-if="longDescriptionHtml" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About</h2>
					<div v-html="longDescriptionHtml"></div>
				</div>

				<!-- Assessment Summary -->
				<div v-if="hardware.tier || hardware.recommended_use || hardware.summary" class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
					<div class="flex flex-wrap items-center gap-3 mb-4">
						<h2 class="text-2xl font-bold">GoodPhone Assessment</h2>
						<span v-if="hardware.tier" class="px-3 py-1 text-sm font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
							{{ getTierLabel(hardware.tier) }}
						</span>
						<span v-if="hardware.recommended_use" :class="[
							'px-3 py-1 text-sm font-bold rounded-full',
							hardware.recommended_use === 'recommended' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
							hardware.recommended_use === 'situational' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
							hardware.recommended_use === 'avoid' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
							hardware.recommended_use === 'compare_only' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
						]">
							{{ getRecommendationLabel(hardware.recommended_use) }}
						</span>
					</div>
					<p v-if="hardware.summary" class="text-gray-700 dark:text-gray-300">{{ hardware.summary }}</p>
				</div>

				<!-- Tradeoffs -->
				<div v-if="tradeoffsHtml" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tradeoffs</h2>
					<div v-html="tradeoffsHtml"></div>
				</div>

				<!-- Supply Chain Notes -->
				<div v-if="hardware.supply_chain_notes" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Supply Chain</h2>
					<p class="text-gray-700 dark:text-gray-300">{{ hardware.supply_chain_notes }}</p>
				</div>

				<!-- Assessment Scores -->
				<div v-if="hardware.scores">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Assessment Scores</h2>
					<div class="border rounded-lg p-6 dark:border-gray-700 space-y-4">
						<!-- Overall Score -->
						<div v-if="hardware.scores.overall !== null && hardware.scores.overall !== undefined" class="pb-4 border-b dark:border-gray-700">
							<div class="flex items-center justify-between mb-2">
								<span class="text-lg font-semibold">Overall Rating</span>
								<span :class="[
									'px-3 py-1 text-sm font-bold rounded-full',
									getScoreInfo(hardware.scores.overall).color === 'blue' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
									getScoreInfo(hardware.scores.overall).color === 'green' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
									getScoreInfo(hardware.scores.overall).color === 'yellow' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
									getScoreInfo(hardware.scores.overall).color === 'orange' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
									getScoreInfo(hardware.scores.overall).color === 'red' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								]">
									{{ getScoreInfo(hardware.scores.overall).label }}
								</span>
							</div>
							<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
								<div :class="[
									'h-3 rounded-full transition-all',
									getScoreInfo(hardware.scores.overall).color === 'blue' && 'bg-blue-600',
									getScoreInfo(hardware.scores.overall).color === 'green' && 'bg-green-600',
									getScoreInfo(hardware.scores.overall).color === 'yellow' && 'bg-yellow-600',
									getScoreInfo(hardware.scores.overall).color === 'orange' && 'bg-orange-600',
									getScoreInfo(hardware.scores.overall).color === 'red' && 'bg-red-600',
								]" :style="{ width: getScoreInfo(hardware.scores.overall).percentage + '%' }"></div>
							</div>
						</div>

						<!-- Individual Scores -->
						<div class="space-y-3">
							<div v-if="hardware.scores.privacy !== null && hardware.scores.privacy !== undefined">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Privacy</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ getScoreInfo(hardware.scores.privacy).label }}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div :class="[
										'h-2 rounded-full transition-all',
										getScoreInfo(hardware.scores.privacy).color === 'blue' && 'bg-blue-600',
										getScoreInfo(hardware.scores.privacy).color === 'green' && 'bg-green-600',
										getScoreInfo(hardware.scores.privacy).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(hardware.scores.privacy).color === 'orange' && 'bg-orange-600',
										getScoreInfo(hardware.scores.privacy).color === 'red' && 'bg-red-600',
									]" :style="{ width: getScoreInfo(hardware.scores.privacy).percentage + '%' }"></div>
								</div>
							</div>

							<div v-if="hardware.scores.autonomy !== null && hardware.scores.autonomy !== undefined">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">User Autonomy</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ getScoreInfo(hardware.scores.autonomy).label }}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div :class="[
										'h-2 rounded-full transition-all',
										getScoreInfo(hardware.scores.autonomy).color === 'blue' && 'bg-blue-600',
										getScoreInfo(hardware.scores.autonomy).color === 'green' && 'bg-green-600',
										getScoreInfo(hardware.scores.autonomy).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(hardware.scores.autonomy).color === 'orange' && 'bg-orange-600',
										getScoreInfo(hardware.scores.autonomy).color === 'red' && 'bg-red-600',
									]" :style="{ width: getScoreInfo(hardware.scores.autonomy).percentage + '%' }"></div>
								</div>
							</div>

							<div v-if="hardware.scores.transparency !== null && hardware.scores.transparency !== undefined">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Transparency</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ getScoreInfo(hardware.scores.transparency).label }}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div :class="[
										'h-2 rounded-full transition-all',
										getScoreInfo(hardware.scores.transparency).color === 'blue' && 'bg-blue-600',
										getScoreInfo(hardware.scores.transparency).color === 'green' && 'bg-green-600',
										getScoreInfo(hardware.scores.transparency).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(hardware.scores.transparency).color === 'orange' && 'bg-orange-600',
										getScoreInfo(hardware.scores.transparency).color === 'red' && 'bg-red-600',
									]" :style="{ width: getScoreInfo(hardware.scores.transparency).percentage + '%' }"></div>
								</div>
							</div>

							<div v-if="hardware.scores.governance !== null && hardware.scores.governance !== undefined">
								<div class="flex items-center justify-between mb-1">
									<span class="text-sm font-medium">Governance</span>
									<span class="text-xs text-gray-600 dark:text-gray-400">{{ getScoreInfo(hardware.scores.governance).label }}</span>
								</div>
								<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
									<div :class="[
										'h-2 rounded-full transition-all',
										getScoreInfo(hardware.scores.governance).color === 'blue' && 'bg-blue-600',
										getScoreInfo(hardware.scores.governance).color === 'green' && 'bg-green-600',
										getScoreInfo(hardware.scores.governance).color === 'yellow' && 'bg-yellow-600',
										getScoreInfo(hardware.scores.governance).color === 'orange' && 'bg-orange-600',
										getScoreInfo(hardware.scores.governance).color === 'red' && 'bg-red-600',
									]" :style="{ width: getScoreInfo(hardware.scores.governance).percentage + '%' }"></div>
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
				<!-- Phone Specifications -->
				<div v-if="hardware.hardware_type === 'phone'" class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Specifications</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="hardware.chipset">
							<dt class="text-gray-500 dark:text-gray-400">Chipset</dt>
							<dd class="font-medium">{{ hardware.chipset }}</dd>
						</div>
						<div v-if="hardware.os">
							<dt class="text-gray-500 dark:text-gray-400">OS</dt>
							<dd class="font-medium">{{ hardware.os }}</dd>
						</div>
						<div v-if="hardware.display_size">
							<dt class="text-gray-500 dark:text-gray-400">Display</dt>
							<dd class="font-medium">{{ hardware.display_size }}</dd>
						</div>
						<div v-if="hardware.display_type">
							<dt class="text-gray-500 dark:text-gray-400">Display Type</dt>
							<dd class="font-medium">{{ hardware.display_type }}</dd>
						</div>
						<div v-if="hardware.internal_storage && hardware.internal_storage.length">
							<dt class="text-gray-500 dark:text-gray-400">Storage Variants</dt>
							<dd class="font-medium">
								<div v-for="(variant, idx) in hardware.internal_storage" :key="idx" class="text-xs">
									{{ variant.storage }} / {{ variant.ram }} RAM
								</div>
							</dd>
						</div>
						<div v-if="hardware.battery_type">
							<dt class="text-gray-500 dark:text-gray-400">Battery</dt>
							<dd class="font-medium">{{ hardware.battery_type }}<span v-if="hardware.battery_charging"> ({{ hardware.battery_charging }})</span></dd>
						</div>
						<div v-if="hardware.main_camera && hardware.main_camera.length">
							<dt class="text-gray-500 dark:text-gray-400">Main Camera</dt>
							<dd class="font-medium text-xs">
								<div v-for="(cam, idx) in hardware.main_camera" :key="idx">
									{{ cam }}
								</div>
							</dd>
						</div>
						<div v-if="hardware.selfie_camera">
							<dt class="text-gray-500 dark:text-gray-400">Selfie Camera</dt>
							<dd class="font-medium text-xs">{{ hardware.selfie_camera }}</dd>
						</div>
						<div v-if="hardware.dimensions">
							<dt class="text-gray-500 dark:text-gray-400">Dimensions</dt>
							<dd class="font-medium text-xs">{{ hardware.dimensions }}</dd>
						</div>
						<div v-if="hardware.weight">
							<dt class="text-gray-500 dark:text-gray-400">Weight</dt>
							<dd class="font-medium">{{ hardware.weight }}</dd>
						</div>
						<div v-if="hardware.price">
							<dt class="text-gray-500 dark:text-gray-400">Price</dt>
							<dd class="font-medium">{{ hardware.price }}</dd>
						</div>
					</dl>
				</div>

				<!-- Repairability & Longevity -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Repairability & Longevity</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="hardware.repairability">
							<dt class="text-gray-500 dark:text-gray-400">Repairability</dt>
							<dd class="font-medium capitalize">{{ formatField(hardware.repairability) }}</dd>
						</div>
						<div v-if="hardware.parts_availability">
							<dt class="text-gray-500 dark:text-gray-400">Parts Availability</dt>
							<dd class="font-medium capitalize">{{ formatField(hardware.parts_availability) }}</dd>
						</div>
						<div v-if="hardware.warranty_years">
							<dt class="text-gray-500 dark:text-gray-400">Warranty</dt>
							<dd class="font-medium">{{ hardware.warranty_years }} years</dd>
						</div>
						<div v-if="hardware.software_support_years">
							<dt class="text-gray-500 dark:text-gray-400">Software Support</dt>
							<dd class="font-medium">{{ hardware.software_support_years }} years</dd>
						</div>
						<div v-if="hardware.security_updates_policy">
							<dt class="text-gray-500 dark:text-gray-400">Security Updates Policy</dt>
							<dd class="font-medium">{{ hardware.security_updates_policy }}</dd>
						</div>
					</dl>
				</div>

				<!-- Openness & Control -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Openness & Control</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="hardware.bootloader_unlockable">
							<dt class="text-gray-500 dark:text-gray-400">Bootloader Unlockable</dt>
							<dd class="font-medium capitalize">{{ formatField(hardware.bootloader_unlockable) }}</dd>
						</div>
						<div v-if="hardware.open_firmware_support">
							<dt class="text-gray-500 dark:text-gray-400">Open Firmware Support</dt>
							<dd class="font-medium capitalize">{{ formatField(hardware.open_firmware_support) }}</dd>
						</div>
						<div v-if="hardware.alternative_os_support">
							<dt class="text-gray-500 dark:text-gray-400">Alternative OS Support</dt>
							<dd class="font-medium">{{ hardware.alternative_os_support }}</dd>
						</div>
						<div v-if="hardware.telemetry_default">
							<dt class="text-gray-500 dark:text-gray-400">Default Telemetry</dt>
							<dd class="font-medium capitalize">{{ formatField(hardware.telemetry_default) }}</dd>
						</div>
						<div v-if="hardware.cloud_dependency">
							<dt class="text-gray-500 dark:text-gray-400">Cloud Dependency</dt>
							<dd class="font-medium capitalize">{{ formatField(hardware.cloud_dependency) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Compatibility Notes -->
				<div v-if="hardware.compatibility_notes" class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Compatibility</h3>
					<p class="text-sm text-gray-700 dark:text-gray-300">{{ hardware.compatibility_notes }}</p>
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
				<p class="text-gray-500 dark:text-gray-400">No change log entries available for this hardware.</p>
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
				<p class="text-gray-500 dark:text-gray-400">No sources available for this hardware.</p>
			</div>
		</div>

		<!-- Alternatives Tab Content -->
		<div v-show="activeTab === 'alternatives'">
			<div v-if="alternatives && alternatives.length > 0" class="grid md:grid-cols-2 gap-6">
				<NuxtLink 
					v-for="alt in alternatives" 
					:key="alt.id" 
					:to="`/hardware/${alt.slug}`"
					class="border rounded-lg p-6 hover:shadow-lg transition-shadow dark:border-gray-700 hover:border-primary dark:hover:border-primary"
				>
					<div class="flex items-start gap-4 mb-4">
						<div v-if="alt.brand?.brand_logo_light || alt.brand?.brand_symbol_light" class="flex-shrink-0">
							<img 
								:src="`/api/proxy/assets/${alt.brand.brand_symbol_light || alt.brand.brand_logo_light}`" 
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
									v-if="alt.bootloader_unlockable === 'yes'"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
								>
									Unlockable
								</span>
								<span
									v-if="alt.open_firmware_support === 'yes'"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
								>
									Open Firmware
								</span>
							</div>
						</div>
					</div>
					<p class="text-gray-600 dark:text-gray-400 text-sm">{{ alt.short_description }}</p>
					<div v-if="alt.hardware_type" class="mt-4">
						<span class="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 capitalize">
							{{ formatField(alt.hardware_type) }}
						</span>
					</div>
				</NuxtLink>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No alternative hardware found in the same category.</p>
			</div>
		</div>
	</BlockContainer>
</template>
