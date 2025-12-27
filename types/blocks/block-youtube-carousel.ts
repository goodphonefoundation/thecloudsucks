import type { YouTubeVideo } from '../youtube-video';

export interface BlockYouTubeCarousel {
	id: number;
	title?: string | null;
	slug?: string | null;
	headline?: string | null;
	max_videos?: number | null;
	videos?: BlockYouTubeCarouselVideo[] | null;
}

export interface BlockYouTubeCarouselVideo {
	id: number;
	block_youtube_carousel_id: number;
	youtube_videos_id: YouTubeVideo;
	sort?: number | null;
}
