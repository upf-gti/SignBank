<template>
    <q-select
      v-model="modelValue"
      :options="languageOptions"
      :label="translate('language')"
      outlined
      dense
      @update:model-value="$emit('update:modelValue', $event)"
    />    
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';

const languageOptions = [
  'ca',
  'es',
  'en',
  'fr',
  'de',
  'it',
  'pt',
  'ru',
  'zh',
  'ja',
  'ko'
] as const

const modelValue = defineModel<string>('modelValue')

defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'delete'): void;
}>();
</script> 