/**
 * Composable for showcase advanced filtering
 * Provides reactive filters and filtering logic
 */

export interface FilterConfig {
	[key: string]: boolean;
}

export interface FilterRule<T> {
	key: string;
	condition: (item: T) => boolean;
}

export function useShowcaseFilters<T>(filterRules: FilterRule<T>[]) {
	// Initialize all filters as false
	const advancedFilters = ref<FilterConfig>(
		filterRules.reduce((acc, rule) => {
			acc[rule.key] = false;
			return acc;
		}, {} as FilterConfig)
	);

	/**
	 * Apply advanced filters to items
	 */
	const applyFilters = (items: T[]): T[] => {
		let filtered = items;

		// Get active filters
		const activeFilters = filterRules.filter(
			(rule) => advancedFilters.value[rule.key] === true
		);

		// Apply each active filter
		for (const filter of activeFilters) {
			filtered = filtered.filter(filter.condition);
		}

		return filtered;
	};

	/**
	 * Count of active filters
	 */
	const activeFiltersCount = computed(() => {
		return Object.values(advancedFilters.value).filter(Boolean).length;
	});

	/**
	 * Check if any filters are active
	 */
	const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

	/**
	 * Reset all filters to false
	 */
	const resetFilters = () => {
		Object.keys(advancedFilters.value).forEach((key) => {
			advancedFilters.value[key] = false;
		});
	};

	/**
	 * Set a specific filter value
	 */
	const setFilter = (key: string, value: boolean) => {
		if (key in advancedFilters.value) {
			advancedFilters.value[key] = value;
		}
	};

	/**
	 * Toggle a specific filter
	 */
	const toggleFilter = (key: string) => {
		if (key in advancedFilters.value) {
			advancedFilters.value[key] = !advancedFilters.value[key];
		}
	};

	return {
		advancedFilters,
		applyFilters,
		activeFiltersCount,
		hasActiveFilters,
		resetFilters,
		setFilter,
		toggleFilter,
	};
}
