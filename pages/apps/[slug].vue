<script setup lang="ts">
import type { App } from '~/types';

const route = useRoute();
const slug = route.params.slug as string;

// Fetch app details with assessments and sources
const { data: app } = await useAsyncData(`app-${slug}`, () => {
	return useDirectus(
		readItems('apps', {
			fields: [
				'*',
				'categories.app_categories_id.id',
				'categories.app_categories_id.name',
				'categories.app_categories_id.slug',
				'assessments.id',
				'assessments.assessment_date',
				'assessments.verdict',
				'assessments.recommendation',
				'assessments.sources.sources_id.id',
				'assessments.sources.sources_id.title',
				'assessments.sources.sources_id.url',
				'assessments.sources.sources_id.publication_date',
				'assessments.sources.sources_id.author',
				'assessments.sources.sources_id.publisher',
				'assessments.sources.sources_id.source_type',
				'assessments.sources.sources_id.summary',
			],
			filter: {
				slug: { _eq: slug },
				status: { _eq: 'published' },
			},
			limit: 1,
		}),
	).then((items: any[]) => items[0] || null);
});

// Collect unique sources from all assessments
const allSources = computed(() => {
	if (!app.value?.assessments) return [];
	
	const sourceMap = new Map();
	app.value.assessments.forEach((assessment: any) => {
		if (assessment.sources) {
			assessment.sources.forEach((item: any) => {
				const source = item.sources_id;
				if (source && !sourceMap.has(source.id)) {
					sourceMap.set(source.id, source);
				}
			});
		}
	});
	
	return Array.from(sourceMap.values());
});

// Helper to format source type badge
const getSourceTypeBadge = (type: string) => {
	const badges: Record<string, { color: string; label: string }> = {
		official: { color: 'green', label: 'Official' },
		documentation: { color: 'blue', label: 'Documentation' },
		whitepaper: { color: 'purple', label: 'Whitepaper' },
		paper: { color: 'purple', label: 'Research Paper' },
		article: { color: 'gray', label: 'Article' },
		blog: { color: 'gray', label: 'Blog' },
		video: { color: 'red', label: 'Video' },
		social: { color: 'cyan', label: 'Social Media' },
		other: { color: 'gray', label: 'Other' },
	};
	return badges[type] || badges.other;
};

// Helper to format date
const formatDate = (dateString: string | null) => {
	if (!dateString) return null;
	try {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	} catch {
		return null;
	}
};

// If app not found, show 404
if (!app.value) {
	throw createError({
		statusCode: 404,
		statusMessage: 'App Not Found',
	});
}

