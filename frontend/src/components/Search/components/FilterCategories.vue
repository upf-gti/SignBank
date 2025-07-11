<template>
  <!-- Lexical Category Select -->
  <div class="q-mb-md">
    <div class="text-subtitle2 q-mb-sm">
      {{ t('lexicalCategory') }}
    </div>
    <q-select
      :model-value="selectedCategory"
      :options="LEXICAL_CATEGORIES"
      outlined
      dense
      emit-value
      map-options
      clearable
      options-dense
      :label="t('selectCategory')"
      @update:model-value="$emit('update:selectedCategory', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import { LEXICAL_CATEGORIES } from 'src/utils/lexicalCategories'

const t = (key: string) => translate(key);

defineProps<{
  selectedCategory: string;
}>();

defineEmits<{
  (e: 'update:selectedCategory', value: string): void;
}>();


</script> 