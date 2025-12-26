<script setup lang="ts">
import type { BlockAppsShowcase, App, AppCategory } from '~/types';

const props = defineProps<{
	data: BlockAppsShowcase | null;
}>();

// Reactive filters
const selectedCategory = ref<string | null>(null);
const viewMode = ref<'grid' | 'list'>('grid');
const advancedFilters = ref({
	open_source: false,
	e2e_encryption: false,
	no_tracking: false,
	self_hostable: false,
	federated: false,
});

// Fetch categories
const { data: categories } = await useAsyncData('app-categories', () => {
	return useDirectus(
		readItems('app_categories', {
			fields: ['id', 'name', 'slug'],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});

// Fetch all apps with categories
const { data: appsData } = await useAsyncData('apps-showcase-v4', () => {
	return useDirectus(
		readItems('apps', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'long_description',
				'website_url',
				'repo_url',
				'docs_url',
				'privacy_policy_url',
				'icon',
				'is_open_source',
				'end_to_end_encryption',
				'default_tracking',
				'self_hostable',
				'federated',
				'license_type',
				'governance_model',
				'primary_business_model',
				'data_portability',
				'categories.app_categories_id.id',
				'categories.app_categories_id.name',
			],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});

// Filter apps based on selected category and advanced filters
const filteredApps = computed(() => {
	if (!appsData.value) return [];

	let filtered = appsData.value;

	// Category filter
	if (selectedCategory.value) {
		filtered = filtered.filter((app: any) => {
			return app.categories?.some((cat: any) => {
				return cat.app_categories_id?.id === selectedCategory.value;
			});
		});
	}

	// Advanced filters
	if (advancedFilters.value.open_source) {
		filtered = filtered.filter((app: any) => app.is_open_source === true);
	}
	if (advancedFilters.value.e2e_encryption) {
		filtered = filtered.filter((app: any) => app.end_to_end_encryption === 'yes');
	}
	if (advancedFilters.value.no_tracking) {
		filtered = filtered.filter((app: any) => app.default_tracking === 'none');
	}
	if (advancedFilters.value.self_hostable) {
		filtered = filtered.filter((app: any) => app.self_hostable === true);
	}
	if (advancedFilters.value.federated) {
		filtered = filtered.filter((app: any) => app.federated === true);
	}

	return filtered;
});

// Count active filters
const activeFiltersCount = computed(() => {
	return Object.values(advancedFilters.value).filter(Boolean).length;
});

// Reset all filters
const resetFilters = () => {
	selectedCategory.value = null;
	advancedFilters.value = {
		open_source: false,
		e2e_encryption: false,
		no_tracking: false,
		self_hostable: false,
		federated: false,
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
						<h3 class="font-semibold mb-3">Categories</h3>
						<div class="space-y-2">
							<button
								@click="selectedCategory = null"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedCategory === null
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800',
								]"
							>
								All Apps
							</button>
							<button
								v-for="category in categories"
								:key="category.id"
								@click="selectedCategory = category.id"
								:class="[
									'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
									selectedCategory === category.id
										? 'bg-primary text-white'
										: 'hover:bg-gray-100 dark:hover:bg-gray-800',
								]"
							>
								{{ category.name }}
							</button>
						</div>
					</div>

					<!-- Advanced Filters -->
					<div class="border rounded-lg p-4 dark:border-gray-700">
						<div class="flex items-center justify-between mb-3">
							<h3 class="font-semibold">Advanced Filters</h3>
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
								<span class="text-sm">Open Source</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.e2e_encryption"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm">E2E Encryption</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.no_tracking"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm">No Tracking</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.self_hostable"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm">Self-Hostable</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									v-model="advancedFilters.federated"
									type="checkbox"
									class="rounded border-gray-300 text-primary focus:ring-primary"
								/>
								<span class="text-sm">Federated</span>
							</label>
						</div>
						<button
							v-if="activeFiltersCount > 0 || selectedCategory !== null"
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
				<!-- View Toggle & Results Count -->
				<div class="flex items-center justify-between mb-6">
					<p class="text-sm text-gray-600 dark:text-gray-400">
						{{ filteredApps.length }} {{ filteredApps.length === 1 ? 'app' : 'apps' }} found
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

				<!-- Apps Grid/List -->
				<div
					v-if="filteredApps.length > 0"
					class="grid gap-6"
					:class="{
						'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3': viewMode === 'grid',
						'grid-cols-1': viewMode === 'list',
					}"
				>
					<div
						v-for="(app, idx) in filteredApps"
						:key="app.id"
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
						<!-- App Header -->
						<div class="flex items-start gap-4" :class="{ 'flex-shrink-0': viewMode === 'list' }">
							<div v-if="app.icon" class="flex-shrink-0">
								<NuxtImg :src="app.icon" :alt="app.name" class="w-12 h-12 rounded-lg" />
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="text-xl font-semibold">{{ app.name }}</h3>
								<div class="flex flex-wrap gap-2 mt-2">
									<span
										v-if="app.is_open_source"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
									>
										Open Source
									</span>
									<span
										v-if="app.end_to_end_encryption === 'yes'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									>
										E2E Encrypted
									</span>
									<span
										v-if="app.default_tracking === 'none'"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
									>
										No Tracking
									</span>
									<span
										v-if="app.self_hostable"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
									>
										Self-Hostable
									</span>
									<span
										v-if="app.federated"
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
									>
										Federated
									</span>
								</div>
							</div>
						</div>

						<!-- App Details (shown in list view) -->
						<div class="flex-1" :class="{ 'mt-4': viewMode === 'grid' }">
							<!-- App Description -->
							<p class="text-gray-600 dark:text-gray-400">{{ app.short_description }}</p>

							<!-- Additional fields in list view -->
							<div v-if="viewMode === 'list'" class="mt-4 grid grid-cols-2 gap-4 text-sm">
								<div v-if="app.license_type">
									<span class="text-gray-500 dark:text-gray-400">License:</span>
									<span class="ml-2 font-medium">{{ app.license_type }}</span>
								</div>
								<div v-if="app.governance_model">
									<span class="text-gray-500 dark:text-gray-400">Governance:</span>
									<span class="ml-2 font-medium capitalize">{{ app.governance_model.replace('_', ' ') }}</span>
								</div>
								<div v-if="app.primary_business_model">
									<span class="text-gray-500 dark:text-gray-400">Business Model:</span>
									<span class="ml-2 font-medium capitalize">{{ app.primary_business_model.replace('_', ' ') }}</span>
								</div>
								<div v-if="app.data_portability">
									<span class="text-gray-500 dark:text-gray-400">Data Portability:</span>
									<span class="ml-2 font-medium capitalize">{{ app.data_portability }}</span>
								</div>
							</div>

							<!-- App Links -->
							<div class="mt-6 flex flex-wrap gap-3">
								<UButton
									v-if="app.website_url"
									:to="app.website_url"
									target="_blank"
									color="primary"
									size="sm"
									icon="i-mdi-open-in-new"
								>
									Website
								</UButton>
								<UButton
									v-if="app.repo_url"
									:to="app.repo_url"
									target="_blank"
									color="gray"
									variant="outline"
									size="sm"
									icon="i-mdi-github"
								>
									Source
								</UButton>
								<UButton
									v-if="app.docs_url"
									:to="app.docs_url"
									target="_blank"
									color="gray"
									variant="outline"
									size="sm"
									icon="i-mdi-book-open"
								>
									Docs
								</UButton>
								<UButton
									v-if="app.privacy_policy_url"
									:to="app.privacy_policy_url"
									target="_blank"
									color="gray"
									variant="outline"
									size="sm"
									icon="i-mdi-shield-check"
								>
									Privacy
								</UButton>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
					<p>No apps match the selected filters.</p>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
