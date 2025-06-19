<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { searchService, type SearchParams, type SearchResponse } from 'src/services/search.service';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import SearchFilters from 'src/components/Search/SearchFilters.vue';
import SearchResults from 'src/components/Search/SearchResults.vue';
import type { PhonologyData } from 'src/types/models';

const $q = useQuasar();
const router = useRouter();
const pageHeight = ref(0);

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
const filterInputs = ref<PhonologyData>({
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
  inicialization: '',
  repeatedMovement: null,
  movementDirection: ''
});

// Computed properties
const filterBy = computed(() => {
  const filters = [];
  
  if (selectedLexicalCategory.value !== '' && selectedLexicalCategory.value !== null) {
    filters.push(`lexicalCategory:='${selectedLexicalCategory.value}'`);
  }
  
  if (selectedHands.value !== '' && selectedHands.value !== null) {
    filters.push(`hands:='${selectedHands.value}'`);
  }
  
  // Add text input filters - using contains operator for fuzzy matching
  for (const [field, value] of Object.entries(filterInputs.value)) {
    if (value !== '' && value !== null) {
      // Handle boolean values differently
      if (typeof value === 'boolean') {
        filters.push(`${field}:=${value}`);
      } else {
        // Use contains operator for phonology fields to enable partial matching
        filters.push(`${field}:='${value}'`);
      }
    }
  }
  
  return filters.join(' && ');
});

// Methods
async function performSearch() {
  try {
    loading.value = true;
    
    // Build search query including phonology terms for fuzzy matching
    let finalSearchQuery = searchQuery.value || '*';
    
    // If there are phonology filters selected, add them to the search query for fuzzy matching
    const phonologyTerms = [];
    for (const [, value] of Object.entries(filterInputs.value)) {
      if (value !== '') {
        phonologyTerms.push(value);
      }
    }
    
    // Combine text search with phonology terms
    if (phonologyTerms.length > 0 && searchQuery.value && searchQuery.value !== '*') {
      finalSearchQuery = `${searchQuery.value} ${phonologyTerms.join(' ')}`;
    } else if (phonologyTerms.length > 0) {
      finalSearchQuery = phonologyTerms.join(' ');
    }
    
    const params: SearchParams = {
      query: finalSearchQuery || '*',
      page: Number(page.value),
      limit: Number(perPage.value),
      filter_by: filterBy.value || undefined,
      facet_by: 'lexicalCategory,hands,configuration,configurationChanges,relationBetweenArticulators,location,movementRelatedOrientation,orientationRelatedToLocation,orientationChange,contactType,movementType'
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
  router.push(`/gloss/${glossId}`).catch((err: any) => {
    console.error(err)
  })
}

// Lifecycle
onMounted(async () => {
  await performSearch();
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
    <div class="col-12 col-md-3 q-pr-md full-height">
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
    <div class="col-12 col-md-9 full-height">
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

/* Add a subtle scrollbar style */
.filters-container::-webkit-scrollbar {
  width: 6px;
}

.filters-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.filters-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.filters-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style> 