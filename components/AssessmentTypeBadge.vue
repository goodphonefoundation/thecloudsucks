<template>
  <span
    v-if="assessmentType"
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
      badgeClass
    ]"
  >
    <Icon :name="icon" class="w-3.5 h-3.5" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  assessmentType?: 'ai' | 'human' | 'brax_team' | null
}>();

const label = computed(() => {
  switch (props.assessmentType) {
    case 'ai':
      return 'AI Generated';
    case 'human':
      return 'Human Reviewed';
    case 'brax_team':
      return 'Brax Team Verified';
    default:
      return '';
  }
});

const icon = computed(() => {
  switch (props.assessmentType) {
    case 'ai':
      return 'material-symbols:robot-2-outline';
    case 'human':
      return 'material-symbols:person-check-outline';
    case 'brax_team':
      return 'material-symbols:verified-outline';
    default:
      return '';
  }
});

const badgeClass = computed(() => {
  switch (props.assessmentType) {
    case 'ai':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 'human':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
    case 'brax_team':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
    default:
      return '';
  }
});
</script>
