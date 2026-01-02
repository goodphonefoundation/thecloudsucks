<script setup lang="ts">
import type { BlockSelfhostedShowcase } from '~/types';

const props = defineProps<{
	data: BlockSelfhostedShowcase | null;
}>();

// Reactive filters
const searchQuery = ref<string>('');
const selectedCategory = ref<string | null>(null);
const viewMode = ref<'grid' | 'list'>('grid');
const advancedFilters = ref({
	open_source: false,
	self_hostable: false,
	e2e_encryption: false,
});

// Fetch all self-hosted alternatives
const { data: alternativesData } = await useAsyncData('selfhosted-alternatives-showcase-v3', () => {
	return useDirectus(
		readItems('selfhosted_alternatives', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'replaces',
				'category',
				'is_open_source',
				'hosting_modes',
				'end_to_end_encryption',
				'tier',
				'deployment_complexity',
				'website_url',
				'repo_url',
				'docs_url',
				'brand_symbol_light',
				'brand_symbol_dark',
			],
			filter: {
				status: { _eq: 'active' },
			},
			sort: ['name'],
		}),
	);
});

// Get unique categories from data
const categories = computed(() => {
	if (!alternativesData.value) return [];
	const cats = new Set<string>();
	alternativesData.value.forEach((alt: any) => {
		if (alt.category) {
			cats.add(alt.category);
		}
	});
	return Array.from(cats).sort();
});

// Category display names
const categoryLabels: Record<string, string> = {
	cloud_storage: 'Cloud Storage',
	file_sync: 'File Sync',
	photos: 'Photos',
	docs: 'Documents',
	email: 'Email',
	calendar: 'Calendar',
	notes: 'Notes',
	passwords: 'Passwords',
	messaging: 'Messaging',
	backup: 'Backup',
	other: 'Other',
};

// Filter alternatives based on search, category, and advanced filters
const filteredAlternatives = computed(() => {
	if (!alternativesData.value) return [];

	let filtered = alternativesData.value;

	// Search filter
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase().trim();
		filtered = filtered.filter((alt: any) => {
			return (
				alt.name?.toLowerCase().includes(query) ||
				alt.short_description?.toLowerCase().includes(query) ||
				alt.replaces?.some((r: string) => r.toLowerCase().includes(query))
			);
		});
	}

	// Category filter
	if (selectedCategory.value) {
		filtered = filtered.filter((alt: any) => alt.category === selectedCategory.value);
	}

	// Advanced filters
	if (advancedFilters.value.open_source) {
		filtered = filtered.filter((alt: any) => alt.is_open_source === true);
	}
	if (advancedFilters.value.self_hostable) {
		filtered = filtered.filter((alt: any) => alt.hosting_modes?.includes('self_hosted'));
	}
	if (advancedFilters.value.e2e_encryption) {
		filtered = filtered.filter((alt: any) => alt.end_to_end_encryption === 'yes');
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
		open_source: false,
		self_hostable: false,
		e2e_encryption: false,
	};
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
								All Alternatives
							</button>
							<button
								v-for="category in categories"
								:key="category"
								@click="selectedCategory = category"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedCategory === category
										? 'bg-primary text-white'
										: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
								]"
							>
								{{ categoryLabels[category] || category }}
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
									v-model="advancedFilters.open_source"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-900 dark:text-white">Open Source</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.self_hostable"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-900 dark:text-white">Self-Hostable</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.e2e_encryption"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm text-gray-900 dark:text-white">E2E Encryption</span>
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
							placeholder="Search alternatives by name, description, or what they replace..."
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
						{{ filteredAlternatives.length }} {{ filteredAlternatives.length === 1 ? 'alternative' : 'alternatives' }} found
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

				<!-- Alternatives Grid/List -->
				<div
					v-if="filteredAlternatives.length > 0"
					class="grid gap-6"
					:class="{
						'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
						'grid-cols-1': viewMode === 'list',
					}"
				>
			<div
				v-for="(alt, idx) in filteredAlternatives"
				:key="alt.id"
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
					:class="{ 'flex gap-6': viewMode === 'list' }"
				>
			<!-- Alternative Header -->
				<div class="flex items-start gap-4" :class="{ 'flex-shrink-0': viewMode === 'list' }">
					<!-- Logo -->
					<div v-if="alt.brand_symbol_light || alt.brand_symbol_dark" class="flex-shrink-0">
						<NuxtImg
							:src="alt.brand_symbol_light || alt.brand_symbol_dark"
							:alt="alt.name"
							class="w-12 h-12 rounded-lg"
						/>
					</div>

					<div class="flex-1 min-w-0">
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ alt.name }}</h3>
						<p v-if="alt.replaces && alt.replaces.length > 0" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
							Replaces: {{ alt.replaces.join(', ') }}
						</p>

						<!-- Badges -->
						<div class="flex flex-wrap gap-2 mt-3">
							<span
								v-if="alt.is_open_source"
								class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
							>
								Open Source
							</span>
							<span
								v-if="alt.hosting_modes?.includes('self_hosted')"
								class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
							>
								Self-Hostable
							</span>
							<span
								v-if="alt.end_to_end_encryption === 'yes'"
								class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
							>
								E2E Encrypted
							</span>
							<span
								v-if="alt.tier === 'A_Sovereign'"
								class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
							>
								Tier A
							</span>
						</div>
					</div>
				</div>

				<!-- Alternative Details -->
				<div class="flex-1" :class="{ 'mt-4': viewMode === 'grid' }">
					<!-- Description -->
					<p class="text-gray-600 dark:text-gray-400">{{ alt.short_description }}</p>

					<!-- Deployment Complexity -->
					<div v-if="alt.deployment_complexity" class="mt-4">
						<span
							:class="[
								'inline-flex items-center px-2 py-1 text-xs font-medium rounded',
								alt.deployment_complexity === 'low' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
								alt.deployment_complexity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
								'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
							]"
						>
							{{ alt.deployment_complexity }} complexity
						</span>
					</div>

					<!-- Links -->
					<div class="mt-6 flex flex-wrap gap-3">
						<UButton
							v-if="alt.slug"
							:to="`/self-hosting/${alt.slug}`"
							color="primary"
							size="sm"
						>
							Details
						</UButton>
						<UButton
							v-if="alt.website_url"
							:to="alt.website_url"
							target="_blank"
							color="gray"
							variant="outline"
							size="sm"
							icon="i-mdi-open-in-new"
						>
							Website
						</UButton>
						<UButton
							v-if="alt.repo_url"
							:to="alt.repo_url"
							target="_blank"
							color="gray"
							variant="outline"
							size="sm"
							icon="i-mdi-github"
						>
							Source
						</UButton>
						<UButton
							v-if="alt.docs_url"
							:to="alt.docs_url"
							target="_blank"
							color="gray"
							variant="outline"
							size="sm"
							icon="i-mdi-book-open-page-variant"
						>
							Docs
						</UButton>
					</div>
				</div>
					</div>
				</div>

				<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
					<p>No alternatives match the selected filters.</p>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
