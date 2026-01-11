<script setup lang="ts">
const { theme, globals } = useAppConfig();
const searchModal = ref<any>(null);
const colorMode = useColorMode();

const openSearch = () => {
	if (searchModal.value) {
		searchModal.value.open();
	}
};

const toggleTheme = () => {
	colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

const {
	data: navigation,
	pending,
	error,
} = await useAsyncData(
	'mainNavigation',
	() => {
		return useDirectus(
			readItem('navigation', 'main', {
				fields: [
					{
						items: [
							'id',
							'has_children',
							'title',
							'icon',
							'label',
							'type',
							'url',
							{
								page: ['permalink', 'title'],
								children: [
									'id',
									'title',
									'has_children',
									'icon',
									'label',
									'type',
									'url',
									{
										page: ['permalink', 'title'],
									},
								],
							},
						],
					},
				],
			}),
		);
	},
	{
		transform: (data) => data,
	},
);
</script>
<template>
	<header class="sticky top-0 z-50 w-full py-4">
		<div class="max-w-6xl mx-auto px-6 lg:px-16 flex items-center gap-4">
			<!-- Dark rounded container for logo, nav, and theme toggle -->
			<div class="flex-1 bg-slate-900 dark:bg-slate-900 rounded-lg px-6 py-3 flex items-center justify-between">
				<!-- Logo -->
				<NuxtLink href="/" class="flex items-center gap-2">
					<Logo v-if="globals?.logo_on_dark_bg" class="h-6" />
					<div v-else class="px-2 py-1 bg-sky-600 rounded text-white text-sm font-bold font-display">
						<span v-if="globals?.title">{{ globals.title.split(' ')[0] }}</span>
						<span v-if="globals?.title" class="text-sky-300">{{ globals.title.split(' ')[1] || 'OS' }}</span>
					</div>
				</NuxtLink>

				<!-- Center Navigation -->
				<nav class="hidden lg:flex items-center gap-8 font-display" aria-label="Global">
					<NavigationMenuItem v-for="item in navigation?.items" :key="item.id" :item="item" />
				</nav>

				<!-- Theme Toggle -->
				<button 
					@click="toggleTheme"
					class="p-2 text-white hover:text-sky-400 transition-colors"
					aria-label="Toggle theme"
				>
					<Icon v-if="colorMode.value === 'dark'" name="heroicons:sun-20-solid" class="size-5" />
					<Icon v-else name="heroicons:moon-20-solid" class="size-5" />
				</button>
			</div>

			<!-- Buttons outside the dark container -->
			<button 
				class="hidden md:flex px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-display font-semibold text-sm transition-colors"
				@click="$router.push('/privacy-pack')"
			>
				Let's Talk
			</button>

			<a 
				href="https://directus.thecloud.sucks"
				target="_blank"
				class="hidden md:flex px-6 py-2.5 text-sky-400 hover:text-white font-display font-semibold text-sm transition-colors"
			>
				Login
			</a>
		</div>
		<NavigationMobileMenu v-if="navigation" :navigation="navigation" />
		<NavigationSiteSearch ref="searchModal" />
	</header>
</template>
