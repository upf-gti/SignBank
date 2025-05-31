<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { searchService, type SearchParams, type SearchResponse } from 'src/services/search.service';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import translate from 'src/utils/translate';
import SearchFilters from 'src/components/Search/SearchFilters.vue';
import SearchResults from 'src/components/Search/SearchResults.vue';
import type { FilterInputs } from 'src/components/Search/types';

const $q = useQuasar();
const router = useRouter();
const pageHeight = ref(0);

const t = (key: string) => translate(key);
// Search state
const searchQuery = ref('');
const searchResults = ref<SearchResponse | null>(null);
const loading = ref(false);
const page = ref(1);
const perPage = ref(20);
const showDetails = ref(false);

// Filters state
const selectedLexicalCategory = ref<string>('');
const selectedHands = ref<string>('');
const filterInputs = ref<FilterInputs>({
  hands: '',
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

// Computed properties
const filterBy = computed(() => {
  const filters = [];
  
  if (selectedLexicalCategory.value) {
    filters.push(`lexicalCategory:='${selectedLexicalCategory.value}'`);
  }
  
  if (selectedHands.value) {
    filters.push(`hands:='${selectedHands.value}'`);
  }
  
  // Add text input filters
  for (const [field, value] of Object.entries(filterInputs.value)) {
    if (value.trim()) {
      filters.push(`${field}:='${value.trim()}'`);
    }
  }
  
  return filters.join(' && ');
});

const hasResults = computed(() => {
  return searchResults.value?.hits && searchResults.value.hits.length > 0;
});

const totalResults = computed(() => {
  return searchResults.value?.found || 0;
});

// Methods
async function performSearch() {
  try {
    loading.value = true;
    const params: SearchParams = {
      query: searchQuery.value || '*',
      page: Number(page.value),
      limit: Number(perPage.value),
      filter_by: filterBy.value || undefined,
      facet_by: 'lexicalCategory,hands'
    };
    
    searchResults.value = await searchService.search(params);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error performing search'
    });
  } finally {
    loading.value = false;
  }
}

function viewGlossDetails(glossId: string) {
  router.push(`/gloss/${glossId}`);
}

// Lifecycle
onMounted(() => {
  performSearch();
});
</script>

<template>
  <q-page 
    :style-fn="(header: number, height: number) => {
      pageHeight = height-header
      return { height: `${height - header}px` };
    }"
    class="row q-pa-md"
  >
    <!-- Left Sidebar -->
    <div class="col-12 col-md-3 q-pr-md">
      <SearchFilters
        v-model:search-query="searchQuery"
        v-model:selected-category="selectedLexicalCategory"
        v-model:selected-hands="selectedHands"
        v-model:filter-inputs="filterInputs"
        @search="performSearch"
        @clear="performSearch"
      />
    </div>

    <!-- Main Content -->
    <div class="col-12 col-md-9">
      <SearchResults
        :results="searchResults"
        :loading="loading"
        :page="page"
        :per-page="perPage"
        :show-details="showDetails"
        @update:page="(newPage) => { page = newPage; performSearch(); }"
        @update:show-details="showDetails = $event"
        @view-details="viewGlossDetails"
      />
    </div>
  </q-page>
</template>

<style scoped>
.q-expansion-item :deep(.q-item) {
  padding: 4px 0;
}
</style> 