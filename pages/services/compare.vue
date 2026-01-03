<script setup lang="ts">
const route = useRoute();
const router = useRouter();

// Get service IDs from URL
const serviceIds = computed(() => {
	const ids = route.query.ids as string;
	if (!ids) return [];
	return ids.split(',').filter(Boolean);
});

// Fetch service details
const { data: services } = await useAsyncData(
	`services-comparison-${serviceIds.value.join('-')}`,
	() => {
		if (serviceIds.value.length === 0) return Promise.resolve([]);
		
		return useDirectus(
			readItems('services', {
				fields: [
					'*',
					'vendor.name',
					'categories.service_categories_id.id',
					'categories.service_categories_id.name',
				],
				filter: {
					id: { _in: serviceIds.value },
					status: { _eq: 'published' },
				},
			}),
		);
	},
	{
		watch: [serviceIds],
	}
);

// Helper to format field values
const formatValue = (value: any): string => {
	if (value === null || value === undefined) return 'N/A';
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';
	if (typeof value === 'string') return value.replace(/_/g, ' ');
	if (Array.isArray(value)) {
		if (value.length === 0) return 'N/A';
		return value.join(', ');
	}
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
};

// Helper to get score label
const getScoreLabel = (score: number | null | undefined): string => {
	if (score === null || score === undefined) return 'Not Rated';
	const labels = ['Hostile', 'Weak', 'Mixed', 'Strong', 'Best-in-Class'];
	return labels[score] || 'N/A';
};

// Helper to get tier label
const getTierLabel = (tier: string | null | undefined): string => {
	if (!tier) return 'N/A';
	const labels: Record<string, string> = {
		A_Sovereign: 'A - Sovereign',
		B_Aligned: 'B - Aligned',
		C_Transitional: 'C - Transitional',
		D_Extractive: 'D - Extractive',
	};
	return labels[tier] || tier;
};

// Helper to get recommendation label
const getRecommendationLabel = (rec: string | null | undefined): string => {
	if (!rec) return 'N/A';
	const labels: Record<string, string> = {
		recommended: 'Recommended',
		situational: 'Situational',
		avoid: 'Avoid',
		compare_only: 'Compare Only',
	};
	return labels[rec] || rec;
};

// SEO
useHead({
	title: 'Compare Services',
	meta: [
		{
			name: 'description',
			content: 'Compare services side by side to make informed decisions.',
		},
	],
});
</script>

