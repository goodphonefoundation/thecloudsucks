<script setup lang="ts">
interface BlockContainerProps {
	fullWidth?: boolean;
	blockId?: string | null;
}

withDefaults(defineProps<BlockContainerProps>(), {
	fullWidth: false,
	blockId: null,
});
</script>
<template>
	<section :id="blockId || undefined" :class="['py-8 mx-auto', !fullWidth ? 'px-6 lg:px-16 lg:py-24 max-w-6xl' : '']">
		<slot />
	</section>
</template>
