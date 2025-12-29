import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

/**
 * Composable to convert Markdown to HTML
 */
export const useMarkdown = () => {
	/**
	 * Convert Markdown text to HTML
	 * @param markdown - The Markdown string to convert
	 * @returns HTML string
	 */
	const toHtml = (markdown: string | null | undefined): string => {
		if (!markdown) return '';
		
		try {
			return micromark(markdown, {
				extensions: [gfm()],
				htmlExtensions: [gfmHtml()],
			});
		} catch (error) {
			console.error('Failed to parse markdown:', error);
			return markdown;
		}
	};

	return {
		toHtml,
	};
};
