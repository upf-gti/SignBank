<template>
  <q-card
    class="fit column no-wrap"
    flat
    bordered
  >
    <SearchInput
      :model-value="searchQuery"
      @update:model-value="$emit('update:searchQuery', $event)"
      @search="$emit('search')"
    />
    <q-card-section class="fit column col no-wrap">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2">
          {{ t('filters') }}
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            flat
            dense
            color="grey"
            :label="t('clear')"
            :disable="!selectedCategory && !selectedHands && Object.keys(filterInputs).length === 0"
            @click="clearFilters"
          />
          <q-btn
            color="primary"
            dense
            :label="t('apply')"
            @click="$emit('search')"
          />
        </div>
      </div>
      <div
        class="fit column col no-wrap custom-scrollbar q-pr-sm"
        :style="{overflowY: 'auto'}"
      >
        <FilterCategories        
          :selected-category="selectedCategory"
          @update:selected-category="$emit('update:selectedCategory', $event)"
        />
        <FilterInputs
          class="col"
          :phonology-data="filterInputs"
          @update:phonology-data="$emit('update:filterInputs', $event)"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import translate from 'src/utils/translate';
import SearchInput from './components/SearchInput.vue';
import FilterCategories from './components/FilterCategories.vue';
import FilterInputs from './components/FilterInputs.vue';
import type { PhonologyData } from 'src/types/models';
import { Hand } from 'src/types/enums';

const t = (key: string) => translate(key);

const props = defineProps<{
  searchQuery: string;
  selectedCategory: string;
  selectedHands: string;
  filterInputs: PhonologyData;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:selectedCategory', value: string): void;
  (e: 'update:selectedHands', value: string): void;
  (e: 'update:filterInputs', value: PhonologyData): void;
  (e: 'search'): void;
  (e: 'clear'): void;
}>();

function clearFilters() {
  emit('update:selectedCategory', '');
  emit('update:selectedHands', '');
  emit('update:filterInputs', {
    hands: null,
    configuration: '',
    configurationChanges: '',
    relationBetweenArticulators: '',
    location: '',
    movementRelatedOrientation: '',
    orientationRelatedToLocation: '',
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
<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>