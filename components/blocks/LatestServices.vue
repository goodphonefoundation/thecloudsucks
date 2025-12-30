<script setup lang="ts">
import type { BlockLatestServices, Service } from '~/types';

const props = defineProps<{
	data: BlockLatestServices | null;
}>();

// Fetch the latest services based on date_created
const { data: servicesData } = await useAsyncData('latest-services', () => {
	return useDirectus(
		readItems('services', {
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
				'date_created',
			],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['-date_created'], // Sort by newest first
			limit: props.data?.limit || 3,
		}),
	);
});

const latestServices = computed(() => servicesData.value || []);
</script>

<template>
	<BlockContainer>
		<div class="text-center mb-8">
			<TypographyTitle>Recently Added Services</TypographyTitle>
			<TypographyProse v-if="data?.content" :content="data.content" class="mt-4" />
		</div>

		<div v-if="latestServices.length > 0" class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<div
				v-for="(service, idx) in latestServices"
				:key="service.id"
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
			>
				<!-- Logo -->
				<NuxtLink
					v-if="service.brand_symbol_light || service.brand_symbol_dark || service.brand_logo_light || service.brand_logo_dark"
					:to="`/services/${service.slug}`"
					class="flex items-center justify-center w-20 h-20 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4"
				>
					<!-- Light theme: use dark symbol or fallback to dark brand logo -->
					<img 
						:src="`/api/proxy/assets/${service.brand_symbol_dark || service.brand_symbol_light || service.brand_logo_dark || service.brand_logo_light}`" 
						:alt="service.name" 
						class="w-full h-full object-contain dark:hidden" 
					/>
					<!-- Dark theme: use light symbol or fallback to light brand logo -->
					<img 
						:src="`/api/proxy/assets/${service.brand_symbol_light || service.brand_symbol_dark || service.brand_logo_light || service.brand_logo_dark}`" 
						:alt="service.name" 
						class="w-full h-full object-contain hidden dark:block" 
					/>
				</NuxtLink>
				
				<!-- Service Info -->
				<div>
					<NuxtLink :to="`/services/${service.slug}`" class="hover:text-primary transition-colors">
						<h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{{ service.name }}</h3>
					</NuxtLink>
					
					<!-- Badge: NEW -->
					<span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-3">
						NEW
					</span>
					
					<!-- Service Description -->
					<p class="text-gray-600 dark:text-gray-400 mt-2">{{ service.short_description }}</p>

					<!-- Service Links -->
					<div class="mt-6 flex flex-wrap gap-3">
						<UButton
							:to="`/services/${service.slug}`"
							color="primary"
							size="sm"
							icon="i-mdi-arrow-right"
						>
							View Details
						</UButton>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
			<p>No services available yet.</p>
		</div>
	</BlockContainer>
</template>
