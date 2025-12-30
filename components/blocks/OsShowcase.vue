<script setup lang="ts">
import type { BlockOsShowcase, OperatingSystem } from '~/types';

const props = defineProps<{
	data: BlockOsShowcase | null;
}>();

// Reactive filters
const searchQuery = ref<string>('');
const selectedScope = ref<string | null>(null);
const selectedGovernance = ref<string | null>(null);
const selectedKernel = ref<string | null>(null);
const selectedTier = ref<string | null>(null);
const viewMode = ref<'grid' | 'list'>('grid');
const advancedFilters = ref({
	open_source: false,
	root_access: false,
	bootloader_unlockable: false,
	no_telemetry: false,
	no_cloud_account: false,
	binary_reproducible: false,
});

// Filter options
const scopeOptions = [
	{ value: 'mobile', label: 'Mobile' },
	{ value: 'desktop', label: 'Desktop' },
	{ value: 'server', label: 'Server' },
	{ value: 'embedded', label: 'Embedded' },
];

const governanceOptions = [
	{ value: 'community', label: 'Community' },
	{ value: 'foundation', label: 'Foundation' },
	{ value: 'corporate', label: 'Corporate' },
	{ value: 'hybrid', label: 'Hybrid' },
];

const kernelOptions = [
	{ value: 'linux', label: 'Linux' },
	{ value: 'bsd', label: 'BSD' },
	{ value: 'nt', label: 'Windows NT' },
	{ value: 'xnu', label: 'XNU (macOS)' },
	{ value: 'other', label: 'Other' },
];

const tierOptions = [
	{ value: 'A_Sovereign', label: 'A - Sovereign' },
	{ value: 'B_Aligned', label: 'B - Aligned' },
	{ value: 'C_Transitional', label: 'C - Transitional' },
	{ value: 'D_Extractive', label: 'D - Extractive' },
];

