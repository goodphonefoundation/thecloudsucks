export interface BlockSelfhostedShowcase {
	id?: string;
	headline?: string | null;
	content?: string | null;
	display_style?: 'grid' | 'list' | 'featured' | null;
	primary_category?: string | null;
}
