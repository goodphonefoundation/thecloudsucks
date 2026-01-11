<script setup lang="ts">
definePageMeta({
	layout: 'default',
});

useHead({
	title: 'PrivacyPack - Share Your Privacy Wins',
});

// Example card
const exampleSwitches = [
	{
		category: 'Email',
		mainstream: { id: '1', name: 'Gmail', logo: '' },
		privacyFocused: { id: '2', name: 'Proton Mail', logo: '' },
	},
	{
		category: 'Browser',
		mainstream: { id: '3', name: 'Chrome', logo: '' },
		privacyFocused: { id: '4', name: 'Firefox', logo: '' },
	},
	{
		category: 'Messaging',
		mainstream: { id: '5', name: 'WhatsApp', logo: '' },
		privacyFocused: { id: '6', name: 'Signal', logo: '' },
	},
];
</script>

<template>
	<div class="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
		<BlockContainer>
			<!-- Hero Section -->
			<div class="text-center py-20">
				<div class="flex items-center justify-center gap-4 mb-6">
					<div class="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
						<svg class="w-10 h-10 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<h1 class="text-5xl font-bold text-green-400 font-mono">PrivacyPack</h1>
				</div>
				<p class="text-2xl text-gray-300 mb-4">Your privacy wins, in one card</p>
				<p class="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
					Show which mainstream apps you've switched from and which privacy-respecting tools you've adopted.
					Share your privacy journey with the world.
				</p>
				<NuxtLink
					to="/privacy-pack/create"
					class="inline-block px-8 py-4 bg-green-500 hover:bg-green-600 text-gray-900 font-bold rounded-lg text-lg transition-colors"
				>
					Create Your Pack
				</NuxtLink>
			</div>

			<!-- Example Card -->
			<div class="py-16">
				<h2 class="text-3xl font-bold text-center mb-12 text-gray-200">Here's what your card looks like</h2>
				<PrivacyCard :switches="exampleSwitches" :show-branding="true" />
			</div>

			<!-- Features -->
			<div class="py-16 grid md:grid-cols-3 gap-8">
				<div class="text-center">
					<div class="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
						<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2 text-gray-200">Quick & Easy</h3>
					<p class="text-gray-400">Pick your old and new apps in minutes</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
						<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2 text-gray-200">Download & Share</h3>
					<p class="text-gray-400">Save as image or get a shareable link</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
						<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2 text-gray-200">Inspire Others</h3>
					<p class="text-gray-400">Help others start their privacy journey</p>
				</div>
			</div>

			<!-- CTA -->
			<div class="text-center py-16">
				<h2 class="text-3xl font-bold mb-6 text-gray-200">Ready to share your privacy wins?</h2>
				<NuxtLink
					to="/privacy-pack/create"
					class="inline-block px-8 py-4 bg-green-500 hover:bg-green-600 text-gray-900 font-bold rounded-lg text-lg transition-colors"
				>
					Create Your Pack Now
				</NuxtLink>
			</div>
		</BlockContainer>
	</div>
</template>