// Fetch all operating systems
const { data: osData } = await useAsyncData('os-showcase-v1', () => {
	return useDirectus(
		readItems('operating_systems', {
			fields: [
				'id',
				'name',
				'slug',
				'tagline',
				'description',
				'website_url',
				'documentation_url',
				'source_code_url',
				'logo_light',
				'logo_dark',
				'os_scope',
				'kernel_type',
				'governance_model',
				'is_open_source',
				'tier',
				'telemetry_default',
				'bootloader_unlockable',
				'root_access_available',
				'cloud_account_required',
				'binary_reproducibility',
			],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});

// Filter OS based on all criteria
const filteredOs = computed(() => {
	if (!osData.value) return [];

	let filtered = osData.value;

	// Search filter
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase().trim();
		filtered = filtered.filter((os: any) => {
			return (
				os.name?.toLowerCase().includes(query) ||
				os.tagline?.toLowerCase().includes(query) ||
				os.description?.toLowerCase().includes(query)
			);
		});
	}

	// Scope filter
	if (selectedScope.value) {
		filtered = filtered.filter((os: any) => os.os_scope === selectedScope.value);
	}

	// Governance filter
	if (selectedGovernance.value) {
		filtered = filtered.filter((os: any) => os.governance_model === selectedGovernance.value);
	}

	// Kernel filter
	if (selectedKernel.value) {
		filtered = filtered.filter((os: any) => os.kernel_type === selectedKernel.value);
	}

	// Tier filter
	if (selectedTier.value) {
		filtered = filtered.filter((os: any) => os.tier === selectedTier.value);
	}

	// Advanced filters
	if (advancedFilters.value.open_source) {
		filtered = filtered.filter((os: any) => os.is_open_source === true);
	}
	if (advancedFilters.value.root_access) {
		filtered = filtered.filter((os: any) => os.root_access_available === true);
	}
	if (advancedFilters.value.bootloader_unlockable) {
		filtered = filtered.filter((os: any) => os.bootloader_unlockable === 'yes');
	}
	if (advancedFilters.value.no_telemetry) {
		filtered = filtered.filter((os: any) => os.telemetry_default === 'none');
	}
	if (advancedFilters.value.no_cloud_account) {
		filtered = filtered.filter((os: any) => os.cloud_account_required === false);
	}
	if (advancedFilters.value.binary_reproducible) {
		filtered = filtered.filter((os: any) => os.binary_reproducibility === true);
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
	selectedScope.value = null;
	selectedGovernance.value = null;
	selectedKernel.value = null;
	selectedTier.value = null;
	advancedFilters.value = {
		open_source: false,
		root_access: false,
		bootloader_unlockable: false,
		no_telemetry: false,
		no_cloud_account: false,
		binary_reproducible: false,
	};
};

// Helper to get tier label
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
					<!-- OS Scope Filter -->
					<div class="border rounded-lg p-4 dark:border-gray-700">
						<h3 class="font-semibold mb-3 text-gray-900 dark:text-white">OS Scope</h3>
						<div class="space-y-2">
							<button
								@click="selectedScope = null"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedScope === null
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
								]"
							>
								All Platforms
							</button>
							<button
								v-for="option in scopeOptions"
								:key="option.value"
								@click="selectedScope = option.value"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedScope === option.value
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
								]"
							>
								{{ option.label }}
							</button>
						</div>
					</div>

					<!-- Governance Filter -->
					<div class="border rounded-lg p-4 dark:border-gray-700">
						<h3 class="font-semibold mb-3 text-gray-900 dark:text-white">Governance</h3>
						<div class="space-y-2">
							<button
								@click="selectedGovernance = null"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedGovernance === null
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
								]"
							>
								All Models
							</button>
							<button
								v-for="option in governanceOptions"
								:key="option.value"
								@click="selectedGovernance = option.value"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedGovernance === option.value
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
								]"
							>
								{{ option.label }}
							</button>
						</div>
					</div>

					<!-- Kernel Type Filter -->
					<div class="border rounded-lg p-4 dark:border-gray-700">
						<h3 class="font-semibold mb-3 text-gray-900 dark:text-white">Kernel Type</h3>
						<div class="space-y-2">
							<button
								@click="selectedKernel = null"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedKernel === null
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
								]"
							>
								All Kernels
							</button>
							<button
								v-for="option in kernelOptions"
								:key="option.value"
								@click="selectedKernel = option.value"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedKernel === option.value
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
								]"
							>
								{{ option.label }}
							</button>
						</div>
					</div>

					<!-- Tier Filter -->
					<div class="border rounded-lg p-4 dark:border-gray-700">
						<h3 class="font-semibold mb-3 text-gray-900 dark:text-white">Assessment Tier</h3>
						<div class="space-y-2">
							<button
								@click="selectedTier = null"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedTier === null
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
								]"
							>
								All Tiers
							</button>
							<button
								v-for="option in tierOptions"
								:key="option.value"
								@click="selectedTier = option.value"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedTier === option.value
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
								]"
							>
								{{ option.label }}
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
									v-model="advancedFilters.open_source"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300">Open Source</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.root_access"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300">Root Access</span>
							</label>
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
									v-model="advancedFilters.no_telemetry"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300">No Telemetry</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.no_cloud_account"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300">No Cloud Account</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.binary_reproducible"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300">Binary Reproducible</span>
							</label>
						</div>
					</div>

					<!-- Reset Button -->
					<button
						v-if="activeFiltersCount > 0 || selectedScope || selectedGovernance || selectedKernel || selectedTier || searchQuery"
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
							placeholder="Search operating systems..."
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
						{{ filteredOs.length }} {{ filteredOs.length === 1 ? 'operating system' : 'operating systems' }} found
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

				<!-- OS Grid/List -->
				<div
					v-if="filteredOs.length > 0"
					class="grid gap-6"
					:class="{
						'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
						'grid-cols-1': viewMode === 'list',
					}"
				>
					<div
						v-for="(os, idx) in filteredOs"
						:key="os.id"
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
						<!-- Logo (list view) -->
						<NuxtLink
							v-if="viewMode === 'list' && (os.logo_light || os.logo_dark)"
							:to="`/os/${os.slug}`"
							class="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
						>
							<img 
								:src="`/api/proxy/assets/${os.logo_dark || os.logo_light}`" 
								:alt="os.name" 
								class="w-full h-full object-contain dark:hidden" 
							/>
							<img 
								:src="`/api/proxy/assets/${os.logo_light || os.logo_dark}`" 
								:alt="os.name" 
								class="w-full h-full object-contain hidden dark:block" 
							/>
						</NuxtLink>
						
						<div class="flex-1">
							<!-- Logo (grid view) -->
							<NuxtLink
								v-if="viewMode === 'grid' && (os.logo_light || os.logo_dark)"
								:to="`/os/${os.slug}`"
								class="flex items-center justify-center w-20 h-20 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4"
							>
								<img 
									:src="`/api/proxy/assets/${os.logo_dark || os.logo_light}`" 
									:alt="os.name" 
									class="w-full h-full object-contain dark:hidden" 
								/>
								<img 
									:src="`/api/proxy/assets/${os.logo_light || os.logo_dark}`" 
									:alt="os.name" 
									class="w-full h-full object-contain hidden dark:block" 
								/>
							</NuxtLink>
							
							<!-- OS Info -->
							<div>
								<div class="flex items-start justify-between gap-2 mb-2">
									<NuxtLink :to="`/os/${os.slug}`" class="hover:text-primary transition-colors">
										<h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ os.name }}</h3>
									</NuxtLink>
									<span v-if="os.tier" :class="[
										'px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap flex-shrink-0',
										getTierColor(os.tier) === 'blue' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
										getTierColor(os.tier) === 'green' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
										getTierColor(os.tier) === 'yellow' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
										getTierColor(os.tier) === 'red' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
									]">
										{{ getTierLabel(os.tier) }}
									</span>
								</div>
								
								<!-- Badges -->
								<div class="flex flex-wrap gap-2 mb-3">
									<span
										v-if="os.is_open_source"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
									>
										Open Source
									</span>
									<span
										v-if="os.telemetry_default === 'none'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
									>
										No Telemetry
									</span>
									<span
										v-if="os.bootloader_unlockable === 'yes'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
									>
										Unlockable
									</span>
									<span
										v-if="os.root_access_available"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
									>
										Root Access
									</span>
								</div>
								
								<!-- Description -->
								<p class="text-gray-600 dark:text-gray-400 text-sm mb-4">{{ os.tagline || os.description }}</p>
								
								<!-- Links -->
								<div class="flex flex-wrap gap-3">
									<UButton
										v-if="os.website_url"
										:to="os.website_url"
										target="_blank"
										color="primary"
										size="sm"
										icon="i-mdi-open-in-new"
									>
										Website
									</UButton>
									<UButton
										v-if="os.source_code_url"
										:to="os.source_code_url"
										target="_blank"
										color="gray"
										variant="outline"
										size="sm"
										icon="i-mdi-github"
									>
										Source
									</UButton>
									<UButton
										v-if="os.documentation_url"
										:to="os.documentation_url"
										target="_blank"
										color="gray"
										variant="outline"
										size="sm"
										icon="i-mdi-book-open"
									>
										Docs
									</UButton>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
					<p>No operating systems match the selected filters.</p>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
