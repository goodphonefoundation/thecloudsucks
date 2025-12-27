export interface BlockFaq {
	faqs?: BlockFaqQuestion[] | null;
	headline?: string | null;
	id?: string;
	title?: string | null;
	slug?: string | null;
	alignment?: 'left' | 'center' | null;
}

export interface BlockFaqQuestion {
	title: string | null;
	answer: string | null;
}
