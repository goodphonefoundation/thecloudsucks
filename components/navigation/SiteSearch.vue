<script setup lang="ts">
import { useMagicKeys, whenever } from '@vueuse/core';
import { useDebounceFn } from '@vueuse/shared';

const isOpen = ref(false);
const searchQuery = ref('');
const isSearching = ref(false);
const searchResults = ref<any[]>([]);
const totalResults = ref(0);

// Setup keyboard shortcut (Cmd+K / Ctrl+K)
const keys = useMagicKeys();
const cmdK = keys['Meta+K'];
const ctrlK = keys['Ctrl+K'];

whenever(() => cmdK.value || ctrlK.value, (v) => {
	if (v) {
		isOpen.value = true;
	}
});

// Search with debounce
const debouncedSearch = useDebounceFn(async () => {
	if (searchQuery.value.length < 2) {
		searchResults.value = [];
		totalResults.value = 0;
		return;
	}

	isSearching.value = true;
	try {
		const { data } = await useFetch('/api/search/global', {
			query: {
				q: searchQuery.value,
				limit: 5,
			},
		});

		if (data.value) {
			searchResults.value = data.value.results || [];
			totalResults.value = data.value.total || 0;
		}
	} catch (error) {
		console.error('Search error:', error);
	} finally {
		isSearching.value = false;
	}
}, 300);

watch(searchQuery, () => {
	debouncedSearch();
});

// Group results by collection
const groupedResults = computed(() => {
	const groups: Record<string, any[]> = {};
	
	searchResults.value.forEach((result) => {
		const collection = result._collection || 'other';
		if (!groups[collection]) {
			groups[collection] = [];
		}
		groups[collection].push(result);
	});
	
	return groups;
});

// Get icon for collection type
const getCollectionIcon = (collection: string) => {
	const icons: Record<string, string> = {
		carriers: 'i-heroicons-signal',
		services: 'i-heroicons-cloud',
		hardware: 'i-heroicons-device-phone-mobile',
		apps: 'i-heroicons-squares-2x2',
		os: 'i-heroicons-command-line',
	};
	return icons[collection] || 'i-heroicons-magnifying-glass';
};

// Get collection label
const getCollectionLabel = (collection: string) => {
	const labels: Record<string, string> = {
		carriers: 'Carriers',
		services: 'Services',
		hardware: 'Hardware',
		apps: 'Apps',
		os: 'Operating Systems',
	};
	return labels[collection] || collection;
};

// Get link for result
const getResultLink = (result: any) => {
	const type = result._type;
	const slug = result.slug;
	
	const routes: Record<string, string> = {
		carrier: `/carriers/${slug}`,
		service: `/services/${slug}`,
		hardware: `/hardware/${slug}`,
		app: `/apps/${slug}`,
		os: `/os/${slug}`,
	};
	
	return routes[type] || '#';
};

// Handle result click
const handleResultClick = (result: any) => {
	const link = getResultLink(result);
	navigateTo(link);
	closeModal();
};

// Close modal
const closeModal = () => {
	isOpen.value = false;
	searchQuery.value = '';
	searchResults.value = [];
	totalResults.value = 0;
};

// Expose open method to parent
defineExpose({
	open: () => {
		isOpen.value = true;
	},
});
</script>

<template>
	<UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
		<div class="p-4">
			<!-- Search Input -->
			<div class="relative">
				<UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
				<UInput
					v-model="searchQuery"
					placeholder="Search carriers, services, hardware..."
					size="xl"
					:ui="{ base: 'pl-10' }"
					autofocus
					@keydown.esc="closeModal"
				/>
				<div v-if="isSearching" class="absolute right-3 top-1/2 -translate-y-1/2">
					<UIcon name="i-heroicons-arrow-path" class="animate-spin text-gray-400" />
				</div>
			</div>

			<!-- Keyboard Shortcut Hint -->
			<div v-if="!searchQuery" class="mt-4 text-center text-sm text-gray-500">
				Type to search or press <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">ESC</kbd> to close
			</div>

			<!-- Search Results -->
			<div v-if="searchQuery.length >= 2" class="mt-4 max-h-96 overflow-y-auto">
				<!-- No Results -->
				<div v-if="!isSearching && searchResults.length === 0" class="text-center py-8 text-gray-500">
					<UIcon name="i-heroicons-magnifying-glass" class="text-4xl mb-2" />
					<p>No results found for "{{ searchQuery }}"</p>
				</div>

				<!-- Results by Collection -->
				<div v-else class="space-y-4">
					<div v-for="(results, collection) in groupedResults" :key="collection" class="space-y-2">
						<!-- Collection Header -->
						<div class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
							<UIcon :name="getCollectionIcon(collection)" />
							<span>{{ getCollectionLabel(collection) }}</span>
							<span class="text-gray-400">({{ results.length }})</span>
						</div>

						<!-- Results List -->
						<div class="space-y-1">
							<button
								v-for="result in results"
								:key="result.id"
								class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
								@click="handleResultClick(result)"
							>
								<div class="font-medium text-gray-900 dark:text-gray-100">
									{{ result.name }}
								</div>
								<div v-if="result.short_description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
									{{ result.short_description }}
								</div>
								<div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
									<span v-if="result.parent_company" class="flex items-center gap-1">
										<UIcon name="i-heroicons-building-office-2" />
										{{ result.parent_company }}
									</span>
									<span v-if="result.manufacturer" class="flex items-center gap-1">
										<UIcon name="i-heroicons-building-office-2" />
										{{ result.manufacturer }}
									</span>
									<span v-if="result.overall_score !== undefined" class="flex items-center gap-1">
										<UIcon name="i-heroicons-star" />
										{{ result.overall_score }}/4
									</span>
									<span v-if="result.score_overall !== undefined" class="flex items-center gap-1">
										<UIcon name="i-heroicons-star" />
										{{ result.score_overall }}/4
									</span>
								</div>
							</button>
						</div>
					</div>
				</div>

				<!-- Total Results Footer -->
				<div v-if="totalResults > searchResults.length" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
					Showing {{ searchResults.length }} of {{ totalResults }} results
				</div>
			</div>
		</div>
	</UModal>
</template>
