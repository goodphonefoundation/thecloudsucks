<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Fetch selfhosted alternative details
const { data: alternative } = await useAsyncData(`selfhosted-${slug}`, () => {
	return useDirectus(
		readItems('selfhosted_alternatives', {
			fields: ['*'],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'active' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Fetch sources for this alternative
const { data: sources } = await useAsyncData(`selfhosted-sources-${slug}`, async () => {
	if (!alternative.value) return [];
	return useDirectus(
		readItems('selfhosted_sources', {
			fields: ['*'],
			filter: {
				selfhosted_alternative: { _eq: alternative.value.id },
				status: { _eq: 'published' },
			},
			sort: ['-date_published', 'title'],
		}),
	);
});

// Fetch change logs for this alternative
const { data: changeLogs } = await useAsyncData(`selfhosted-changelog-${slug}`, async () => {
	if (!alternative.value) return [];
	return useDirectus(
		readItems('selfhosted_change_log', {
			fields: ['*'],
			filter: {
				selfhosted_alternative: { _eq: alternative.value.id },
				status: { _eq: 'published' },
			},
			sort: ['-date'],
		}),
	);
});

// Fetch alternatives in the same category
const { data: alternatives } = await useAsyncData(`selfhosted-alternatives-${slug}`, async () => {
	if (!alternative.value || !alternative.value.category) return [];
	
	return useDirectus(
		readItems('selfhosted_alternatives', {
			fields: [
				'id',
				'name',
				'slug',
				'short_description',
				'brand_logo_light',
				'tier',
				'is_open_source',
				'end_to_end_encryption',
				'category',
			],
			filter: {
				status: { _eq: 'active' },
				id: { _neq: alternative.value.id },
				category: { _eq: alternative.value.category },
			},
			sort: ['name'],
			limit: 6,
		}),
	);
});

// If alternative not found, show 404
if (!alternative.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'Self-Hosted Alternative Not Found',
	});
}

// SEO
useHead({
	title: alternative.value.name,
	meta: [
		{
			name: 'description',
			content: alternative.value.short_description || '',
		},
	],
});

// Helper functions
const formatField = (value: any) => {
	if (value === null || value === undefined) return 'Unknown';
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';
	if (typeof value === 'string') return value.replace(/_/g, ' ');
	return value;
};

// Helper to format tier label
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

// Helper to format recommendation label
const getRecommendationLabel = (rec: string | null | undefined) => {
	if (!rec) return null;
	const labels: Record<string, string> = {
		recommended: 'Recommended',
		situational: 'Situational',
		avoid: 'Avoid',
		compare_only: 'Compare Only',
	};
	return labels[rec] || rec;
};

// Helper to format deployment complexity
const getComplexityColor = (complexity: string | null | undefined) => {
	if (!complexity) return 'gray';
	const colors: Record<string, string> = {
		low: 'green',
		medium: 'yellow',
		high: 'red',
	};
	return colors[complexity] || 'gray';
};

// Markdown rendering
const { toHtml } = useMarkdown();
const tradeoffsHtml = computed(() => toHtml(alternative.value?.tradeoffs));
const longDescriptionHtml = computed(() => toHtml(alternative.value?.long_description));
const migrationNotesHtml = computed(() => toHtml(alternative.value?.migration_notes));

// Tab state
const activeTab = ref('overview');
</script>

<template>
	<BlockContainer v-if="alternative">
		<!-- Header Section -->
		<div class="mb-8">
			<NuxtLink
				to="/self-hosting"
				class="inline-flex items-center text-sm text-primary hover:underline mb-6"
			>
				← Back to Self-Hosting
			</NuxtLink>
			
			<!-- Logo (centered) -->
			<div v-if="alternative.brand_logo_light || alternative.brand_logo_dark" class="mb-6 flex items-center justify-center">
				<NuxtImg 
					:src="alternative.brand_logo_light || alternative.brand_logo_dark" 
					:alt="alternative.name" 
					class="w-24 h-24 rounded-xl" 
				/>
			</div>
			
			<div>
				<h1 class="text-4xl font-bold mb-3 text-gray-900 dark:text-white text-center">{{ alternative.name }}</h1>
				<p v-if="alternative.replaces && alternative.replaces.length > 0" class="text-xl text-gray-600 dark:text-gray-400 mb-2 text-center">
					Replaces: {{ alternative.replaces.join(', ') }}
				</p>
				<p class="text-xl text-gray-600 dark:text-gray-400 mb-4 text-center">
					{{ alternative.short_description }}
				</p>
				
				<!-- Main Badges -->
				<div class="flex flex-wrap gap-2 justify-center">
					<span
						v-if="alternative.category"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 capitalize"
					>
						{{ formatField(alternative.category) }}
					</span>
					<span
						v-if="alternative.is_open_source"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						Open Source
					</span>
					<span
						v-if="alternative.hosting_modes?.includes('self_hosted')"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						Self-Hostable
					</span>
					<span
						v-if="alternative.end_to_end_encryption === 'yes'"
						class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
					>
						E2E Encrypted
					</span>
					<span
						v-if="alternative.tier"
						:class="[
							'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full',
							alternative.tier === 'A_Sovereign' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
							alternative.tier === 'B_Aligned' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
							alternative.tier === 'C_Transitional' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
							alternative.tier === 'D_Extractive' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
						]"
					>
						{{ getTierLabel(alternative.tier) }}
					</span>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3 mb-8 pb-8 border-b dark:border-gray-700 justify-center">
			<UButton
				v-if="alternative.website_url"
				:to="alternative.website_url"
				target="_blank"
				color="primary"
				size="lg"
				icon="i-mdi-open-in-new"
			>
				Visit Website
			</UButton>
			<UButton
				v-if="alternative.repo_url"
				:to="alternative.repo_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-github"
			>
				Source Code
			</UButton>
			<UButton
				v-if="alternative.docs_url"
				:to="alternative.docs_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-book-open-page-variant"
			>
				Documentation
			</UButton>
		</div>

		<!-- Tab Navigation -->
		<div class="border-b dark:border-gray-700 mb-8">
			<nav class="flex gap-8" aria-label="Tabs">
				<button
					@click="activeTab = 'overview'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'overview'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Overview
				</button>
				<button
					@click="activeTab = 'changelog'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'changelog'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Change Log
					<span v-if="changeLogs && changeLogs.length" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
						{{ changeLogs.length }}
					</span>
				</button>
				<button
					@click="activeTab = 'sources'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'sources'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Sources
					<span v-if="sources && sources.length" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
						{{ sources.length }}
					</span>
				</button>
				<button
					@click="activeTab = 'alternatives'"
					:class="[
						'pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
						activeTab === 'alternatives'
							? 'border-primary text-primary'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					]"
				>
					Alternatives
					<span v-if="alternatives && alternatives.length" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
						{{ alternatives.length }}
					</span>
				</button>
			</nav>
		</div>

		<!-- Overview Tab Content -->
		<div v-show="activeTab === 'overview'">
		<!-- Content Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-8">
				<!-- About -->
				<div v-if="longDescriptionHtml">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About</h2>
					<TypographyProse :content="longDescriptionHtml" />
				</div>

				<!-- Assessment -->
				<div v-if="alternative.tier || alternative.recommended_use">
					<div class="border dark:border-gray-700 rounded-lg p-6">
						<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">GoodPhone Assessment</h2>
						<div v-if="alternative.tier" class="mb-2">
							<span
								:class="[
									'inline-flex items-center px-3 py-1.5 text-base font-semibold rounded-lg',
									alternative.tier === 'A_Sovereign' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
									alternative.tier === 'B_Aligned' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
									alternative.tier === 'C_Transitional' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
									alternative.tier === 'D_Extractive' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								]"
							>
								{{ getTierLabel(alternative.tier) }}
							</span>
						</div>
						<p v-if="alternative.recommended_use" class="text-sm text-gray-600 dark:text-gray-400">
							{{ getRecommendationLabel(alternative.recommended_use) }}
						</p>
						<p v-if="alternative.summary" class="mt-4 text-gray-700 dark:text-gray-300">{{ alternative.summary }}</p>
					</div>
				</div>

				<!-- Tradeoffs -->
				<div v-if="tradeoffsHtml">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Tradeoffs</h2>
					<TypographyProse :content="tradeoffsHtml" />
				</div>

				<!-- Migration Guide -->
				<div v-if="migrationNotesHtml">
					<h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Migration Guide</h2>
					<TypographyProse :content="migrationNotesHtml" />
				</div>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Deployment -->
				<div class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Deployment</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="alternative.deployment_complexity">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Complexity</dt>
							<dd>
								<span
									:class="[
										'inline-flex items-center px-2 py-1 text-xs font-medium rounded capitalize',
										alternative.deployment_complexity === 'low' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
										alternative.deployment_complexity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
										'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
									]"
								>
									{{ alternative.deployment_complexity }}
								</span>
							</dd>
						</div>
						<div v-if="alternative.required_skills && alternative.required_skills.length > 0">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Required Skills</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ alternative.required_skills.join(', ') }}</dd>
						</div>
						<div v-if="alternative.resource_requirements">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Resources</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ alternative.resource_requirements }}</dd>
						</div>
					</dl>
				</div>

				<!-- Platform Support -->
				<div v-if="alternative.supported_platforms && alternative.supported_platforms.length > 0" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Platforms</h3>
					<div class="space-y-2">
						<div v-for="platform in alternative.supported_platforms" :key="platform" class="flex items-center gap-2">
							<span class="text-green-500">✓</span>
							<span class="capitalize">{{ formatField(platform) }}</span>
						</div>
					</div>
				</div>

				<!-- Privacy & Security -->
				<div class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Privacy & Security</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="alternative.end_to_end_encryption">
							<dt class="font-medium text-gray-700 dark:text-gray-300">E2E Encryption</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(alternative.end_to_end_encryption) }}</dd>
						</div>
						<div v-if="alternative.encryption_at_rest">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Encryption at Rest</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(alternative.encryption_at_rest) }}</dd>
						</div>
						<div v-if="alternative.is_open_source !== null">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Open Source</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ alternative.is_open_source ? 'Yes' : 'No' }}</dd>
						</div>
						<div v-if="alternative.supports_open_standards !== null">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Open Standards</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ alternative.supports_open_standards ? 'Yes' : 'No' }}</dd>
						</div>
						<div v-if="alternative.standards_protocols && alternative.standards_protocols.length > 0">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Protocols</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ alternative.standards_protocols.join(', ') }}</dd>
						</div>
					</dl>
				</div>

				<!-- Project Info -->
				<div v-if="alternative.license || alternative.governance_model || alternative.funding_model" class="border dark:border-gray-700 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Project Details</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="alternative.license">
							<dt class="font-medium text-gray-700 dark:text-gray-300">License</dt>
							<dd class="text-gray-600 dark:text-gray-400">{{ alternative.license }}</dd>
						</div>
						<div v-if="alternative.governance_model">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Governance</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(alternative.governance_model) }}</dd>
						</div>
						<div v-if="alternative.funding_model">
							<dt class="font-medium text-gray-700 dark:text-gray-300">Funding</dt>
							<dd class="text-gray-600 dark:text-gray-400 capitalize">{{ formatField(alternative.funding_model) }}</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
		</div>

		<!-- Change Log Tab Content -->
		<div v-show="activeTab === 'changelog'">
			<div v-if="changeLogs && changeLogs.length > 0" class="space-y-4">
				<div v-for="log in changeLogs" :key="log.id" class="border rounded-lg p-6 dark:border-gray-700">
					<div class="flex items-start justify-between mb-4">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<h3 class="text-lg font-bold">{{ log.title }}</h3>
								<span
									v-if="log.impact"
									:class="[
										'px-2 py-1 text-xs font-medium rounded-full capitalize',
										log.impact === 'positive' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
										log.impact === 'negative' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
										log.impact === 'neutral' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
									]"
								>
									{{ log.impact }}
								</span>
							</div>
							<p v-if="log.date" class="text-sm text-gray-500 dark:text-gray-400">
								{{ new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
							</p>
						</div>
					</div>
					<div v-if="log.description" class="prose dark:prose-invert max-w-none text-sm" v-html="log.description"></div>
					<a
						v-if="log.source_url"
						:href="log.source_url"
						target="_blank"
						class="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
					>
						Source
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
						</svg>
					</a>
				</div>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No change log entries available for this alternative.</p>
			</div>
		</div>

		<!-- Sources Tab Content -->
		<div v-show="activeTab === 'sources'">
			<div v-if="sources && sources.length > 0" class="space-y-4">
				<div v-for="source in sources" :key="source.id" class="border rounded-lg p-6 dark:border-gray-700">
					<div class="flex items-start justify-between mb-2">
						<h3 class="text-lg font-bold">{{ source.title }}</h3>
						<span
							v-if="source.type"
							class="px-2 py-1 text-xs font-medium rounded-full capitalize bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							{{ source.type }}
						</span>
					</div>
					<div class="space-y-2 text-sm">
						<p v-if="source.publisher" class="text-gray-600 dark:text-gray-400">
							<span class="font-medium">Publisher:</span> {{ source.publisher }}
						</p>
						<p v-if="source.date_published" class="text-gray-600 dark:text-gray-400">
							<span class="font-medium">Published:</span>
							{{ new Date(source.date_published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
						</p>
						<p v-if="source.quote" class="text-gray-700 dark:text-gray-300 italic border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3">
							"{{ source.quote }}"
						</p>
						<p v-if="source.notes" class="text-gray-600 dark:text-gray-400">
							{{ source.notes }}
						</p>
						<a
							v-if="source.url"
							:href="source.url"
							target="_blank"
							class="inline-flex items-center gap-1 text-primary hover:underline mt-2"
						>
							View Source
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
							</svg>
						</a>
					</div>
				</div>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No sources available for this alternative.</p>
			</div>
		</div>

		<!-- Alternatives Tab Content -->
		<div v-show="activeTab === 'alternatives'">
			<div v-if="alternatives && alternatives.length > 0" class="grid md:grid-cols-2 gap-6">
				<NuxtLink 
					v-for="alt in alternatives" 
					:key="alt.id" 
					:to="`/self-hosting/${alt.slug}`"
					class="border rounded-lg p-6 hover:shadow-lg transition-shadow dark:border-gray-700 hover:border-primary dark:hover:border-primary"
				>
					<div class="flex items-start gap-4 mb-4">
						<div v-if="alt.brand_logo_light" class="flex-shrink-0">
							<img 
								:src="`/api/proxy/assets/${alt.brand_logo_light}`" 
								:alt="alt.name" 
								class="w-16 h-16 rounded-lg object-contain" 
							/>
						</div>
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-2 mb-2">
								<h3 class="text-xl font-semibold">{{ alt.name }}</h3>
								<span v-if="alt.tier" :class="[
									'px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap flex-shrink-0',
									alt.tier === 'A_Sovereign' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
									alt.tier === 'B_Aligned' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
									alt.tier === 'C_Transitional' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
									alt.tier === 'D_Extractive' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								]">
									{{ getTierLabel(alt.tier) }}
								</span>
							</div>
							<div class="flex flex-wrap gap-2">
								<span
									v-if="alt.is_open_source"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
								>
									Open Source
								</span>
								<span
									v-if="alt.end_to_end_encryption === 'yes'"
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
								>
									E2E Encrypted
								</span>
							</div>
						</div>
					</div>
					<p class="text-gray-600 dark:text-gray-400 text-sm">{{ alt.short_description }}</p>
					<div v-if="alt.category" class="mt-4">
						<span class="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-800 capitalize">
							{{ formatField(alt.category) }}
						</span>
					</div>
				</NuxtLink>
			</div>
			<div v-else class="text-center py-12">
				<p class="text-gray-500 dark:text-gray-400">No alternative solutions found in the same category.</p>
			</div>
		</div>
	</BlockContainer>
</template>
