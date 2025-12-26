<script setup lang="ts">
definePageMeta({
	layout: 'default',
});

useSeoMeta({
	title: 'Community Forum',
	description: 'Latest discussions from our community forum',
});
</script>

<template>
	<div>
		<BlocksDiscoursePosts />
	</div>
</template>
