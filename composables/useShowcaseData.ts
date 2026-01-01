/**
 * Composable for showcase data fetching from Directus
 * Provides consistent data loading patterns
 */

export interface ShowcaseDataOptions {
	collection: string;
	fields: string[];
	cacheKey: string;
	status?: 'published' | 'active' | 'draft' | 'archived';
	sortField?: string;
}

export function useShowcaseData<T>(options: ShowcaseDataOptions) {
	const { collection, fields, cacheKey, status = 'published', sortField = 'name' } = options;

	/**
	 * Fetch items from Directus collection
	 */
	const { data, pending, error, refresh } = useAsyncData(cacheKey, () => {
		return useDirectus(
			readItems(collection, {
				fields,
				filter: {
					status: { _eq: status },
				},
				sort: [sortField],
			})
		);
	});

	/**
	 * Items as typed array
	 */
	const items = computed<T[]>(() => {
		return (data.value as T[]) || [];
	});

	/**
	 * Check if data is loading
	 */
	const isLoading = computed(() => pending.value);

	/**
	 * Check if there was an error
	 */
	const hasError = computed(() => !!error.value);

	/**
	 * Count of items
	 */
	const itemCount = computed(() => items.value.length);

	return {
		items,
		data,
		isLoading,
		hasError,
		error,
		itemCount,
		refresh,
	};
}
