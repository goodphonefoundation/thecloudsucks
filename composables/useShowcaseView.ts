/**
 * Composable for showcase view mode management
 * Handles grid/list view toggle
 */

export type ViewMode = 'grid' | 'list';

export function useShowcaseView(defaultMode: ViewMode = 'grid') {
	const viewMode = ref<ViewMode>(defaultMode);

	/**
	 * Toggle between grid and list view
	 */
	const toggleView = () => {
		viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
	};

	/**
	 * Set view mode explicitly
	 */
	const setViewMode = (mode: ViewMode) => {
		viewMode.value = mode;
	};

	/**
	 * Check if current view is grid
	 */
	const isGridView = computed(() => viewMode.value === 'grid');

	/**
	 * Check if current view is list
	 */
	const isListView = computed(() => viewMode.value === 'list');

	return {
		viewMode,
		toggleView,
		setViewMode,
		isGridView,
		isListView,
	};
}
