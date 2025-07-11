<template>
  <div class="fit column no-wrap">
    <q-inner-loading :showing="loading">
      <q-spinner-dots
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <div
      v-if="!hasResults && !loading"
      class="text-center q-mt-xl"
    >
      <p class="text-h6">
        {{ t('noResults') }}
      </p>
    </div>

    <div
      v-else-if="hasResults"
      class="search-results-grid" 
      :style="{ overflowY: 'auto'}"
    >
      <div
        v-for="hit in results?.hits"
        :key="hit.document.id"
        class="result-item"
      >
        <ResultCard
          :document="hit.document"
          :show-details="showDetails"
          @view-details="$emit('view-details', $event)"
        />
      </div>
    </div>

    <div
      v-if="totalResults > perPage" 
      class="flex flex-center q-mt-sm"
    >
      <q-pagination
        :model-value="page"
        :max="Math.ceil(totalResults / perPage)"
        :max-pages="6"
        boundary-numbers
        @update:model-value="$emit('update:page', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import translate from 'src/utils/translate';
import type { SearchResponse } from 'src/services/search.service';
import ResultCard from './components/ResultCard.vue';

const t = (key: string) => translate(key);

const props = defineProps<{
  results: SearchResponse | null;
  loading: boolean;
  page: number;
  perPage: number;
  showDetails: boolean;
}>();

defineEmits<{
  (e: 'update:page', value: number): void;
  (e: 'update:showDetails', value: boolean): void;
  (e: 'view-details', glossId: string): void;
  (e: 'page-change', page: number): void;
}>();

const hasResults = computed(() => {
  return props.results?.hits && props.results.hits.length > 0;
});

const totalResults = computed(() => {
  return props.results?.found || 0;
});
</script>

<style scoped>
.search-results-grid {
  display: grid;
  gap: 16px;
  width: 100%;
}

.result-item {
  width: 100%;
}

/* Mobile: 1 column */
@media (max-width: 599px) {
  .search-results-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 2 columns */
@media (min-width: 600px) and (max-width: 1023px) {
  .search-results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) and (max-width: 1899px) {
  .search-results-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop: 4 columns */
@media (min-width: 1900px) {
  .search-results-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 