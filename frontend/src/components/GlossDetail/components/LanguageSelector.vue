<template>
  <q-select
    v-model="modelValue"
    :options="languageOptions"
    :label="translate('language')"
    outlined
    dense
    emit-value
    map-options
    @update:model-value="$emit('update:modelValue', $event)"
  />    
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import { Language } from 'src/types/models';

const languageOptions = Object.values(Language).map(lang => {
  return {
    value: lang,
    label: translate(lang)
  }
});

const modelValue = defineModel<string>('modelValue')

defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'delete'): void;
}>();
</script> 