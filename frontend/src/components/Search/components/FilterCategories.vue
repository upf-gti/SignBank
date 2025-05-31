<template>
  <!-- Lexical Category Select -->
  <div class="q-mb-md">
    <div class="text-subtitle2 q-mb-sm">{{ t('lexicalCategory') }}</div>
    <q-select
      :model-value="selectedCategory"
      :options="lexicalCategories"
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

  <!-- Hands Toggle -->
  <div class="q-mb-md">
    <div class="text-subtitle2 q-mb-sm">{{ t('hands') }}</div>
    <q-btn-toggle
      :model-value="selectedHands"
      :options="handsOptions"
      spread
      no-caps
      unelevated
      toggle-color="primary"
      color="grey-3"
      text-color="grey-8"
      class="full-width"
      @update:model-value="$emit('update:selectedHands', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import translate from 'src/utils/translate';
import { LexicalCategory, Hand } from 'src/types/enums';

const t = (key: string) => translate(key);

const props = defineProps<{
  selectedCategory: string;
  selectedHands: string;
}>();

defineEmits<{
  (e: 'update:selectedCategory', value: string): void;
  (e: 'update:selectedHands', value: string): void;
}>();

// Lexical categories for select
const lexicalCategories = Object.values(LexicalCategory);

// Hands options for toggle
const handsOptions = [
  { label: t('rightHand'), value: Hand.RIGHT },
  { label: t('leftHand'), value: Hand.LEFT },
  { label: t('bothHands'), value: Hand.BOTH }
];
</script> 