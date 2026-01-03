<script setup lang="ts">
import type { BlockCarriersShowcase } from '~/types';

const showcaseData: BlockCarriersShowcase = {
	headline: 'Mobile Carriers',
	content: 'Privacy-focused assessments of mobile carriers and MVNOs. Filter by MVNO status, eSIM support, 5G availability, anonymous prepaid options, and contract requirements.',
	display_style: 'grid',
};

useHead({
	title: 'Mobile Carriers',
	meta: [
		{
			name: 'description',
			content: 'Privacy-focused mobile carrier assessments and alternatives',
		},
	],
});
</script>

<template>
	<BlocksCarriersShowcase :data="showcaseData" />
</template>
