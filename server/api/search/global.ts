import { getTypesenseClient } from '~/server/utils/typesense';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const searchQuery = (query.q as string) || '';
	
	if (!searchQuery || searchQuery.length < 2) {
		return {
			results: [],
			total: 0,
		};
	}

	const limit = parseInt((query.limit as string) || '5');

	try {
		const typesense = getTypesenseClient();

		// Multi-collection search
		const searchRequests = {
			searches: [
				{
					collection: 'carriers',
					q: searchQuery,
					query_by: 'name,short_description,parent_company',
					per_page: limit,
					sort_by: 'overall_score:desc',
				},
				{
					collection: 'services',
					q: searchQuery,
					query_by: 'name,short_description',
					per_page: limit,
					sort_by: 'score_overall:desc',
				},
				{
					collection: 'hardware',
					q: searchQuery,
					query_by: 'name,short_description,manufacturer',
					per_page: limit,
					sort_by: 'overall_score:desc',
				},
			],
		};

		const results = await typesense.multiSearch.perform(searchRequests, {});

		// Transform results
		const formattedResults = results.results.map((result: any, index: number) => {
			const collectionName = searchRequests.searches[index].collection;
			const hits = result.hits?.map((hit: any) => ({
				...hit.document,
				_collection: collectionName,
				_type: collectionName.slice(0, -1), // Remove 's' to get singular
			})) || [];

			return {
				collection: collectionName,
				hits,
				found: result.found || 0,
			};
		});

		// Flatten and combine all results
		const allHits = formattedResults.flatMap((r) => r.hits);
		const total = formattedResults.reduce((sum, r) => sum + r.found, 0);

		return {
			results: allHits,
			total,
			by_collection: formattedResults,
		};
	} catch (error: any) {
		console.error('Global search error:', error);

		// Return empty results if Typesense is not available
		if (error.code === 'ECONNREFUSED' || error.httpStatus === 404) {
			return {
				results: [],
				total: 0,
				error: 'Search service unavailable',
			};
		}

		throw createError({
			statusCode: 500,
			statusMessage: 'Search failed',
		});
	}
});
