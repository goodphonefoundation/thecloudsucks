import { getTypesenseClient } from '~/server/utils/typesense';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);

	const searchQuery = (query.q as string) || '*';
	const page = parseInt((query.page as string) || '1');
	const perPage = parseInt((query.per_page as string) || '20');

	// Build filter string
	const filters: string[] = [];

	// Category filter
	if (query.category) {
		filters.push(`categories:=[${query.category}]`);
	}

	// MVNO filter
	if (query.mvno_only === 'true') {
		filters.push('mvno_status:=mvno');
	}

	// eSIM filter
	if (query.esim_support === 'true') {
		filters.push('esim_support:=true');
	}

	// 5G filter
	if (query.five_g === 'true') {
		filters.push('5g_available:=true');
	}

	// Prepaid anonymous filter
	if (query.prepaid_anonymous === 'true') {
		filters.push('prepaid_anonymous:=true');
	}

	// No contract filter  
	if (query.no_contract === 'true') {
		filters.push('contract_flexibility:=no_contract_required');
	}

	try {
		const typesense = getTypesenseClient();

		const searchParameters = {
			q: searchQuery,
			query_by: 'name,short_description,parent_company',
			filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
			page,
			per_page: perPage,
			sort_by: query.sort_by ? (query.sort_by as string) : 'overall_score:desc',
		};

		const searchResults = await typesense.collections('carriers').documents().search(searchParameters);

		return {
			hits: searchResults.hits?.map((hit) => hit.document) || [],
			found: searchResults.found || 0,
			page: searchResults.page || 1,
			total_pages: Math.ceil((searchResults.found || 0) / perPage),
		};
	} catch (error: any) {
		console.error('Typesense search error:', error);
		
		// Return empty results if Typesense is not configured or unavailable
		if (error.code === 'ECONNREFUSED' || error.httpStatus === 404) {
			return {
				hits: [],
				found: 0,
				page: 1,
				total_pages: 0,
				error: 'Search service unavailable. Please configure Typesense.',
			};
		}

		throw createError({
			statusCode: 500,
			statusMessage: 'Search failed',
		});
	}
});
