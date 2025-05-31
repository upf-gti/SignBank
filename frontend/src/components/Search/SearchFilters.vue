<template>
  <q-card flat bordered>
    <SearchInput
      :model-value="searchQuery"
      @update:model-value="$emit('update:searchQuery', $event)"
      @search="$emit('search')"
    />

    <q-separator />

    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2">{{ t('filters') }}</div>
        <div class="row q-gutter-sm">
          <q-btn
            flat
            dense
            color="grey"
            :label="t('clear')"
            @click="clearFilters"
            :disable="!selectedCategory && !selectedHands && Object.keys(filterInputs).length === 0"
          />
          <q-btn
            color="primary"
            dense
            :label="t('applyFilters')"
            @click="$emit('search')"
          />
        </div>
      </div>

      <FilterCategories
        :selected-category="selectedCategory"
        :selected-hands="selectedHands"
        @update:selected-category="$emit('update:selectedCategory', $event)"
        @update:selected-hands="$emit('update:selectedHands', $event)"
      />

      <FilterInputs
        :model-value="filterInputs"
        @update:model-value="$emit('update:filterInputs', $event)"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import translate from 'src/utils/translate';
import SearchInput from './components/SearchInput.vue';
import FilterCategories from './components/FilterCategories.vue';
import FilterInputs from './components/FilterInputs.vue';
import type { FilterInputs as FilterInputsType } from './types';

const t = (key: string) => translate(key);

const props = defineProps<{
  searchQuery: string;
  selectedCategory: string;
  selectedHands: string;
  filterInputs: FilterInputsType;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:selectedCategory', value: string): void;
  (e: 'update:selectedHands', value: string): void;
  (e: 'update:filterInputs', value: FilterInputsType): void;
  (e: 'search'): void;
  (e: 'clear'): void;
}>();

function clearFilters() {
  emit('update:selectedCategory', '');
  emit('update:selectedHands', '');
  emit('update:filterInputs', {
    configuration: '',
    configurationChanges: '',
    relationBetweenArticulators: '',
    location: '',
    movementRelatedOrientation: '',
    locationRelatedOrientation: '',
    orientationChange: '',
    contactType: '',
    movementType: '',
    vocalization: '',
    nonManualComponent: '',
    inicialization: ''
  });
  emit('clear');
}
</script> 