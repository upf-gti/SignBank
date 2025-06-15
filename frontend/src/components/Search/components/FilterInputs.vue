<template>
  <PhonologyFilters
    :phonology-data="phonologyData"
    :is-editable="true"
    @update:phonology-data="$emit('update:phonology-data', $event)"
  />
</template>

<script setup lang="ts">
import type { PhonologyData } from 'src/types/models';
import PhonologyFilters from 'src/components/Shared/PhonologyFilters.vue';

defineProps<{
  phonologyData: PhonologyData;
}>();

defineEmits<{
  (e: 'update:phonology-data', value: PhonologyData): void;
}>();

</script> 