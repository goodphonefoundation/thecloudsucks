<script setup lang="ts">
import type { BlockHardwareShowcase, HardwareItem } from '~/types';

const props = defineProps<{
	data: BlockHardwareShowcase | null;
}>();

// Reactive filters
const searchQuery = ref<string>('');
const selectedType = ref<string | null>(null);
const viewMode = ref<'grid' | 'list'>('grid');
const advancedFilters = ref({
	bootloader_unlockable: false,
	open_firmware: false,
	no_telemetry: false,
	no_cloud: false,
	high_repairability: false,
});
const tierFilters = ref({
	ideal: false,
	acceptable: false,
	acceptable_with_modifications: false,
	avoid: false,
});
const isTiersExpanded = ref(true);

// Hardware types
const hardwareTypes = [
	{ id: 'phone', name: 'Phones' },
	{ id: 'laptop', name: 'Laptops' },
	{ id: 'router', name: 'Routers' },
	{ id: 'tablet', name: 'Tablets' },
];

// Fetch all hardware items
const { data: hardwareData, error: hardwareError } = await useAsyncData('hardware-showcase-v5', () => {
	return useDirectus(
		readItems('hardware_items', {
			fields: ['*'],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});

// Filter hardware based on search, type, and advanced filters
const filteredHardware = computed(() => {
	if (!hardwareData.value) return [];

	let filtered = hardwareData.value;

	// Search filter
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase().trim();
		filtered = filtered.filter((item: any) => {
			return (
				item.name?.toLowerCase().includes(query) ||
				item.manufacturer?.toLowerCase().includes(query) ||
				item.short_description?.toLowerCase().includes(query) ||
				item.long_description?.toLowerCase().includes(query)
			);
		});
	}

	// Type filter
	if (selectedType.value) {
		filtered = filtered.filter((item: any) => item.hardware_type === selectedType.value);
	}

	// Advanced filters
	if (advancedFilters.value.bootloader_unlockable) {
		filtered = filtered.filter((item: any) => item.bootloader_unlockable === 'true');
	}
	if (advancedFilters.value.open_firmware) {
		filtered = filtered.filter((item: any) => 
			item.open_firmware_support === 'yes' || item.open_firmware_support === 'partial'
		);
	}
	if (advancedFilters.value.no_telemetry) {
		filtered = filtered.filter((item: any) => 
			item.telemetry_default === 'none' || item.telemetry_default === 'minimal'
		);
	}
	if (advancedFilters.value.no_cloud) {
		filtered = filtered.filter((item: any) => 
			item.cloud_dependency === 'none' || item.cloud_dependency === 'optional'
		);
	}
	if (advancedFilters.value.high_repairability) {
		filtered = filtered.filter((item: any) => 
			item.repairability === 'excellent' || item.repairability === 'good'
		);
	}

	// Tier filters
	const selectedTiers = Object.entries(tierFilters.value)
		.filter(([_, isSelected]) => isSelected)
		.map(([tier]) => tier);
	
	if (selectedTiers.length > 0) {
		filtered = filtered.filter((item: any) => {
			return selectedTiers.includes(item.tier);
		});
	}

	return filtered;
});

// Count active filters
const activeFiltersCount = computed(() => {
	return Object.values(advancedFilters.value).filter(Boolean).length;
});

// Count active tier filters
const activeTierFiltersCount = computed(() => {
	return Object.values(tierFilters.value).filter(Boolean).length;
});

// Reset all filters
const resetFilters = () => {
	searchQuery.value = '';
	selectedType.value = null;
	advancedFilters.value = {
		bootloader_unlockable: false,
		open_firmware: false,
		no_telemetry: false,
		no_cloud: false,
		high_repairability: false,
	};
	tierFilters.value = {
		ideal: false,
		acceptable: false,
		acceptable_with_modifications: false,
		avoid: false,
	};
};

// Get tier display info
const getTierInfo = (tier: string) => {
	const tiers: Record<string, { label: string; color: string }> = {
		ideal: { label: 'Ideal', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
		acceptable: { label: 'Acceptable', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
		acceptable_with_modifications: { label: 'Acceptable*', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
		avoid: { label: 'Avoid', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
	};
	return tiers[tier] || { label: tier, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
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
				<!-- Type Filter -->
				<div class="border rounded-lg p-4 dark:border-gray-700">
					<h3 class="font-semibold mb-3 text-gray-900 dark:text-white">Hardware Type</h3>
						<div class="space-y-2">
							<button
								@click="selectedType = null"
							:class="[
								'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
								selectedType === null
									? 'bg-primary text-white'
									: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
							]"
							>
								All Hardware
							</button>
							<button
								v-for="type in hardwareTypes"
								:key="type.id"
								@click="selectedType = type.id"
							:class="[
								'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
								selectedType === type.id
									? 'bg-primary text-white'
									: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
							]"
							>
								{{ type.name }}
							</button>
						</div>
					</div>

				<!-- Advanced Filters -->
				<div class="border rounded-lg p-4 dark:border-gray-700">
					<div class="flex items-center justify-between mb-3">
						<h3 class="font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
							<span
								v-if="activeFiltersCount > 0"
								class="text-xs bg-primary text-white px-2 py-1 rounded-full"
							>
								{{ activeFiltersCount }}
							</span>
						</div>
						<div class="space-y-3">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.bootloader_unlockable"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
							<span class="text-sm text-gray-700 dark:text-gray-300">Bootloader Unlockable</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								v-model="advancedFilters.open_firmware"
								type="checkbox"
								class="rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">Open Firmware Support</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								v-model="advancedFilters.no_telemetry"
								type="checkbox"
								class="rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">No/Minimal Telemetry</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								v-model="advancedFilters.no_cloud"
								type="checkbox"
								class="rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">No Required Cloud</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								v-model="advancedFilters.high_repairability"
								type="checkbox"
								class="rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">High Repairability</span>
							</label>
						</div>
					</div>

					<!-- Tier Filters -->
					<div class="border rounded-lg p-4 dark:border-gray-700">
					<button
						@click="isTiersExpanded = !isTiersExpanded"
						class="flex items-center justify-between w-full mb-3 cursor-pointer"
					>
						<h3 class="font-semibold text-gray-900 dark:text-white">GoodPhone Tier</h3>
							<div class="flex items-center gap-2">
								<span
									v-if="activeTierFiltersCount > 0"
									class="text-xs bg-primary text-white px-2 py-1 rounded-full"
								>
									{{ activeTierFiltersCount }}
								</span>
								<svg
									class="w-5 h-5 transition-transform"
									:class="{ 'rotate-180': isTiersExpanded }"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</button>
						<div v-show="isTiersExpanded" class="space-y-3">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="tierFilters.ideal"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
							<span class="text-sm text-gray-700 dark:text-gray-300">Ideal</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								v-model="tierFilters.acceptable"
								type="checkbox"
								class="rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">Acceptable</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								v-model="tierFilters.acceptable_with_modifications"
								type="checkbox"
								class="rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">Acceptable (Modified)</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								v-model="tierFilters.avoid"
								type="checkbox"
								class="rounded border-gray-300 text-primary focus:ring-primary"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">Avoid</span>
							</label>
						</div>
					</div>

					<!-- Reset Button -->
					<button
						v-if="activeFiltersCount > 0 || activeTierFiltersCount > 0 || selectedType !== null || searchQuery"
						@click="resetFilters"
						class="w-full text-sm text-primary hover:underline"
					>
						Reset all filters
					</button>
				</div>
			</aside>

			<!-- Main Content -->
			<div class="flex-1 min-w-0">
				<!-- Search Bar -->
				<div class="mb-6">
					<div class="relative">
						<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							v-model="searchQuery"
							type="text"
							placeholder="Search hardware by name, manufacturer, or description..."
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
						{{ filteredHardware.length }} {{ filteredHardware.length === 1 ? 'item' : 'items' }} found
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

				<!-- Hardware Grid/List -->
				<div
					v-if="filteredHardware.length > 0"
					class="grid gap-6"
					:class="{
						'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
						'grid-cols-1': viewMode === 'list',
					}"
				>
					<div
						v-for="(item, idx) in filteredHardware"
						:key="item.id"
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
						class="border rounded-lg p-6 hover:shadow-lg transition-shadow dark:border-gray-700"
						:class="{ 'flex gap-6 items-start': viewMode === 'list' }"
					>
						<!-- Logo (only in list view as separate column) -->
						<NuxtLink
							v-if="viewMode === 'list' && (item.brand_symbol_light || item.brand_symbol_dark || item.brand_logo_light || item.brand_logo_dark)"
							:to="`/hardware/${item.slug}`"
							class="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
						>
							<!-- Light theme: use dark logo -->
							<img 
								:src="`/api/proxy/assets/${item.brand_symbol_dark || item.brand_logo_dark || item.brand_symbol_light || item.brand_logo_light}`" 
								:alt="item.name" 
								class="w-full h-full object-contain dark:hidden" 
							/>
							<!-- Dark theme: use light logo -->
							<img 
								:src="`/api/proxy/assets/${item.brand_symbol_light || item.brand_logo_light || item.brand_symbol_dark || item.brand_logo_dark}`" 
								:alt="item.name" 
								class="w-full h-full object-contain hidden dark:block" 
							/>
						</NuxtLink>
						
						<!-- Hardware Header (grid view or list view name+badges section) -->
						<div>
							<!-- Logo Container (grid view only) -->
							<NuxtLink
								v-if="viewMode === 'grid' && (item.brand_symbol_light || item.brand_symbol_dark || item.brand_logo_light || item.brand_logo_dark)"
								:to="`/hardware/${item.slug}`"
								class="flex items-center justify-center w-20 h-20 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4"
							>
								<!-- Light theme: use dark logo -->
								<img 
									:src="`/api/proxy/assets/${item.brand_symbol_dark || item.brand_logo_dark || item.brand_symbol_light || item.brand_logo_light}`" 
									:alt="item.name" 
									class="w-full h-full object-contain dark:hidden" 
								/>
								<!-- Dark theme: use light logo -->
								<img 
									:src="`/api/proxy/assets/${item.brand_symbol_light || item.brand_logo_light || item.brand_symbol_dark || item.brand_logo_dark}`" 
									:alt="item.name" 
									class="w-full h-full object-contain hidden dark:block" 
								/>
							</NuxtLink>
							
							<!-- Hardware Info -->
							<div :class="{ 'flex-1 min-w-0': viewMode === 'list' }">
							<NuxtLink :to="`/hardware/${item.slug}`" class="hover:text-primary transition-colors">
								<h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{{ item.name }}</h3>
							</NuxtLink>
							<p class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ item.manufacturer }}</p>
								<div class="flex flex-wrap gap-2" :class="{ 'mb-3': viewMode === 'list' }">
									<!-- Tier Badge -->
									<span
										v-if="item.tier"
										:class="['inline-flex items-center px-2 py-1 text-xs font-medium rounded-full', getTierInfo(item.tier).color]"
									>
										{{ getTierInfo(item.tier).label }}
									</span>
									<!-- Feature Badges -->
									<span
										v-if="item.bootloader_unlockable === 'true'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
									>
										Unlockable
									</span>
									<span
										v-if="item.open_firmware_support === 'yes'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
									>
										Open Firmware
									</span>
									<span
										v-if="item.telemetry_default === 'none'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									>
										No Telemetry
									</span>
									<span
										v-if="item.repairability === 'excellent'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
									>
										Highly Repairable
									</span>
								</div>
								
								<!-- Hardware Description (in list view, shown here) -->
								<p v-if="viewMode === 'list'" class="text-gray-600 dark:text-gray-400 mt-2">{{ item.short_description }}</p>
							</div>
						</div>

						<!-- Hardware Details (shown in grid view) -->
						<div v-if="viewMode === 'grid'" class="flex-1 mt-4">
							<!-- Hardware Description -->
							<p class="text-gray-600 dark:text-gray-400">{{ item.short_description }}</p>

							<!-- Hardware Links -->
							<div class="mt-6 flex flex-wrap gap-3">
								<UButton
									v-if="item.website_url"
									:to="item.website_url"
									target="_blank"
									color="primary"
									size="sm"
									icon="i-mdi-open-in-new"
								>
									Website
								</UButton>
								<UButton
									v-if="item.repo_url"
									:to="item.repo_url"
									target="_blank"
									color="gray"
									variant="outline"
									size="sm"
									icon="i-mdi-github"
								>
									Source
								</UButton>
								<UButton
									v-if="item.docs_url"
									:to="item.docs_url"
									target="_blank"
									color="gray"
									variant="outline"
									size="sm"
									icon="i-mdi-book-open"
								>
									Docs
								</UButton>
								<UButton
									v-if="item.privacy_policy_url"
									:to="item.privacy_policy_url"
									target="_blank"
									color="gray"
									variant="outline"
									size="sm"
									icon="i-mdi-shield-check"
								>
									Privacy
								</UButton>
								<UButton
									:to="`/hardware/${item.slug}`"
									color="gray"
									variant="outline"
									size="sm"
									icon="i-mdi-information"
								>
									Details
								</UButton>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
					<p>No hardware matches the selected filters.</p>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
