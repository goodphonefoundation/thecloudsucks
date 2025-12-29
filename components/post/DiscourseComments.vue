<script setup lang="ts">
interface DiscourseComment {
	id: number;
	username: string;
	avatar_template: string;
	created_at: string;
	cooked: string;
	post_number: number;
}

interface Props {
	topicId?: number;
	topicUrl?: string;
	latestComment?: DiscourseComment;
	postTitle: string;
}

const props = defineProps<Props>();

const discourseUrl = 'https://community.thecloud.sucks';

// Format avatar URL
const getAvatarUrl = (template: string) => {
	if (!template) return '';
	return discourseUrl + template.replace('{size}', '96');
};

// Format relative time
const getRelativeTime = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) return `${diffDays}d ago`;
	if (diffHours > 0) return `${diffHours}h ago`;
	if (diffMins > 0) return `${diffMins}m ago`;
	return 'just now';
};
</script>

<template>
	<div class="border-t dark:border-gray-700 pt-8 mt-12">
		<h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Discussion</h2>

		<!-- No Discourse topic yet -->
		<div v-if="!topicId" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
			<p class="text-gray-600 dark:text-gray-400 mb-4">
				Discussions for this article haven't been created yet.
			</p>
			<p class="text-sm text-gray-500 dark:text-gray-500">
				Check back soon to join the conversation!
			</p>
		</div>

		<!-- Has Discourse topic -->
		<div v-else>
			<!-- Latest Comment -->
			<div v-if="latestComment" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
				<div class="flex items-start gap-4">
					<img
						:src="getAvatarUrl(latestComment.avatar_template)"
						:alt="latestComment.username"
						class="w-12 h-12 rounded-full"
					/>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-2">
							<span class="font-semibold text-gray-900 dark:text-white">
								{{ latestComment.username }}
							</span>
							<span class="text-sm text-gray-500 dark:text-gray-400">
								{{ getRelativeTime(latestComment.created_at) }}
							</span>
						</div>
						<div
							class="prose prose-sm dark:prose-invert max-w-none"
							v-html="latestComment.cooked"
						></div>
					</div>
				</div>
			</div>

			<!-- Join Discussion CTA -->
			<div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div class="text-center sm:text-left">
					<p class="text-gray-700 dark:text-gray-300 font-medium">
						{{ latestComment ? 'Join the conversation' : 'Start the discussion' }}
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						Share your thoughts on our community forum
					</p>
				</div>
				<UButton
					v-if="topicUrl"
					:to="topicUrl"
					target="_blank"
					color="primary"
					size="lg"
					icon="i-mdi-forum"
				>
					{{ latestComment ? 'View Full Discussion' : 'Start Discussion' }}
				</UButton>
			</div>
		</div>
	</div>
</template>
