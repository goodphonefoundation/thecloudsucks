<script setup lang="ts">
definePageMeta({
	layout: 'default',
});

useHead({
	title: 'Create Your PrivacyPack',
});

interface Service {
	id: string;
	name: string;
	slug: string;
	brand_symbol_light?: string;
	brand_symbol_dark?: string;
	assessment_tier?: string;
	default_tracking?: string;
	categories: Array<{ service_categories_id: { id: string; name: string } }>;
}

interface ServiceSwitch {
	category: string;
	categoryId: string;
	mainstream: {
		id: string;
		name: string;
		logo?: string;
	} | null;
	privacyFocused: {
		id: string;
		name: string;
		logo?: string;
	} | null;
}

// Fetch all services
const { data: servicesData } = await useAsyncData('privacy-pack-services', () => {
	return useDirectus(
		readItems('services', {
			fields: [
				'id',
				'name',
				'slug',
				'brand_symbol_light',
				'brand_symbol_dark',
				'assessment_tier',
				'default_tracking',
				'categories.service_categories_id.id',
				'categories.service_categories_id.name',
			],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});

// Fetch categories
const { data: categories } = await useAsyncData('privacy-pack-categories', () => {
	return useDirectus(
		readItems('service_categories', {
			fields: ['id', 'name', 'slug'],
			filter: {
				status: { _eq: 'published' },
			},
			sort: ['name'],
		}),
	);
});

// Group services by category and split mainstream vs privacy-focused
const servicesByCategory = computed(() => {
	if (!servicesData.value || !categories.value) return {};

	const grouped: Record<
		string,
		{
			name: string;
			mainstream: Service[];
			privacyFocused: Service[];
		}
	> = {};

	categories.value.forEach((cat) => {
		grouped[cat.id] = {
			name: cat.name,
			mainstream: [],
			privacyFocused: [],
		};
	});

	servicesData.value.forEach((service: Service) => {
		const isMainstream =
			service.assessment_tier === 'D_Extractive' ||
			service.assessment_tier === 'C_Transitional' ||
			service.default_tracking === 'high' ||
			service.default_tracking === 'moderate';

		const isPrivacyFocused =
			service.assessment_tier === 'A_Sovereign' ||
			service.assessment_tier === 'B_Aligned' ||
			service.default_tracking === 'none' ||
			service.default_tracking === 'low';

		service.categories?.forEach((cat) => {
			const categoryId = cat.service_categories_id?.id;
			if (categoryId && grouped[categoryId]) {
				if (isMainstream) {
					grouped[categoryId].mainstream.push(service);
				} else if (isPrivacyFocused) {
					grouped[categoryId].privacyFocused.push(service);
				} else {
					// If unclear, add to both
					grouped[categoryId].mainstream.push(service);
					grouped[categoryId].privacyFocused.push(service);
				}
			}
		});
	});

	return grouped;
});

// User's selected switches
const switches = ref<ServiceSwitch[]>([]);
const currentStep = ref<'select-category' | 'build-card'>('select-category');
const selectedCategoryForAdd = ref<string | null>(null);

// Add a category row
const addCategory = (categoryId: string) => {
	const categoryData = servicesByCategory.value[categoryId];
	if (!categoryData) return;

	switches.value.push({
		category: categoryData.name,
		categoryId: categoryId,
		mainstream: null,
		privacyFocused: null,
	});

	selectedCategoryForAdd.value = null;
};

// Remove a switch
const removeSwitch = (index: number) => {
	switches.value.splice(index, 1);
};

// Select service for a switch
const selectService = (switchIndex: number, type: 'mainstream' | 'privacyFocused', service: Service) => {
	const switchItem = switches.value[switchIndex];
	switchItem[type] = {
		id: service.id,
		name: service.name,
		logo: service.brand_symbol_dark || service.brand_symbol_light || '',
	};
};

// Check if card is complete
const isCardComplete = computed(() => {
	return switches.value.length > 0 && switches.value.every((s) => s.mainstream && s.privacyFocused);
});

// Generate shareable URL
const generateShareUrl = () => {
	const encoded = switches.value
		.map((s) => {
			return `${s.categoryId}:${s.mainstream?.id}>${s.privacyFocused?.id}`;
		})
		.join(',');

	return `${window.location.origin}/privacy-pack/view?c=${encodeURIComponent(encoded)}`;
};

// Download as image (placeholder - requires html2canvas)
const downloadAsImage = () => {
	alert('Image download feature coming soon! For now, take a screenshot of your card.');
};

// Copy share link
const copyShareLink = async () => {
	const url = generateShareUrl();
	try {
		await navigator.clipboard.writeText(url);
		alert('Link copied to clipboard!');
	} catch (err) {
		alert('Failed to copy link. Please copy manually: ' + url);
	}
};
</script>

<template>
	<div class="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
		<BlockContainer>
			<!-- Header -->
			<div class="text-center mb-12">
				<NuxtLink to="/privacy-pack" class="inline-flex items-center gap-2 text-green-400 hover:text-green-300 mb-4">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Back to PrivacyPack
				</NuxtLink>
				<h1 class="text-4xl font-bold text-green-400 mb-2 font-mono">Create Your PrivacyPack</h1>
				<p class="text-gray-400">Select the services you've switched from and to</p>
			</div>

			<div class="grid lg:grid-cols-2 gap-8">
				<!-- Builder Section -->
				<div>
					<div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
						<h2 class="text-2xl font-bold mb-6 text-gray-200">Build Your Card</h2>

						<!-- Switches List -->
						<div class="space-y-6 mb-6">
							<div v-for="(switchItem, index) in switches" :key="index" class="bg-gray-900 rounded-lg p-4 border border-gray-600">
								<div class="flex items-center justify-between mb-4">
									<h3 class="font-semibold text-green-400">{{ switchItem.category }}</h3>
									<button @click="removeSwitch(index)" class="text-red-400 hover:text-red-300 text-sm">
										Remove
									</button>
								</div>

								<!-- Mainstream Selection -->
								<div class="mb-3">
									<label class="text-sm text-gray-400 mb-2 block">From (Mainstream)</label>
									<select
										v-model="switchItem.mainstream"
										@change="
											(e) => {
												const service = servicesByCategory[switchItem.categoryId]?.mainstream.find(
													(s) => s.id === (e.target as HTMLSelectElement).value,
												);
												if (service) selectService(index, 'mainstream', service);
											}
										"
										class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
									>
										<option :value="null">Select a service...</option>
										<option
											v-for="service in servicesByCategory[switchItem.categoryId]?.mainstream"
											:key="service.id"
											:value="service.id"
										>
											{{ service.name }}
										</option>
									</select>
								</div>

								<!-- Privacy-Focused Selection -->
								<div>
									<label class="text-sm text-gray-400 mb-2 block">To (Privacy-Focused)</label>
									<select
										v-model="switchItem.privacyFocused"
										@change="
											(e) => {
												const service = servicesByCategory[switchItem.categoryId]?.privacyFocused.find(
													(s) => s.id === (e.target as HTMLSelectElement).value,
												);
												if (service) selectService(index, 'privacyFocused', service);
											}
										"
										class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
									>
										<option :value="null">Select a service...</option>
										<option
											v-for="service in servicesByCategory[switchItem.categoryId]?.privacyFocused"
											:key="service.id"
											:value="service.id"
										>
											{{ service.name }}
										</option>
									</select>
								</div>
							</div>
						</div>

						<!-- Add Category -->
						<div class="mb-6">
							<label class="text-sm text-gray-400 mb-2 block">Add Another Category</label>
							<select
								v-model="selectedCategoryForAdd"
								@change="
									() => {
										if (selectedCategoryForAdd) addCategory(selectedCategoryForAdd);
									}
								"
								class="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
							>
								<option :value="null">Choose a category...</option>
								<option
									v-for="category in categories"
									:key="category.id"
									:value="category.id"
									:disabled="switches.some((s) => s.categoryId === category.id)"
								>
									{{ category.name }}
								</option>
							</select>
						</div>

						<!-- Actions -->
						<div class="flex gap-3">
							<button
								@click="copyShareLink"
								:disabled="!isCardComplete"
								class="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
							>
								Copy Share Link
							</button>
							<button
								@click="downloadAsImage"
								:disabled="!isCardComplete"
								class="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
							>
								Download Image
							</button>
						</div>
					</div>
				</div>

				<!-- Preview Section -->
				<div>
					<div class="sticky top-4">
						<h2 class="text-2xl font-bold mb-6 text-gray-200">Live Preview</h2>
						<div v-if="switches.length > 0">
							<PrivacyCard :switches="switches" :show-branding="true" />
						</div>
						<div v-else class="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
							<svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
							<p class="text-gray-400">Add categories to start building your card</p>
						</div>
					</div>
				</div>
			</div>
		</BlockContainer>
	</div>
</template>
