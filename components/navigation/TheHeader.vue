<script setup lang="ts">
const { theme, globals } = useAppConfig();
const searchModal = ref<any>(null);

const openSearch = () => {
	if (searchModal.value) {
		searchModal.value.open();
	}
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
	<header class="sticky top-0 z-50 w-full border-b border-solid border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-6 md:px-10 py-3">
		<div class="max-w-screen-xl mx-auto flex items-center justify-between">
			<!-- Logo Section -->
			<div class="flex items-center gap-8">
				<NuxtLink href="/" class="flex items-center gap-3 text-[#0d7ff2]">
					<div class="size-8 bg-[#0d7ff2] flex items-center justify-center rounded-sm">
						<Icon name="heroicons:command-line-20-solid" class="text-white size-5" />
					</div>
					<h2 v-if="globals?.title" class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight uppercase font-display">
						{{ globals.title }}
					</h2>
				</NuxtLink>
				<nav class="hidden lg:flex items-center gap-8 font-display" aria-label="Global">
					<NavigationMenuItem v-for="item in navigation?.items" :key="item.id" :item="item" />
				</nav>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-6">
				<label class="hidden md:flex flex-col min-w-48 !h-10">
					<div class="flex w-full flex-1 items-stretch rounded h-full">
						<div class="text-slate-400 dark:text-gray-400 flex border-none bg-white dark:bg-gray-800 items-center justify-center pl-4 rounded-l border-y border-l border-slate-200 dark:border-gray-700">
							<Icon name="heroicons:magnifying-glass" class="size-5" />
						</div>
						<input 
							class="form-input flex w-full min-w-0 flex-1 border-none bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0d7ff2] h-full placeholder:text-slate-400 dark:placeholder:text-gray-400 px-4 rounded-r text-sm font-normal border-y border-r border-slate-200 dark:border-gray-700" 
							placeholder="Search..."
							@click="openSearch"
							readonly
						/>
					</div>
				</label>
				<button 
					class="flex min-w-[120px] cursor-pointer items-center justify-center rounded h-10 px-4 bg-red-500 text-white text-sm font-bold leading-normal uppercase tracking-widest hover:bg-red-600 transition-all font-display"
					@click="$router.push('/privacy-pack')"
				>
					<span class="truncate">Switch Now</span>
				</button>
			</div>
		</div>
		<NavigationMobileMenu v-if="navigation" :navigation="navigation" />
		<NavigationSiteSearch ref="searchModal" />
	</header>
</template>
