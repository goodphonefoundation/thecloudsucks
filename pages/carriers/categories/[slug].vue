<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Fetch category details
const { data: category } = await useAsyncData(`carrier-category-${slug}`, () => {
	return useDirectus(
		readItems('carrier_categories', {
			fields: ['*'],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'published' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Fetch carriers in this category
const { data: carriers} = await useAsyncData(`category-carriers-${slug}`, async () => {
	if (!category.value) return [];
	
	return useDirectus(
		readItems('carriers', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'brand_logo_light',
				'brand_logo_dark',
				'brand_symbol_light',
				'brand_symbol_dark',
				'tier',
				'recommended_use',
				'overall_score',
				'mvno_status',
				'esim_support',
				'prepaid_anonymous',
			],
			filter: {
				status: { _eq: 'published' },
				categories: {
					carrier_categories_id: {
						id: { _eq: category.value.id },
					},
				},
			},
			sort: ['-overall_score', 'name'],
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
	title: `${category.value.name} Carriers`,
	meta: [
		{
			name: 'description',
			content: category.value.description || `Browse ${category.value.name} mobile carriers`,
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

// Helper to format date
const formatDate = (date: string | null | undefined) => {
	if (!date) return 'Not set';
	return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
					<NuxtLink to="/carriers" class="hover:text-gray-700 dark:hover:text-gray-300">Carriers</NuxtLink>
					<span>/</span>
					<span class="text-gray-900 dark:text-gray-100">{{ category.name }}</span>
				</nav>
			</div>

			<!-- Category Header -->
			<div class="py-8 border-b dark:border-gray-800">
				<div class="flex flex-wrap items-start justify-between gap-4 mb-6">
					<div class="flex-1 flex items-center gap-4">
						<div v-if="category.icon" class="text-4xl">
							{{ category.icon }}
						</div>
						<h1 class="text-4xl font-bold text-gray-900 dark:text-white">
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
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
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
					<div>
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Icon</dt>
						<dd class="text-sm text-gray-900 dark:text-white">
							{{ category.icon || 'Not set' }}
						</dd>
					</div>
				</div>

				<!-- Audit Trail -->
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mt-4">
					<div>
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</dt>
						<dd class="text-xs text-gray-900 dark:text-white">{{ formatDate(category.date_created) }}</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Created By</dt>
						<dd class="text-xs font-mono text-gray-900 dark:text-white truncate">{{ category.user_created || 'Unknown' }}</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Updated</dt>
						<dd class="text-xs text-gray-900 dark:text-white">{{ formatDate(category.date_updated) }}</dd>
					</div>
					<div>
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Updated By</dt>
						<dd class="text-xs font-mono text-gray-900 dark:text-white truncate">{{ category.user_updated || 'Unknown' }}</dd>
					</div>
				</div>
			</div>

			<!-- Carriers in this Category -->
			<div class="py-12">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-bold text-gray-900 dark:text-white">
						Carriers in {{ category.name }}
					</h2>
					<span class="text-sm text-gray-500 dark:text-gray-400">
						{{ carriers?.length || 0 }} {{ carriers?.length === 1 ? 'carrier' : 'carriers' }}
					</span>
				</div>

				<!-- Carriers Grid -->
				<div v-if="carriers && carriers.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					<NuxtLink
						v-for="carrier in carriers"
						:key="carrier.id"
						:to="`/carriers/${carrier.slug}`"
						class="group block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg"
					>
						<!-- Carrier Logo -->
						<div class="flex items-center gap-4 mb-4">
							<div class="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
								<img
									v-if="carrier.brand_symbol_light || carrier.brand_logo_light"
									:src="`/api/proxy/assets/${carrier.brand_symbol_light || carrier.brand_logo_light}`"
									:alt="carrier.name"
									class="w-12 h-12 object-contain"
								/>
								<span v-else class="text-2xl font-bold text-gray-400">
									{{ carrier.name.charAt(0) }}
								</span>
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
									{{ carrier.name }}
								</h3>
								<div class="flex flex-wrap gap-1 mt-1">
									<span
										v-if="carrier.tier"
										:class="[
											'px-2 py-0.5 text-xs font-semibold rounded',
											getTierColor(carrier.tier)
										]"
									>
										{{ getTierLabel(carrier.tier) }}
									</span>
								</div>
							</div>
						</div>

						<!-- Carrier Description -->
						<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
							{{ carrier.short_description || 'No description available' }}
						</p>

						<!-- Carrier Badges -->
						<div class="flex flex-wrap gap-2 text-xs">
							<span
								v-if="carrier.mvno_status"
								class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
							>
								MVNO
							</span>
							<span
								v-if="carrier.esim_support"
								class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded"
							>
								eSIM
							</span>
							<span
								v-if="carrier.prepaid_anonymous"
								class="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded"
							>
								Anonymous
							</span>
							<span
								v-if="carrier.overall_score !== null && carrier.overall_score !== undefined"
								class="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded"
							>
								Score: {{ carrier.overall_score }}/4
							</span>
						</div>
					</NuxtLink>
				</div>

				<!-- Empty State -->
				<div v-else class="text-center py-12">
					<svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p class="text-gray-500 dark:text-gray-400">No carriers found in this category</p>
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
							
							<div class="text-gray-600 dark:text-gray-400">user_created:</div>
							<div class="text-gray-900 dark:text-white">{{ category.user_created || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">date_created:</div>
							<div class="text-gray-900 dark:text-white">{{ category.date_created || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">user_updated:</div>
							<div class="text-gray-900 dark:text-white">{{ category.user_updated || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">date_updated:</div>
							<div class="text-gray-900 dark:text-white">{{ category.date_updated || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">name:</div>
							<div class="text-gray-900 dark:text-white">{{ category.name || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">slug:</div>
							<div class="text-gray-900 dark:text-white">{{ category.slug || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">description:</div>
							<div class="text-gray-900 dark:text-white">{{ category.description || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">icon:</div>
							<div class="text-gray-900 dark:text-white">{{ category.icon || 'null' }}</div>
						</div>
					</div>
				</details>
			</div>
		</BlockContainer>
	</div>
</template>
