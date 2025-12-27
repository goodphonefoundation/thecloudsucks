<script setup lang="ts">
import type { BlockYouTubeCarousel } from '~/types';

const props = defineProps<{
	data: BlockYouTubeCarousel;
}>();

const videos = computed(() => {
	return props.data?.videos
		?.filter((v) => v.youtube_videos_id)
		.map((v) => v.youtube_videos_id)
		.slice(0, props.data.max_videos || 6);
});

const getYouTubeThumbnail = (videoId: string) => {
	return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const getYouTubeUrl = (videoId: string) => {
	return `https://www.youtube.com/watch?v=${videoId}`;
};

const formatDuration = (duration: string | null | undefined) => {
	if (!duration) return '';
	// Parse ISO 8601 duration (PT5M30S -> 5:30)
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return '';
	const hours = parseInt(match[1] || '0');
	const minutes = parseInt(match[2] || '0');
	const seconds = parseInt(match[3] || '0');
	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatViewCount = (count: number | null | undefined) => {
	if (!count) return '';
	if (count >= 1000000) {
		return `${(count / 1000000).toFixed(1)}M views`;
	}
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K views`;
	}
	return `${count} views`;
};
</script>

<template>
	<BlockContainer :block-id="data.slug">
		<div class="text-center">
			<TypographyTitle v-if="data.title">{{ data.title }}</TypographyTitle>
			<TypographyHeadline v-if="data.headline" :content="data.headline" size="lg" />
		</div>

		<div v-if="videos && videos.length > 0" class="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
			<a
				v-for="video in videos"
				:key="video.id"
				:href="getYouTubeUrl(video.video_id)"
				target="_blank"
				rel="noopener noreferrer"
				class="group relative overflow-hidden transition-transform duration-300 hover:scale-105 rounded-card"
			>
				<!-- Thumbnail -->
				<div class="relative aspect-video overflow-hidden bg-gray-900 rounded-card">
					<img
						:src="video.thumbnail_url || getYouTubeThumbnail(video.video_id)"
						:alt="video.title"
						class="object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-75"
					/>
					<!-- Play button overlay -->
					<div
						class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
					>
						<div
							class="flex items-center justify-center w-16 h-16 transition-transform duration-300 bg-red-600 rounded-full group-hover:scale-110"
						>
							<Icon name="material-symbols:play-arrow" class="w-8 h-8 text-white" />
						</div>
					</div>
					<!-- Duration badge -->
					<div
						v-if="video.duration"
						class="absolute px-2 py-1 text-xs font-semibold text-white bg-black bg-opacity-80 rounded bottom-2 right-2"
					>
						{{ formatDuration(video.duration) }}
					</div>
				</div>

				<!-- Video info -->
				<div class="mt-3">
					<h3 class="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white">
						{{ video.title }}
					</h3>
					<p v-if="video.view_count" class="mt-1 text-xs text-gray-600 dark:text-gray-400">
						{{ formatViewCount(video.view_count) }}
					</p>
				</div>
			</a>
		</div>

		<div v-else class="py-12 text-center text-gray-500 dark:text-gray-400">
			<p>No videos to display</p>
		</div>
	</BlockContainer>
</template>
