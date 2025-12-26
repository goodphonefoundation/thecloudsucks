<script setup lang="ts">
import type { BlockAppsShowcase, App } from '~/types';

const props = defineProps<{
	data: BlockAppsShowcase | null;
}>();

// Fetch apps filtered by category
// TODO: Add category filtering support once M2M filter syntax is confirmed
const { data: appsData } = await useAsyncData('apps-showcase-v3', () => {
	return useDirectus(
		readItems('apps', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'website_url',
				'repo_url',
				'icon',
				'is_open_source',
				'end_to_end_encryption',
				'default_tracking',
			],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});
</script>

<template>
	<BlockContainer>
		<TypographyHeadline v-if="data?.headline" :content="data.headline" size="lg" />
		<TypographyProse v-if="data?.content" :content="data.content" class="mt-4" />

	<div
		v-if="appsData && appsData.length > 0"
		class="mt-8 grid gap-6"
		:class="{
			'md:grid-cols-2 lg:grid-cols-3': data?.display_style === 'grid',
			'grid-cols-1': data?.display_style === 'list',
			'md:grid-cols-1 lg:grid-cols-2': data?.display_style === 'featured',
		}"
	>
		<div
			v-for="(app, idx) in appsData"
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
				:delay="100 + 100 * idx"
				class="border rounded-card p-6 hover:shadow-lg transition-shadow dark:border-gray-700"
			>
				<!-- App Header -->
				<div class="flex items-start gap-4">
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
						</div>
					</div>
				</div>

				<!-- App Description -->
				<p class="mt-4 text-gray-600 dark:text-gray-400">{{ app.short_description }}</p>

				<!-- App Links -->
				<div class="mt-6 flex gap-3">
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
				</div>
			</div>
		</div>

		<div v-else class="mt-8 text-center text-gray-500 dark:text-gray-400">
			<p>No apps available at the moment.</p>
		</div>
	</BlockContainer>
</template>
