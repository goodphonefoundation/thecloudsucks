import type { AppCategory } from '../apps';

export interface BlockAppsShowcase {
	id?: string;
	headline?: string | null;
	content?: string | null;
	display_style?: 'grid' | 'list' | 'featured' | null;
	filter_by_category?: (string | AppCategory) | null;
}
