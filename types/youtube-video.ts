export interface YouTubeVideo {
	id: number;
	video_id: string;
	title: string;
	description?: string | null;
	thumbnail_url?: string | null;
	published_at?: string | null;
	channel_id?: string | null;
	duration?: string | null;
	view_count?: number | null;
	status: 'pending' | 'approved' | 'rejected' | 'archived';
	approved_by?: string | null;
	approved_at?: string | null;
	sort?: number | null;
}
