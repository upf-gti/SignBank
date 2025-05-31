<template>
  <div>
    <PhonologyFilters
      :model-value="modelValue"
      :is-editable="true"
      @update:model-value="$emit('update:model-value', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import type { FilterInputs } from '../types';
import PhonologyFilters from 'src/components/Shared/PhonologyFilters.vue';

const t = (key: string) => translate(key);

const props = defineProps<{
  modelValue: FilterInputs;
}>();

const emit = defineEmits<{
  (e: 'update:model-value', value: FilterInputs): void;
}>();

function updateField(field: keyof FilterInputs, value: string | number | null) {
  emit('update:model-value', {
    ...props.modelValue,
    [field]: String(value || '')
  });
}
</script> 