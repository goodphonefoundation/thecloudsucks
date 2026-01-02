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
	</BlockContainer>
</template>
