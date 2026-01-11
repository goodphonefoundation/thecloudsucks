<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Fetch category details
const { data: category } = await useAsyncData(`app-category-${slug}`, () => {
	return useDirectus(
		readItems('mobile_app_categories', {
			fields: ['*'],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'published' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Fetch apps in this category
const { data: apps } = await useAsyncData(`category-apps-${slug}`, async () => {
	if (!category.value) return [];
	
	return useDirectus(
		readItems('mobile_apps', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'app_icon_light',
				'app_icon_dark',
				'tier',
				'recommended_use',
				'is_open_source',
				'end_to_end_encryption',
				'requires_phone_number',
			],
			filter: {
				status: { _eq: 'active' },
				categories: {
					mobile_app_categories_id: {
						id: { _eq: category.value.id },
					},
				},
			},
			sort: ['tier', 'name'],
		}),
	);
});

// If category not found, show 404
if (!category.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Category Not Found',
	});
}

// SEO
useHead({
	title: `${category.value.name} Apps`,
	meta: [
		{
			name: 'description',
			content: category.value.description || `Browse ${category.value.name} mobile apps and alternatives`,
		},
	],
});

// Helper to get tier badge color
const getTierColor = (tier: string | null | undefined) => {
	if (!tier) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
	
	const colors: Record<string, string> = {
		A_Sovereign: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		B_Aligned: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		C_Transitional: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		D_Extractive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
	};
	
	return colors[tier] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
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
</script>

<template>
	<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
		<BlockContainer>
			<!-- Breadcrumb -->
			<div class="py-6">
				<nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
					<NuxtLink to="/" class="hover:text-gray-700 dark:hover:text-gray-300">Home</NuxtLink>
					<span>/</span>
					<NuxtLink to="/apps" class="hover:text-gray-700 dark:hover:text-gray-300">Apps</NuxtLink>
					<span>/</span>
					<span class="text-gray-900 dark:text-gray-100">{{ category.name }}</span>
				</nav>
			</div>

			<!-- Category Header -->
			<div class="py-8 border-b dark:border-gray-800">
				<div class="flex flex-wrap items-start justify-between gap-4 mb-6">
					<div class="flex-1">
						<h1 class="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
							{{ category.name }}
						</h1>
					</div>
					<div class="flex flex-wrap gap-2">
						<span
							v-if="category.status"
							:class="[
								'px-3 py-1 text-sm font-semibold rounded-full',
								category.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
								category.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
								'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
							]"
						>
							{{ category.status.toUpperCase() }}
						</span>
					</div>
				</div>

				<!-- Description -->
				<div v-if="category.description" class="prose dark:prose-invert max-w-none mb-6">
					<p class="text-lg text-gray-700 dark:text-gray-300">{{ category.description }}</p>
				</div>
				<div v-else class="mb-6">
					<p class="text-gray-500 dark:text-gray-400 italic">No description provided</p>
				</div>

				<!-- Category Metadata -->
				<div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
					<div>
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Category ID</dt>
						<dd class="text-sm font-mono text-gray-900 dark:text-white truncate">{{ category.id }}</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Slug</dt>
						<dd class="text-sm font-mono text-gray-900 dark:text-white">{{ category.slug }}</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Sort Order</dt>
						<dd class="text-sm font-mono text-gray-900 dark:text-white">
							{{ category.sort !== null && category.sort !== undefined ? category.sort : 'Not set' }}
						</dd>
					</div>
				</div>
			</div>

			<!-- Apps in this Category -->
			<div class="py-12">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-bold text-gray-900 dark:text-white">
						Apps in {{ category.name }}
					</h2>
					<span class="text-sm text-gray-500 dark:text-gray-400">
						{{ apps?.length || 0 }} {{ apps?.length === 1 ? 'app' : 'apps' }}
					</span>
				</div>

				<!-- Apps Grid -->
				<div v-if="apps && apps.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					<NuxtLink
						v-for="app in apps"
						:key="app.id"
						:to="`/apps/${app.slug}`"
						class="group block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg"
					>
						<!-- App Icon -->
						<div class="flex items-center gap-4 mb-4">
							<div class="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden">
								<img
									v-if="app.app_icon_light || app.app_icon_dark"
									:src="`/api/proxy/assets/${app.app_icon_dark || app.app_icon_light}`"
									:alt="app.name"
									class="w-full h-full object-cover"
								/>
								<span v-else class="text-2xl font-bold text-gray-400">
									{{ app.name.charAt(0) }}
								</span>
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
									{{ app.name }}
								</h3>
								<div class="flex flex-wrap gap-1 mt-1">
									<span
										v-if="app.tier"
										:class="[
											'px-2 py-0.5 text-xs font-semibold rounded',
											getTierColor(app.tier)
										]"
									>
										{{ getTierLabel(app.tier) }}
									</span>
								</div>
							</div>
						</div>

						<!-- App Description -->
						<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
							{{ app.short_description || 'No description available' }}
						</p>

						<!-- App Badges -->
						<div class="flex flex-wrap gap-2 text-xs">
							<span
								v-if="app.is_open_source"
								class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
							>
								Open Source
							</span>
							<span
								v-if="app.end_to_end_encryption"
								class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded"
							>
								E2E Encrypted
							</span>
							<span
								v-if="!app.requires_phone_number"
								class="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded"
							>
								No Phone Required
							</span>
						</div>
					</NuxtLink>
				</div>

				<!-- Empty State -->
				<div v-else class="text-center py-12">
					<svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
					</svg>
					<p class="text-gray-500 dark:text-gray-400">No apps found in this category</p>
				</div>
			</div>

			<!-- All Fields Debug Section -->
			<div class="py-8 border-t dark:border-gray-800">
				<details class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
					<summary class="cursor-pointer font-semibold text-gray-900 dark:text-white mb-2">
						View All Category Fields (Debug)
					</summary>
					<div class="mt-4 space-y-2 text-sm font-mono">
						<div class="grid grid-cols-2 gap-2">
							<div class="text-gray-600 dark:text-gray-400">id:</div>
							<div class="text-gray-900 dark:text-white">{{ category.id || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">status:</div>
							<div class="text-gray-900 dark:text-white">{{ category.status || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">sort:</div>
							<div class="text-gray-900 dark:text-white">{{ category.sort !== null && category.sort !== undefined ? category.sort : 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">name:</div>
							<div class="text-gray-900 dark:text-white">{{ category.name || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">slug:</div>
							<div class="text-gray-900 dark:text-white">{{ category.slug || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">description:</div>
							<div class="text-gray-900 dark:text-white">{{ category.description || 'null' }}</div>
						</div>
					</div>
				</details>
			</div>
		</BlockContainer>
	</div>
</template>
