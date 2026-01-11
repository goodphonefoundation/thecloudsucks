<script setup lang="ts">
import type { Page, OsProposal, PageBlock, BlockType } from '~/types';

const componentMap: Record<BlockType, any> = {
	block_services_showcase: resolveComponent('BlocksServicesShowcase'),
	block_hardware_showcase: resolveComponent('BlocksHardwareShowcase'),
	block_os_showcase: resolveComponent('BlocksOsShowcase'),
	block_latest_services: resolveComponent('BlocksLatestServices'),
	block_mobile_apps_showcase: resolveComponent('BlocksMobileAppsShowcase'),
	block_selfhosted_showcase: resolveComponent('BlocksSelfhostedShowcase'),
	block_hero: resolveComponent('BlocksHero'),
	block_faqs: resolveComponent('BlocksFaqs'),
	block_richtext: resolveComponent('BlocksRichText'),
	block_testimonials: resolveComponent('BlocksTestimonials'),
	block_quote: resolveComponent('BlocksQuote'),
	block_cta: resolveComponent('BlocksCta'),
	block_form: resolveComponent('BlocksForm'),
	block_logocloud: resolveComponent('BlocksLogoCloud'),
	block_team: resolveComponent('BlocksTeam'),
	block_html: resolveComponent('BlocksRawHtml'),
	block_video: resolveComponent('BlocksVideo'),
	block_gallery: resolveComponent('BlocksGallery'),
	block_steps: resolveComponent('BlocksSteps'),
	block_columns: resolveComponent('BlocksColumns'),
	block_divider: resolveComponent('BlocksDivider'),
	block_whitepaper_content: resolveComponent('BlocksWhitepaperContent'),
	block_privacy_pack_builder: resolveComponent('BlocksPrivacyPackBuilder'),
};

const props = defineProps<{
	page: Page | OsProposal;
}>();

const blocks = computed(() => {
	const blocks = unref(props.page as Page)?.blocks as PageBlock[];
	return blocks?.filter((block) => {
		return block.hide_block !== true;
	});
});
</script>
<template>
	<div id="content" class="mx-auto">
		<template v-for="block in blocks" :key="block.id">
			<component 
				:is="componentMap[block.collection]" 
				v-if="block && block.collection" 
				:data="block.item" 
				:block-id="block.id"
				:collection="block.collection" 
			/>
		</template>
		<!-- Discourse Community Posts -->
		<BlocksDiscoursePosts v-if="page.permalink === '/'" />
	</div>
</template>
