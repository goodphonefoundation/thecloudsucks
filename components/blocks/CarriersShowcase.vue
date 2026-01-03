<script setup lang="ts">
import type { BlockCarriersShowcase, Carrier, CarrierCategory } from '~/types';

const props = defineProps<{
	data: BlockCarriersShowcase | null;
}>();

// Reactive filters
const searchQuery = ref<string>('');
const selectedCategory = ref<string | null>(null);
const viewMode = ref<'grid' | 'list'>('grid');
const advancedFilters = ref({
	mvno_only: false,
	esim_support: false,
	five_g: false,
	prepaid_anonymous: false,
	no_contract: false,
});

// Fetch categories
const { data: categories } = await useAsyncData('carrier-categories', () => {
	return useDirectus(
		readItems('carrier_categories', {
			fields: ['id', 'name', 'slug'],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});

// Fetch all carriers with categories
const { data: carriersData } = await useAsyncData('carriers-showcase', () => {
	return useDirectus(
		readItems('carriers', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'website_url',
				'brand_logo_light',
				'brand_logo_dark',
				'brand_symbol_light',
				'brand_symbol_dark',
				'parent_company',
				'network_type',
				'mvno_status',
				'esim_support',
				'5g_available',
				'prepaid_available',
				'postpaid_available',
				'prepaid_anonymous',
				'contract_flexibility',
				'coverage_quality',
				'privacy_score',
				'overall_score',
				'categories.carrier_categories_id.id',
				'categories.carrier_categories_id.name',
			],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});

// Filter carriers based on search, category, and advanced filters
const filteredCarriers = computed(() => {
	if (!carriersData.value) return [];

	let filtered = carriersData.value;

	// Search filter
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase().trim();
		filtered = filtered.filter((carrier: any) => {
			return (
				carrier.name?.toLowerCase().includes(query) ||
				carrier.short_description?.toLowerCase().includes(query) ||
				carrier.parent_company?.toLowerCase().includes(query)
			);
		});
	}

	// Category filter
	if (selectedCategory.value) {
		filtered = filtered.filter((carrier: any) => {
			return carrier.categories?.some((cat: any) => {
				return cat.carrier_categories_id?.id === selectedCategory.value;
			});
		});
	}

	// Advanced filters
	if (advancedFilters.value.mvno_only) {
		filtered = filtered.filter((carrier: any) => carrier.mvno_status === 'mvno');
	}
	if (advancedFilters.value.esim_support) {
		filtered = filtered.filter((carrier: any) => carrier.esim_support === true);
	}
	if (advancedFilters.value.five_g) {
		filtered = filtered.filter((carrier: any) => carrier['5g_available'] === true);
	}
	if (advancedFilters.value.prepaid_anonymous) {
		filtered = filtered.filter((carrier: any) => carrier.prepaid_anonymous === true);
	}
	if (advancedFilters.value.no_contract) {
		filtered = filtered.filter((carrier: any) => 
			carrier.contract_flexibility === 'no_contract_required' || carrier.prepaid_available === true
		);
	}

	return filtered;
});

// Count active filters
const activeFiltersCount = computed(() => {
	return Object.values(advancedFilters.value).filter(Boolean).length;
});

// Reset all filters
const resetFilters = () => {
	searchQuery.value = '';
	selectedCategory.value = null;
	advancedFilters.value = {
		mvno_only: false,
		esim_support: false,
		five_g: false,
		prepaid_anonymous: false,
		no_contract: false,
	};
};

// Helper to get score color
const getScoreColor = (score: number | null | undefined) => {
	if (score === null || score === undefined) return 'gray';
	const colors = ['red', 'orange', 'yellow', 'green', 'blue'];
	return colors[score] || 'gray';
};
</script>

<template>
	<BlockContainer>
		<TypographyHeadline v-if="data?.headline" :content="data.headline" size="lg" />
		<TypographyProse v-if="data?.content" :content="data.content" class="mt-4" />

		<!-- Main Layout: Sidebar + Content -->
		<div class="mt-8 flex flex-col lg:flex-row gap-6">
			<!-- Left Sidebar: Filters -->
			<aside class="lg:w-64 flex-shrink-0">
				<div class="sticky top-4 space-y-6">
					<!-- Category Filter -->
					<div class="border rounded-lg p-4 dark:border-gray-700">
						<h3 class="font-semibold mb-3 text-gray-900 dark:text-white">Categories</h3>
						<div class="space-y-2">
							<button
								@click="selectedCategory = null"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedCategory === null ? 'bg-primary text-white' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
								]"
							>
								All Carriers
							</button>
							<button
								v-for="category in categories"
								:key="category.id"
								@click="selectedCategory = category.id"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedCategory === category.id
										? 'bg-primary text-white'
										: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
								]"
							>
								{{ category.name }}
							</button>
						</div>
					</div>

					<!-- Advanced Filters -->
					<div class="border rounded-lg p-4 dark:border-gray-700">
						<div class="flex items-center justify-between mb-3">
							<h3 class="font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
							<span v-if="activeFiltersCount > 0" class="text-xs bg-primary text-white px-2 py-1 rounded-full">
								{{ activeFiltersCount }}
							</span>
						</div>
						<div class="space-y-3">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.mvno_only"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-900 dark:text-white">MVNO Only</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.esim_support"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-900 dark:text-white">eSIM Support</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.five_g"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-900 dark:text-white">5G Available</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.prepaid_anonymous"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-900 dark:text-white">Prepaid Anonymous</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.no_contract"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-900 dark:text-white">No Contract</span>
							</label>
						</div>
						<button
							v-if="activeFiltersCount > 0 || selectedCategory !== null || searchQuery"
							@click="resetFilters"
							class="mt-4 w-full text-sm text-primary hover:underline"
						>
							Reset all filters
						</button>
					</div>
				</div>
			</aside>

			<!-- Main Content -->
			<div class="flex-1 min-w-0">
				<!-- Search Bar -->
				<div class="mb-6">
					<div class="relative">
						<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Search carriers by name or description..."
							class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
						/>
						<button
							v-if="searchQuery"
							@click="searchQuery = ''"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<!-- View Toggle & Results Count -->
				<div class="flex items-center justify-between mb-6">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{{ filteredCarriers.length }} {{ filteredCarriers.length === 1 ? 'carrier' : 'carriers' }} found
					</p>
					<div class="flex gap-2">
						<button
							@click="viewMode = 'grid'"
							:class="[
								'p-2 rounded-md transition-colors',
								viewMode === 'grid'
									? 'bg-primary text-white'
									: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
							]"
							title="Grid view"
						>
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
								/>
							</svg>
						</button>
						<button
							@click="viewMode = 'list'"
							:class="[
								'p-2 rounded-md transition-colors',
								viewMode === 'list'
									? 'bg-primary text-white'
									: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
							]"
							title="List view"
						>
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Carriers Grid/List -->
				<div
					v-if="filteredCarriers.length > 0"
					class="grid gap-6"
					:class="{
						'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
						'grid-cols-1': viewMode === 'list',
					}"
				>
					<div
						v-for="(carrier, idx) in filteredCarriers"
						:key="carrier.id"
						v-motion
						:initial="{
							opacity: 0,
							y: 50,
						}"
						:visibleOnce="{
							opacity: 1,
							y: 0,
						}"
						:delay="100 + 50 * idx"
						class="border rounded-lg p-6 hover:shadow-lg transition-all dark:border-gray-700 relative"
						:class="{ 
							'flex gap-6': viewMode === 'list'
						}"
					>
						<!-- Carrier Header -->
						<div :class="{ 'flex-shrink-0': viewMode === 'list' }">
							<div class="flex items-start gap-4">
								<div v-if="carrier.brand_symbol_light || carrier.brand_symbol_dark" class="flex-shrink-0">
									<NuxtImg 
										:src="carrier.brand_symbol_light || carrier.brand_symbol_dark" 
										:alt="carrier.name" 
										class="w-12 h-12 rounded-lg" 
									/>
								</div>
								<div class="flex-1 min-w-0">
									<NuxtLink :to="`/carriers/${carrier.slug}`" class="hover:text-primary transition-colors">
										<h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ carrier.name }}</h3>
									</NuxtLink>
									<div class="flex flex-wrap gap-2 mt-2">
										<span
											v-if="carrier.mvno_status === 'mvno'"
											class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
										>
											MVNO
										</span>
										<span
											v-if="carrier.esim_support"
											class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
										>
											eSIM
										</span>
										<span
											v-if="carrier['5g_available']"
											class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
										>
											5G
										</span>
										<span
											v-if="carrier.prepaid_anonymous"
											class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
										>
											Anonymous Prepaid
										</span>
										<span
											v-if="carrier.contract_flexibility === 'no_contract_required'"
											class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
										>
											No Contract
										</span>
									</div>
								</div>
							</div>
						</div>

						<!-- Carrier Details -->
						<div class="flex-1" :class="{ 'mt-4': viewMode === 'grid' }">
							<!-- Carrier Description -->
							<p class="text-gray-600 dark:text-gray-400">{{ carrier.short_description }}</p>

							<!-- Additional fields in list view -->
							<div v-if="viewMode === 'list'" class="mt-4 grid grid-cols-2 gap-4 text-sm">
								<div v-if="carrier.network_type">
									<span class="text-gray-500 dark:text-gray-400">Network:</span>
									<span class="ml-2 font-medium capitalize">{{ carrier.network_type }}</span>
								</div>
								<div v-if="carrier.coverage_quality">
									<span class="text-gray-500 dark:text-gray-400">Coverage:</span>
									<span class="ml-2 font-medium capitalize">{{ carrier.coverage_quality.replace('_', ' ') }}</span>
								</div>
								<div v-if="carrier.privacy_score !== null && carrier.privacy_score !== undefined">
									<span class="text-gray-500 dark:text-gray-400">Privacy Score:</span>
									<span class="ml-2 font-medium">{{ carrier.privacy_score }}/4</span>
								</div>
								<div v-if="carrier.overall_score !== null && carrier.overall_score !== undefined">
									<span class="text-gray-500 dark:text-gray-400">Overall Score:</span>
									<span class="ml-2 font-medium">{{ carrier.overall_score }}/4</span>
								</div>
							</div>

							<!-- Carrier Link -->
							<div class="mt-6">
								<UButton
									v-if="carrier.website_url"
									:to="carrier.website_url"
									target="_blank"
									color="primary"
									size="sm"
									icon="i-mdi-open-in-new"
								>
									Website
								</UButton>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
					<p>No carriers match the selected filters.</p>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
