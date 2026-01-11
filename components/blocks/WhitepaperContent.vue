<script setup lang="ts">
import type { BlockWhitepaperContent } from '~/types';

const props = defineProps<{
	data: BlockWhitepaperContent | null;
	blockId: string;
	collection: string;
}>();

// Fetch all block_whitepaper_content to find the one linked to this page block
// Since we can't get the item ID from the M2A relation, we query by the page block reference
const { data: blockData } = useAsyncData(
	`whitepaper-block-${props.blockId}`,
	() => {
		return useDirectus(
			readItems('block_whitepaper_content', {
				fields: ['*'],
			}),
		).then((items: any[]) => {
			// For now, just return the first one since we only have one whitepaper block
			// In a real app, you'd need a way to match the block ID to the content
			return items[0] || null;
		});
	},
);

// Then fetch the whitepaper using the whitepaper_id
const { data: whitepaper } = useAsyncData(
	`whitepaper-hardcoded`,
	() => {
		// Hardcoded for testing
		const whitepaperID = '749b18d7-6604-4cc0-a3fa-1a7042748a94';
		return useDirectus(
			readItems('whitepapers', {
				filter: {
					id: { _eq: whitepaperID },
				},
				limit: 1,
				fields: [
					'*',
					{ chapters: ['*'], citations: ['*'] },
				],
			}),
		).then((items: any[]) => items[0] || null);
	},
);
</script>

<template>
	<BlockContainer v-if="whitepaper" class="tech-document">
		<!-- Header -->
		<div class="mb-8 border-b border-tech-border pb-6">
			<h1 class="space-grotesk-text mb-2 text-4xl font-bold uppercase tracking-tight text-white md:text-5xl">
				{{ whitepaper.title }}
			</h1>
			<p v-if="whitepaper.subtitle" class="text-tech-primary text-xl font-medium">
				{{ whitepaper.subtitle }}
			</p>
			<div v-if="whitepaper.author" class="text-tech-muted jetbrains-text mt-4 text-sm">
				Author: {{ whitepaper.author }}
			</div>
		</div>

		<!-- Summary -->
		<div v-if="whitepaper.summary" class="research-callout mb-8 p-6" v-html="whitepaper.summary" />

		<!-- Chapters -->
		<div v-if="whitepaper.chapters && whitepaper.chapters.length" class="space-y-12">
			<div
				v-for="chapter in whitepaper.chapters"
				:key="chapter.id"
				class="chapter-section"
			>
				<div class="mb-4 flex items-baseline gap-4">
					<span class="text-tech-primary jetbrains-text text-sm font-bold">
						{{ String(chapter.chapter_number).padStart(2, '0') }}
					</span>
					<h2 class="space-grotesk-text text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">
						{{ chapter.title }}
					</h2>
				</div>
				<div class="prose prose-invert max-w-none" v-html="chapter.content" />
			</div>
		</div>

		<!-- Citations -->
		<div v-if="whitepaper.citations && whitepaper.citations.length" class="mt-16 border-t border-tech-border pt-8">
			<h2 class="space-grotesk-text mb-6 text-2xl font-bold uppercase tracking-tight text-white">
				References
			</h2>
			<div class="space-y-4">
				<div
					v-for="citation in whitepaper.citations"
					:key="citation.id"
					class="flex gap-4"
				>
					<span class="text-tech-primary jetbrains-text shrink-0 text-sm font-bold">
						[{{ citation.citation_key }}]
					</span>
					<div class="text-tech-muted">
						<div class="font-medium text-white">{{ citation.title }}</div>
						<a
							v-if="citation.url"
							:href="citation.url"
							target="_blank"
							rel="noopener"
							class="text-tech-primary hover:underline"
						>
							{{ citation.url }}
						</a>
						<p v-if="citation.description" class="mt-1 text-sm">
							{{ citation.description }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</BlockContainer>
</template>

<style scoped>
.chapter-section {
	scroll-margin-top: 2rem;
}

.prose :deep(h3) {
	@apply mb-3 mt-6 text-xl font-bold uppercase;
	font-family: 'Space Grotesk', sans-serif;
	color: var(--color-tech-primary);
}

.prose :deep(p) {
	@apply mb-4 leading-relaxed;
	color: var(--color-tech-muted);
}

.prose :deep(ul),
.prose :deep(ol) {
	@apply ml-6 space-y-2;
	color: var(--color-tech-muted);
}

.prose :deep(li) {
	@apply leading-relaxed;
}

.prose :deep(strong) {
	@apply font-semibold;
	color: white;
}

.prose :deep(code) {
	@apply rounded px-2 py-1 text-sm;
	font-family: 'JetBrains Mono', monospace;
	background-color: var(--color-tech-surface);
	border-color: var(--color-tech-border);
}

.prose :deep(blockquote) {
	@apply border-l-4 pl-6 italic;
	border-color: var(--color-tech-primary);
	color: white;
}

.prose :deep(a) {
	@apply hover:underline;
	color: var(--color-tech-primary);
}
</style>
