/**
 * Composable for showcase search functionality
 * Provides reactive search query and filtering logic
 */

export function useShowcaseSearch<T>(items: Ref<T[]>, searchFields: string[]) {
	const searchQuery = ref<string>('');

	/**
	 * Apply search filter to items
	 * Searches across specified fields (case-insensitive)
	 */
	const searchFilter = (item: T): boolean => {
		if (!searchQuery.value.trim()) return true;

		const query = searchQuery.value.toLowerCase().trim();

		return searchFields.some((field) => {
			const value = (item as any)[field];
			if (value === null || value === undefined) return false;
			return String(value).toLowerCase().includes(query);
		});
	};

	/**
	 * Filtered items based on search query
	 */
	const searchedItems = computed(() => {
		if (!items.value) return [];
		return items.value.filter(searchFilter);
	});

	/**
	 * Clear search query
	 */
	const clearSearch = () => {
		searchQuery.value = '';
	};

	return {
		searchQuery,
		searchedItems,
		clearSearch,
	};
}
