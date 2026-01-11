<script setup lang="ts">
interface BlockPrivacyPackBuilder {
	id: string;
	headline?: string;
	content?: string;
	cta_text?: string;
	cta_url?: string;
}

const props = defineProps<{
	data: BlockPrivacyPackBuilder | null;
}>();

// Default values
const ctaText = computed(() => props.data?.cta_text || 'Create Your Pack');
const ctaUrl = computed(() => props.data?.cta_url || '/privacy-pack/create');

// Example switches for preview
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
	<BlockContainer>
		<div class="text-center mb-12">
			<TypographyHeadline v-if="data?.headline" :content="data.headline" size="lg" />
			<TypographyProse v-if="data?.content" :content="data.content" class="mt-4 max-w-3xl mx-auto" />
		</div>

		<!-- Example Card Preview -->
		<div class="mb-12">
			<PrivacyCard :switches="exampleSwitches" :show-branding="true" />
		</div>

		<!-- CTA Button -->
		<div class="text-center">
			<NuxtLink
				:to="ctaUrl"
				class="inline-block px-8 py-4 bg-green-500 hover:bg-green-600 text-gray-900 font-bold rounded-lg text-lg transition-colors"
			>
				{{ ctaText }}
			</NuxtLink>
		</div>
	</BlockContainer>
</template>
