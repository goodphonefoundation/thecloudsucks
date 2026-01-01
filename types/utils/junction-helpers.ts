/**
 * Utility types and helpers for Many-to-Many junction tables
 */

/**
 * Generic junction table interface
 */
export interface JunctionTable<TId = string, TRelatedId = string> {
	id: string;
	[key: string]: TId | TRelatedId | any;
}

/**
 * Extract categories from junction array
 * Handles both ID strings and nested objects
 */
export function extractCategories<T>(
	junctions: any[] | null | undefined,
	categoryKey: string
): T[] {
	if (!junctions || !Array.isArray(junctions)) return [];

	return junctions
		.map((junction) => {
			const category = junction[categoryKey];
			// Handle both nested objects and direct IDs
			return typeof category === 'object' ? category : null;
		})
		.filter((cat): cat is T => cat !== null);
}

/**
 * Extract category IDs from junction array
 */
export function extractCategoryIds(
	junctions: any[] | null | undefined,
	categoryKey: string
): string[] {
	if (!junctions || !Array.isArray(junctions)) return [];

	return junctions
		.map((junction) => {
			const category = junction[categoryKey];
			// Handle both nested objects with id and direct ID strings
			if (typeof category === 'object' && category?.id) {
				return category.id;
			}
			if (typeof category === 'string') {
				return category;
			}
			return null;
		})
		.filter((id): id is string => id !== null);
}

/**
 * Check if item belongs to a specific category
 */
export function hasCategory(
	junctions: any[] | null | undefined,
	categoryKey: string,
	categoryId: string
): boolean {
	const ids = extractCategoryIds(junctions, categoryKey);
	return ids.includes(categoryId);
}

/**
 * Type guard to check if value is a junction array
 */
export function isJunctionArray(value: any): value is any[] {
	return Array.isArray(value) && value.every((item) => typeof item === 'object' && 'id' in item);
}

/**
 * Normalize junction data - ensures consistent structure
 */
export function normalizeJunction<T>(
	junction: any,
	categoryKey: string
): { id: string; category: T | null } {
	return {
		id: junction.id,
		category: junction[categoryKey] || null,
	};
}
