<template>
  <div class="q-mt-md">
    <q-input
      v-for="(value, field) in modelValue"
      :key="field"
      :model-value="value"
      :label="t(field)"
      outlined
      dense
      clearable
      @update:model-value="updateField(field, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import type { FilterInputs } from '../types';

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