<template>
	<BlockContainer>
		<!-- Header -->
		<div class="mb-8">
			<NuxtLink to="/services" class="inline-flex items-center text-sm text-primary hover:underline mb-4">
				← Back to Services
			</NuxtLink>
			<h1 class="text-4xl font-bold mb-4">Compare Services</h1>
			<p class="text-gray-600 dark:text-gray-400">
				Side-by-side comparison of selected services
			</p>
		</div>

		<!-- No Services Selected -->
		<div v-if="!services || services.length === 0" class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400 mb-4">
				No services selected for comparison.
			</p>
			<UButton to="/services" color="primary">
				Browse Services
			</UButton>
		</div>

		<!-- Less than 2 services -->
		<div v-else-if="services.length < 2" class="text-center py-12">
			<p class="text-gray-500 dark:text-gray-400 mb-4">
				Please select at least 2 services to compare.
			</p>
			<UButton to="/services" color="primary">
				Browse Services
			</UButton>
		</div>

		<!-- Comparison Table -->
		<div v-else class="overflow-x-auto">
			<table class="w-full border-collapse border border-gray-300 dark:border-gray-700">
				<!-- Service Headers -->
				<thead>
					<tr class="bg-gray-50 dark:bg-gray-800">
						<th class="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 text-left font-semibold w-48">
							Field
						</th>
						<th
							v-for="service in services"
							:key="service.id"
							class="border border-gray-300 dark:border-gray-700 p-4 text-center min-w-[250px]"
						>
							<div class="flex flex-col items-center gap-3">
								<NuxtImg
									v-if="service.brand_symbol_light || service.brand_symbol_dark"
									:src="service.brand_symbol_light || service.brand_symbol_dark"
									:alt="service.name"
									class="w-16 h-16 rounded-lg"
								/>
								<div>
									<NuxtLink :to="`/services/${service.slug}`" class="text-lg font-semibold hover:text-primary">
										{{ service.name }}
									</NuxtLink>
								</div>
							</div>
						</th>
					</tr>
				</thead>

				<!-- Overview Section -->
				<tbody>
					<tr class="bg-gray-100 dark:bg-gray-900">
						<td colspan="100%" class="border border-gray-300 dark:border-gray-700 p-3 font-bold">
							Overview
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Description
						</td>
						<td
							v-for="service in services"
							:key="`desc-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ service.short_description || 'N/A' }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Categories
						</td>
						<td
							v-for="service in services"
							:key="`cat-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							<div class="flex flex-wrap gap-1">
								<span
									v-for="cat in service.categories"
									:key="cat.id"
									class="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800"
								>
									{{ cat.service_categories_id.name }}
								</span>
							</div>
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Website
						</td>
						<td
							v-for="service in services"
							:key="`web-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							<a v-if="service.website_url" :href="service.website_url" target="_blank" class="text-primary hover:underline">
								Visit
							</a>
							<span v-else>N/A</span>
						</td>
					</tr>

					<!-- Assessment Section -->
					<tr class="bg-gray-100 dark:bg-gray-900">
						<td colspan="100%" class="border border-gray-300 dark:border-gray-700 p-3 font-bold">
							Assessment
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Tier
						</td>
						<td
							v-for="service in services"
							:key="`tier-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ getTierLabel(service.assessment_tier) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Recommendation
						</td>
						<td
							v-for="service in services"
							:key="`rec-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ getRecommendationLabel(service.assessment_recommended_use) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Overall Score
						</td>
						<td
							v-for="service in services"
							:key="`overall-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ getScoreLabel(service.score_overall) }}
						</td>
					</tr>

					<!-- Privacy & Security Section -->
					<tr class="bg-gray-100 dark:bg-gray-900">
						<td colspan="100%" class="border border-gray-300 dark:border-gray-700 p-3 font-bold">
							Privacy & Security
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							E2E Encryption
						</td>
						<td
							v-for="service in services"
							:key="`e2e-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.end_to_end_encryption) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Default Tracking
						</td>
						<td
							v-for="service in services"
							:key="`track-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.default_tracking) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Logging Policy
						</td>
						<td
							v-for="service in services"
							:key="`log-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.logging_policy) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Data Portability
						</td>
						<td
							v-for="service in services"
							:key="`port-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.data_portability) }}
						</td>
					</tr>

					<!-- Technical Section -->
					<tr class="bg-gray-100 dark:bg-gray-900">
						<td colspan="100%" class="border border-gray-300 dark:border-gray-700 p-3 font-bold">
							Technical
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Open Source Clients
						</td>
						<td
							v-for="service in services"
							:key="`osc-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.open_source_clients) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Open Source Server
						</td>
						<td
							v-for="service in services"
							:key="`oss-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.open_source_server) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Self-Hostable
						</td>
						<td
							v-for="service in services"
							:key="`sh-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ formatValue(service.self_hostable) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Federated
						</td>
						<td
							v-for="service in services"
							:key="`fed-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ formatValue(service.federated) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Protocols
						</td>
						<td
							v-for="service in services"
							:key="`proto-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ formatValue(service.protocols) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Platforms Supported
						</td>
						<td
							v-for="service in services"
							:key="`plat-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.platforms_supported) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Simultaneous Devices
						</td>
						<td
							v-for="service in services"
							:key="`sim-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ formatValue(service.simultaneous_devices) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Audience Level
						</td>
						<td
							v-for="service in services"
							:key="`aud-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.audience_level) }}
						</td>
					</tr>

					<!-- Organization Section -->
					<tr class="bg-gray-100 dark:bg-gray-900">
						<td colspan="100%" class="border border-gray-300 dark:border-gray-700 p-3 font-bold">
							Organization
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Vendor
						</td>
						<td
							v-for="service in services"
							:key="`vend-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ service.vendor?.name || 'N/A' }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Jurisdiction
						</td>
						<td
							v-for="service in services"
							:key="`jur-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ formatValue(service.jurisdiction) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Governance Model
						</td>
						<td
							v-for="service in services"
							:key="`gov-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.governance_model) }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Business Model
						</td>
						<td
							v-for="service in services"
							:key="`biz-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm capitalize"
						>
							{{ formatValue(service.primary_business_model) }}
						</td>
					</tr>

					<!-- Values Assessment Scores -->
					<tr class="bg-gray-100 dark:bg-gray-900">
						<td colspan="100%" class="border border-gray-300 dark:border-gray-700 p-3 font-bold">
							Values Assessment
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Autonomy
						</td>
						<td
							v-for="service in services"
							:key="`auto-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ service.scores?.autonomy !== null && service.scores?.autonomy !== undefined ? `${service.scores.autonomy}/4` : 'N/A' }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Control & Ownership
						</td>
						<td
							v-for="service in services"
							:key="`ctrl-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ service.scores?.control_ownership !== null && service.scores?.control_ownership !== undefined ? `${service.scores.control_ownership}/4` : 'N/A' }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Human Impact
						</td>
						<td
							v-for="service in services"
							:key="`hum-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ service.scores?.human_impact !== null && service.scores?.human_impact !== undefined ? `${service.scores.human_impact}/4` : 'N/A' }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Resilience
						</td>
						<td
							v-for="service in services"
							:key="`res-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ service.scores?.resilience !== null && service.scores?.resilience !== undefined ? `${service.scores.resilience}/4` : 'N/A' }}
						</td>
					</tr>
					<tr>
						<td class="sticky left-0 z-10 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 p-3 font-medium">
							Transparency
						</td>
						<td
							v-for="service in services"
							:key="`trans-${service.id}`"
							class="border border-gray-300 dark:border-gray-700 p-3 text-sm"
						>
							{{ service.scores?.transparency !== null && service.scores?.transparency !== undefined ? `${service.scores.transparency}/4` : 'N/A' }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Actions -->
		<div v-if="services && services.length >= 2" class="mt-8 flex justify-center gap-4">
			<UButton to="/services" color="gray" variant="outline">
				Back to Services
			</UButton>
		</div>
	</BlockContainer>
</template>
