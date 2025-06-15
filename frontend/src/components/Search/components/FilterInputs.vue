<template>
  <PhonologyFilters
    :phonology-data="phonologyData"
    :is-editable="true"
    @update:phonology-data="$emit('update:phonology-data', $event)"
  />
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import type { PhonologyData } from 'src/types/models';
import PhonologyFilters from 'src/components/Shared/PhonologyFilters.vue';

const t = (key: string) => translate(key);

const props = defineProps<{
  phonologyData: PhonologyData;
}>();

const emit = defineEmits<{
  (e: 'update:phonology-data', value: PhonologyData): void;
}>();

function updateField(field: keyof PhonologyData, value: string | number | null) {
  emit('update:phonology-data', {
    ...props.phonologyData,
    [field]: value !== null ? String(value) : ''
  });
}
</script> 