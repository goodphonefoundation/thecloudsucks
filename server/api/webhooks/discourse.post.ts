import { readItems, updateItem } from '@directus/sdk';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		
		// Extract topic and post information from Discourse webhook
		const { topic_id, post } = body;
		
		if (!topic_id || !post) {
			throw createError({
				statusCode: 400,
				message: 'Missing required webhook data',
			});
		}

		// Find the article associated with this Discourse topic
		const directus = useDirectus();
		const articles = await directus.request(
			readItems('posts', {
				filter: {
					discourse_topic_id: { _eq: topic_id },
				},
				limit: 1,
				fields: ['id', 'discourse_topic_id'],
			}),
		);

		if (!articles || articles.length === 0) {
			// No article found with this topic ID - this is okay, might be a non-article topic
			return { success: true, message: 'No matching article found' };
		}

		const article = articles[0];

		// Get the latest comment data from the full topic
		const discourseApiUrl = process.env.DISCOURSE_API_URL;
		const discourseApiKey = process.env.DISCOURSE_API_KEY;

		const topicResponse = await $fetch(`${discourseApiUrl}/t/${topic_id}.json`, {
			headers: {
				'Api-Key': discourseApiKey || '',
				'Api-Username': 'system',
			},
		});

		// Extract the latest post (excluding the first post which is the article itself)
		const posts = (topicResponse as any).post_stream?.posts || [];
		const latestPost = posts.length > 1 ? posts[posts.length - 1] : null;

		if (latestPost) {
			// Update the article with the latest comment
			await directus.request(
				updateItem('posts', article.id, {
					discourse_latest_comment: {
						id: latestPost.id,
						username: latestPost.username,
						avatar_template: latestPost.avatar_template,
						created_at: latestPost.created_at,
						cooked: latestPost.cooked,
						post_number: latestPost.post_number,
					},
				}),
			);
		}

		return {
			success: true,
			message: 'Comment data updated',
			article_id: article.id,
		};
	} catch (error: any) {
		console.error('Discourse webhook error:', error);
		throw createError({
			statusCode: 500,
			message: error.message || 'Failed to process webhook',
		});
	}
});