// SEO
useHead({
	title: app.value.name,
	meta: [
		{
			name: 'description',
			content: app.value.short_description || app.value.long_description || '',
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

const getBadgeColor = (type: string, value: any) => {
	if (type === 'is_open_source' && value) return 'green';
	if (type === 'end_to_end_encryption' && value === 'yes') return 'blue';
	if (type === 'default_tracking' && value === 'none') return 'purple';
	if (type === 'self_hostable' && value) return 'orange';
	if (type === 'federated' && value) return 'pink';
	if (type === 'app_status') {
		if (value === 'active') return 'green';
		if (value === 'deprecated') return 'red';
		if (value === 'watch') return 'yellow';
	}
	return 'gray';
};
</script>

<template>
	<BlockContainer v-if="app">
		<!-- Header Section -->
		<div class="mb-8">
			<NuxtLink
				to="/services"
				class="inline-flex items-center text-sm text-primary hover:underline mb-4"
			>
				← Back to Apps
			</NuxtLink>
			
			<div class="flex items-start gap-6">
				<div v-if="app.icon" class="flex-shrink-0">
					<NuxtImg :src="app.icon" :alt="app.name" class="w-24 h-24 rounded-xl" />
				</div>
				<div class="flex-1">
					<h1 class="text-4xl font-bold mb-2">{{ app.name }}</h1>
					<p class="text-xl text-gray-600 dark:text-gray-400 mb-4">
						{{ app.short_description }}
					</p>
					
					<!-- Main Badges -->
					<div class="flex flex-wrap gap-2">
						<span
							v-if="app.is_open_source"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
						>
							Open Source
						</span>
						<span
							v-if="app.end_to_end_encryption === 'yes'"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							E2E Encrypted
						</span>
						<span
							v-if="app.default_tracking === 'none'"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
						>
							No Tracking
						</span>
						<span
							v-if="app.self_hostable"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
						>
							Self-Hostable
						</span>
						<span
							v-if="app.federated"
							class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
						>
							Federated
						</span>
						<span
							v-if="app.app_status"
							:class="[
								'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full capitalize',
								app.app_status === 'active' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
								app.app_status === 'deprecated' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
								app.app_status === 'watch' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
								app.app_status === 'unknown' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
							]"
						>
							{{ app.app_status }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-3 mb-8 pb-8 border-b dark:border-gray-700">
			<UButton
				v-if="app.website_url"
				:to="app.website_url"
				target="_blank"
				color="primary"
				size="lg"
				icon="i-mdi-open-in-new"
			>
				Visit Website
			</UButton>
			<UButton
				v-if="app.repo_url"
				:to="app.repo_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-github"
			>
				Source Code
			</UButton>
			<UButton
				v-if="app.docs_url"
				:to="app.docs_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-book-open"
			>
				Documentation
			</UButton>
			<UButton
				v-if="app.privacy_policy_url"
				:to="app.privacy_policy_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-shield-check"
			>
				Privacy Policy
			</UButton>
			<UButton
				v-if="app.terms_url"
				:to="app.terms_url"
				target="_blank"
				color="gray"
				variant="outline"
				size="lg"
				icon="i-mdi-file-document"
			>
				Terms of Service
			</UButton>
		</div>

		<!-- Main Content Grid -->
		<div class="grid md:grid-cols-3 gap-8">
			<!-- Left Column: Description & Categories -->
			<div class="md:col-span-2 space-y-6">
				<!-- Long Description -->
				<div v-if="app.long_description" class="prose dark:prose-invert max-w-none">
					<h2 class="text-2xl font-bold mb-4">About</h2>
					<div v-html="app.long_description"></div>
				</div>

				<!-- Categories -->
				<div v-if="app.categories && app.categories.length > 0">
					<h2 class="text-2xl font-bold mb-4">Categories</h2>
					<div class="flex flex-wrap gap-2">
						<NuxtLink
							v-for="cat in app.categories"
							:key="cat.id"
							:to="`/services?category=${cat.app_categories_id.slug}`"
							class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
						>
							{{ cat.app_categories_id.name }}
						</NuxtLink>
					</div>
				</div>

				<!-- Sources -->
				<div v-if="allSources.length > 0">
					<h2 class="text-2xl font-bold mb-4">Sources & References</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
						Information about this app is based on the following sources:
					</p>
					<div class="space-y-4">
						<div
							v-for="source in allSources"
							:key="source.id"
							class="border rounded-lg p-4 dark:border-gray-700 hover:shadow-md transition-shadow"
						>
							<div class="flex items-start gap-3">
								<!-- Icon based on source type -->
								<div class="flex-shrink-0 mt-1">
									<svg
										v-if="source.source_type === 'official' || source.source_type === 'documentation'"
										class="w-5 h-5 text-green-600 dark:text-green-400"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
									</svg>
									<svg
										v-else
										class="w-5 h-5 text-gray-400"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fill-rule="evenodd"
											d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>

								<div class="flex-1 min-w-0">
									<!-- Source title and type -->
									<div class="flex items-start justify-between gap-2 mb-2">
										<h3 class="font-semibold text-gray-900 dark:text-gray-100">
											<a
												v-if="source.url"
												:href="source.url"
												target="_blank"
												rel="noopener noreferrer"
												class="hover:text-primary transition-colors"
											>
												{{ source.title }}
												<svg
													class="inline w-4 h-4 ml-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
													/>
												</svg>
											</a>
											<span v-else>{{ source.title }}</span>
										</h3>
										<span
											v-if="source.source_type"
											:class="[
												'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize flex-shrink-0',
												getSourceTypeBadge(source.source_type).color === 'green' &&
													'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
												getSourceTypeBadge(source.source_type).color === 'blue' &&
													'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
												getSourceTypeBadge(source.source_type).color === 'purple' &&
													'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
												getSourceTypeBadge(source.source_type).color === 'gray' &&
													'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
											]"
										>
											{{ getSourceTypeBadge(source.source_type).label }}
										</span>
									</div>

									<!-- Source metadata -->
									<div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
										<div v-if="source.author || source.publisher" class="flex flex-wrap gap-2">
											<span v-if="source.author">By {{ source.author }}</span>
											<span v-if="source.author && source.publisher">•</span>
											<span v-if="source.publisher">{{ source.publisher }}</span>
										</div>
										<div v-if="source.publication_date">
											Published: {{ formatDate(source.publication_date) }}
										</div>
									</div>

									<!-- Source summary -->
									<p v-if="source.summary" class="mt-2 text-sm text-gray-700 dark:text-gray-300">
										{{ source.summary }}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Technical Details -->
			<div class="space-y-6">
				<!-- Privacy & Security -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Privacy & Security</h3>
					<dl class="space-y-3 text-sm">
						<div>
							<dt class="text-gray-500 dark:text-gray-400">End-to-End Encryption</dt>
							<dd class="font-medium capitalize">{{ formatField(app.end_to_end_encryption) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Default Tracking</dt>
							<dd class="font-medium capitalize">{{ formatField(app.default_tracking) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Data Portability</dt>
							<dd class="font-medium capitalize">{{ formatField(app.data_portability) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Technical Info -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Technical Information</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="app.license_type">
							<dt class="text-gray-500 dark:text-gray-400">License</dt>
							<dd class="font-medium">{{ app.license_type }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Open Source</dt>
							<dd class="font-medium">{{ formatField(app.is_open_source) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Self-Hostable</dt>
							<dd class="font-medium">{{ formatField(app.self_hostable) }}</dd>
						</div>
						<div>
							<dt class="text-gray-500 dark:text-gray-400">Federated</dt>
							<dd class="font-medium">{{ formatField(app.federated) }}</dd>
						</div>
					</dl>
				</div>

				<!-- Organization Info -->
				<div class="border rounded-lg p-6 dark:border-gray-700">
					<h3 class="text-lg font-semibold mb-4">Organization</h3>
					<dl class="space-y-3 text-sm">
						<div v-if="app.vendor">
							<dt class="text-gray-500 dark:text-gray-400">Vendor</dt>
							<dd class="font-medium">{{ app.vendor }}</dd>
						</div>
						<div v-if="app.governance_model">
							<dt class="text-gray-500 dark:text-gray-400">Governance Model</dt>
							<dd class="font-medium capitalize">{{ formatField(app.governance_model) }}</dd>
						</div>
						<div v-if="app.primary_business_model">
							<dt class="text-gray-500 dark:text-gray-400">Business Model</dt>
							<dd class="font-medium capitalize">{{ formatField(app.primary_business_model) }}</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>
