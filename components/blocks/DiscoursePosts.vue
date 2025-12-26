<script setup lang="ts">
import { useDebounceFn } from '@vueuse/shared';

interface DiscoursePost {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	created_at: string;
	views: number;
	reply_count: number;
	like_count: number;
	url: string;
	image_url: string | null;
}

interface BlockDiscoursePosts {
	title?: string;
	headline?: string;
}

const props = defineProps<{
	data?: BlockDiscoursePosts;
}>();

// Fetch Discourse posts from dedicated collection
const { data: postsData } = await useAsyncData(
	'discourse-posts',
	() => {
		return useDirectus(
			readItems('discourse_posts', {
				fields: ['id', 'discourse_id', 'title', 'slug', 'excerpt', 'url', 'created_at', 'views', 'reply_count', 'like_count', 'image_url'],
				filter: {
					status: {
						_eq: 'published',
					},
				},
				sort: ['-created_at'],
				limit: 10,
			}),
		);
	},
	{
		transform: (data) => data || [],
	},
);

const posts = computed(() => {
	const discoursePosts = unref(postsData);
	if (!discoursePosts || !Array.isArray(discoursePosts)) return [];
	return discoursePosts as DiscoursePost[];
});

const postContainer: Ref<HTMLElement | null> = ref(null);
const postRefs: Ref<(HTMLElement | null)[]> = ref([]);
const currentItemIdx = ref(0);

function handleScroll(e: Event) {
	const target = e.target as HTMLElement;

	if (!postContainer.value || !postRefs.value) return;

	const postWidth = postRefs.value[0]?.offsetWidth || 0;
	const postCenter = postWidth / 2;
	const scrollLeft = target.scrollLeft;
	const scrollCenter = scrollLeft + postCenter;
	const closestPost = Math.round(scrollCenter / postWidth);

	if (scrollLeft === 0) {
		currentItemIdx.value = 0;
	} else if (scrollLeft + target.offsetWidth + 1 >= target.scrollWidth) {
		currentItemIdx.value = postRefs.value.length - 1;
	} else {
		currentItemIdx.value = closestPost;
	}
}

const debouncedScroll = useDebounceFn(handleScroll, 150);

function handleScrollDebounced(e: Event) {
	debouncedScroll(e);
}

function handleIndicatorButton(index: number) {
	if (!postContainer.value || !postRefs.value) return;

	const scrollLeft = postContainer?.value?.scrollLeft;
	const offsetLeft = postRefs?.value[index]?.offsetLeft;

	if (typeof scrollLeft !== 'undefined' && typeof offsetLeft !== 'undefined') {
		postContainer.value.scrollLeft = offsetLeft - 16;
	}
}

function handleNavButton(direction: 'left' | 'right') {
	if (!postContainer.value || !postRefs.value) return;

	const scrollLeft = postContainer?.value?.scrollLeft;
	const offsetWidth = postRefs?.value[currentItemIdx?.value]?.offsetWidth;

	if (typeof scrollLeft !== 'undefined' && typeof offsetWidth !== 'undefined') {
		if (direction === 'left') {
			postContainer.value.scrollLeft -= offsetWidth;
		} else {
			postContainer.value.scrollLeft += offsetWidth;
		}
	}
}

function formatDate(dateString: string) {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}
</script>
<template>
	<BlockContainer class="relative overflow-hidden" full-width>
		<div
			class="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-primary/10 dark:from-gray-800 dark:via-gray-900 dark:to-primary/20"
		/>
		<div class="absolute inset-0 opacity-30 grain-bg dark:opacity-10" />

		<div class="relative text-center">
			<TypographyTitle v-if="data?.title">{{ data.title }}</TypographyTitle>
			<TypographyTitle v-else>Latest Community Discussions</TypographyTitle>
			<TypographyHeadline v-if="data?.headline" :content="data.headline" size="lg" />
			<TypographyHeadline v-else content="Join the conversation on our community forum" size="lg" />
		</div>

		<div v-if="posts.length > 0" class="relative mt-4">
			<div class="flex items-center justify-end px-6 space-x-8 lg:px-16">
				<div class="inline-flex space-x-2">
					<button
						v-for="(post, itemIdx) in posts"
						:key="post.id"
						:class="[
							{
								'bg-primary': itemIdx === currentItemIdx,
								'bg-gray-500 bg-opacity-50 dark:bg-gray-700': itemIdx !== currentItemIdx,
							},
						]"
						class="flex items-center justify-center w-12 h-3 rounded-button hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
						@click="handleIndicatorButton(itemIdx)"
					/>
				</div>
				<div class="flex gap-2 justify-self-end">
					<UButton
						:disabled="currentItemIdx === 0"
						icon="material-symbols:arrow-back-rounded"
						size="lg"
						square
						@click="handleNavButton('left')"
					/>
					<UButton
						:disabled="currentItemIdx === posts.length - 1"
						icon="material-symbols:arrow-forward-rounded"
						size="lg"
						square
						@click="handleNavButton('right')"
					/>
				</div>
			</div>
			<div
				ref="postContainer"
				class="flex w-full px-4 py-6 space-x-6 overflow-x-auto md:px-6 lg:px-16 scrollbar-hide md:pt-8 snap-x scroll-smooth"
				@scroll="handleScrollDebounced"
			>
				<a
					v-for="post in posts"
					:key="post.id"
					ref="postRefs"
					:href="post.url"
					target="_blank"
					rel="noopener noreferrer"
					:class="['snap-center']"
					class="relative w-[350px] md:w-[450px] lg:w-[600px] flex flex-col justify-between flex-shrink-0 p-8 bg-white dark:bg-gray-900 shadow-md rounded-card overflow-hidden hover:shadow-lg transition-shadow group"
				>
					<div class="flex-1">
						<div class="flex items-start justify-between mb-4">
							<UIcon name="material-symbols:forum" class="w-8 h-8 text-primary/60 flex-shrink-0" />
							<UIcon
								name="material-symbols:open-in-new"
								class="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
							/>
						</div>

						<h3 class="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
							{{ post.title }}
						</h3>

						<p v-if="post.excerpt" class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
							{{ post.excerpt }}
						</p>
					</div>

					<div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
						<div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
							<div class="flex items-center space-x-1">
								<UIcon name="material-symbols:visibility-outline" class="w-4 h-4" />
								<span>{{ post.views }}</span>
							</div>
							<div class="flex items-center space-x-1">
								<UIcon name="material-symbols:chat-bubble-outline" class="w-4 h-4" />
								<span>{{ post.reply_count }}</span>
							</div>
							<div class="flex items-center space-x-1">
								<UIcon name="material-symbols:favorite-outline" class="w-4 h-4" />
								<span>{{ post.like_count }}</span>
							</div>
						</div>
						<time class="text-sm text-gray-500 dark:text-gray-400">
							{{ formatDate(post.created_at) }}
						</time>
					</div>
				</a>
			</div>
		</div>
		<div v-else class="relative py-12 text-center text-gray-500 dark:text-gray-400">
			<p>No posts available. Check back soon!</p>
		</div>
	</BlockContainer>
</template>
