<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1">
        {{ totalResults }} {{ t('resultsFound') }}
      </div>
      <q-toggle
        :model-value="showDetails"
        :label="t('showConfigurationDetails')"
        color="primary"
        @update:model-value="$emit('update:showDetails', $event)"
      />
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>

    <div v-if="!hasResults && !loading" class="text-center q-mt-xl">
      <p class="text-h6">{{ t('noResults') }}</p>
    </div>

    <div v-else-if="hasResults" class="row q-col-gutter-md">
      <div
        v-for="hit in results?.hits"
        :key="hit.document.id"
        class="col-12"
      >
        <ResultCard
          :document="hit.document"
          :show-details="showDetails"
          @view-details="$emit('view-details', $event)"
        />
      </div>
    </div>

    <div class="flex flex-center q-mt-lg">
      <q-pagination
        v-if="totalResults > perPage"
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