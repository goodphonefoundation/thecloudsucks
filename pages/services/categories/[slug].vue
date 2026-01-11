<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Fetch category details
const { data: category } = await useAsyncData(`category-${slug}`, () => {
	return useDirectus(
		readItems('service_categories', {
			fields: ['*'],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'published' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Fetch services in this category
const { data: services } = await useAsyncData(`category-services-${slug}`, async () => {
	if (!category.value) return [];
	
	return useDirectus(
		readItems('services', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'brand_logo_light',
				'brand_logo_dark',
				'brand_symbol_light',
				'brand_symbol_dark',
				'assessment_tier',
				'assessment_recommended_use',
				'score_overall',
				'end_to_end_encryption',
				'default_tracking',
			],
			filter: {
				status: { _eq: 'published' },
				categories: {
					service_categories_id: {
						id: { _eq: category.value.id },
					},
				},
			},
			sort: ['-score_overall', 'name'],
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
	title: `${category.value.name} Services`,
	meta: [
		{
			name: 'description',
			content: category.value.description || `Browse ${category.value.name} services and alternatives`,
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

// Helper to get risk profile badge color
const getRiskColor = (risk: string | null | undefined) => {
	if (!risk) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
	
	const colors: Record<string, string> = {
		low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
	};
	
	return colors[risk] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
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
					<NuxtLink to="/services" class="hover:text-gray-700 dark:hover:text-gray-300">Services</NuxtLink>
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
							v-if="category.risk_profile"
							:class="[
								'px-3 py-1 text-sm font-semibold rounded-full',
								getRiskColor(category.risk_profile)
							]"
						>
							{{ category.risk_profile.toUpperCase() }} RISK
						</span>
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
						<dt class="text-xs text-gray-500 dark:text-gray-400 mb-1">Display Order</dt>
						<dd class="text-sm font-mono text-gray-900 dark:text-white">
							{{ category.order !== null && category.order !== undefined ? category.order : 'Not set' }}
						</dd>
					</div>
				</div>
			</div>

			<!-- Services in this Category -->
			<div class="py-12">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-bold text-gray-900 dark:text-white">
						Services in {{ category.name }}
					</h2>
					<span class="text-sm text-gray-500 dark:text-gray-400">
						{{ services?.length || 0 }} {{ services?.length === 1 ? 'service' : 'services' }}
					</span>
				</div>

				<!-- Services Grid -->
				<div v-if="services && services.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					<NuxtLink
						v-for="service in services"
						:key="service.id"
						:to="`/services/${service.slug}`"
						class="group block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg"
					>
						<!-- Service Logo -->
						<div class="flex items-center gap-4 mb-4">
							<div class="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
								<img
									v-if="service.brand_symbol_light || service.brand_logo_light"
									:src="service.brand_symbol_light || service.brand_logo_light"
									:alt="service.name"
									class="w-12 h-12 object-contain"
								/>
								<span v-else class="text-2xl font-bold text-gray-400">
									{{ service.name.charAt(0) }}
								</span>
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
									{{ service.name }}
								</h3>
								<div class="flex flex-wrap gap-1 mt-1">
									<span
										v-if="service.assessment_tier"
										:class="[
											'px-2 py-0.5 text-xs font-semibold rounded',
											getTierColor(service.assessment_tier)
										]"
									>
										{{ getTierLabel(service.assessment_tier) }}
									</span>
								</div>
							</div>
						</div>

						<!-- Service Description -->
						<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
							{{ service.short_description || 'No description available' }}
						</p>

						<!-- Service Badges -->
						<div class="flex flex-wrap gap-2 text-xs">
							<span
								v-if="service.end_to_end_encryption === 'yes'"
								class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
							>
								E2E Encrypted
							</span>
							<span
								v-if="service.default_tracking === 'none'"
								class="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded"
							>
								No Tracking
							</span>
							<span
								v-if="service.score_overall !== null && service.score_overall !== undefined"
								class="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded"
							>
								Score: {{ service.score_overall }}/4
							</span>
						</div>
					</NuxtLink>
				</div>

				<!-- Empty State -->
				<div v-else class="text-center py-12">
					<svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
					</svg>
					<p class="text-gray-500 dark:text-gray-400">No services found in this category</p>
				</div>
			</div>

			<!-- All Fields Debug Section (for development - can be removed in production) -->
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
							
							<div class="text-gray-600 dark:text-gray-400">risk_profile:</div>
							<div class="text-gray-900 dark:text-white">{{ category.risk_profile || 'null' }}</div>
							
							<div class="text-gray-600 dark:text-gray-400">order:</div>
							<div class="text-gray-900 dark:text-white">{{ category.order !== null && category.order !== undefined ? category.order : 'null' }}</div>
						</div>
					</div>
				</details>
			</div>
		</BlockContainer>
	</div>
</template>
