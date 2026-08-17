<template>
  <PhonologyTable
    :phonology-data="phonologyData"
    :is-editable="isEditable"
    :compact="compact"
    @update:phonology-data="$emit('update:phonologyData', $event)"
  />
</template>

<script setup lang="ts">
import type { PhonologyData } from 'src/types/models';
import PhonologyTable from './PhonologyTable.vue';

defineProps<{
  phonologyData: PhonologyData;
  isEditable?: boolean;
  compact?: boolean;
}>();

defineEmits<{
  (e: 'update:phonologyData', value: PhonologyData): void;
}>();
</script>
