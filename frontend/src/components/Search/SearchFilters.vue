<template>
  <q-card class="filters-sidebar" flat bordered style="overflow-y: auto;">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2">
          {{ t('filters') }}
        </div>
        <q-btn flat dense color="grey" :label="t('clear')"
          :disable="!selectedCategory && !selectedHands && Object.keys(filterInputs).length === 0"
          @click="clearFilters" />
      </div>
      <div class="filters-content">
        <FilterCategories :selected-category="selectedCategory"
          @update:selected-category="$emit('update:selectedCategory', $event)" />
        <FilterInputs :phonology-data="filterInputs" @update:phonology-data="$emit('update:filterInputs', $event)" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate'
import FilterCategories from './components/FilterCategories.vue'
import FilterInputs from './components/FilterInputs.vue'

// Create a type for filter inputs that allows empty values
type FilterInputs = {
  hands: string | null
  configuration: string
  configurationChanges: string
  relationBetweenArticulators: string
  location: string
  movementRelatedOrientation: string
  orientationRelatedToLocation: string
  orientationChange: string
  contactType: string
  movementType: string
  vocalization: string
  nonManualComponent: string
  inicialization: string
  repeatedMovement: boolean | null
  movementDirection: string
}

const t = (key: string) => translate(key)

defineProps<{
  searchQuery: string
  selectedCategory: string
  selectedHands: string
  filterInputs: FilterInputs
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:selectedCategory', value: string): void;
  (e: 'update:selectedHands', value: string): void;
  (e: 'update:filterInputs', value: FilterInputs): void;
  (e: 'search'): void;
  (e: 'clear'): void
}>()

function clearFilters() {
  emit('update:selectedCategory', '')
  emit('update:selectedHands', '')
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
    movementDirection: '',
    repeatedMovement: null,
    vocalization: '',
    nonManualComponent: '',
    inicialization: ''
  })
  emit('clear')
}
</script>
<style scoped>
.filters-sidebar {
  width: 100%;
  height: 100%;
}

.filters-content {
  overflow-y: auto;
  padding-right: 8px;
}

.filters-content::-webkit-scrollbar {
  width: 6px;
}

.filters-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.filters-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.filters-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

</style>