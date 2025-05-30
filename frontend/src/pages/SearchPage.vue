<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { searchService, type SearchParams, type SearchResponse, type SearchResult } from 'src/services/search.service';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { LexicalCategory, Hand } from '../types/enums';
import translate from 'src/utils/translate'

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
const filterInputs = ref<Record<string, string>>({});

// Lexical categories for select
const lexicalCategories = Object.values(LexicalCategory);

// Hands options for toggle
const handsOptions = [
  { label: t('rightHand'), value: Hand.RIGHT },
  { label: t('leftHand'), value: Hand.LEFT },
  { label: t('bothHands'), value: Hand.BOTH }
];

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

function clearFilters() {
  selectedLexicalCategory.value = '';
  selectedHands.value = '';
  filterInputs.value = {};
  performSearch();
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
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">{{ t('search') }}</div>
          <q-input
            v-model="searchQuery"
            filled
            dense
            :label="t('searchSigns')"
            @keyup.enter="performSearch"
          >
            <template #append>
              <q-btn
                icon="search"
                flat
                round
                dense
                @click="performSearch"
              />
            </template>
          </q-input>
        </q-card-section>

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
                :disable="!selectedLexicalCategory && !selectedHands && Object.keys(filterInputs).length === 0"
              />
              <q-btn
                color="primary"
                dense
                :label="t('applyFilters')"
                @click="performSearch"
              />
            </div>
          </div>

          <!-- Lexical Category Select -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ t('lexicalCategory') }}</div>
            <q-select
              v-model="selectedLexicalCategory"
              :options="lexicalCategories"
              outlined
              dense
              emit-value
              map-options
              clearable
              options-dense
              :label="t('selectCategory')"
            />
          </div>

          <!-- Hands Toggle -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">{{ t('hands') }}</div>
            <q-btn-toggle
              v-model="selectedHands"
              :options="handsOptions"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              color="grey-3"
              text-color="grey-8"
              class="full-width"
            />
          </div>

          <!-- Text input filters -->
          <div class="q-gutter-y-sm">
            <q-input
              v-model="filterInputs.configuration"
              dense
              outlined
              :label="t('configuration')"
            />
            <q-input
              v-model="filterInputs.configurationChanges"
              dense
              outlined
              :label="t('configurationChanges')"
            />
            <q-input
              v-model="filterInputs.relationBetweenArticulators"
              dense
              outlined
              :label="t('relationBetweenArticulators')"
            />
            <q-input
              v-model="filterInputs.location"
              dense
              outlined
              :label="t('location')"
            />
            <q-input
              v-model="filterInputs.movementRelatedOrientation"
              dense
              outlined
              :label="t('movementRelatedOrientation')"
            />
            <q-input
              v-model="filterInputs.locationRelatedOrientation"
              dense
              outlined
              :label="t('locationRelatedOrientation')"
            />
            <q-input
              v-model="filterInputs.orientationChange"
              dense
              outlined
              :label="t('orientationChange')"
            />
            <q-input
              v-model="filterInputs.contactType"
              dense
              outlined
              :label="t('contactType')"
            />
            <q-input
              v-model="filterInputs.movementType"
              dense
              outlined
              :label="t('movementType')"
            />
            <q-input
              v-model="filterInputs.vocalization"
              dense
              outlined
              :label="t('vocalization')"
            />
            <q-input
              v-model="filterInputs.nonManualComponent"
              dense
              outlined
              :label="t('nonManualComponent')"
            />
            <q-input
              v-model="filterInputs.inicialization"
              dense
              outlined
              :label="t('inicialization')"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Main Content -->
    <div class="col-12 col-md-9">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1">
          {{ totalResults }} {{ t('resultsFound') }}
        </div>
        <q-toggle
          v-model="showDetails"
          :label="t('showConfigurationDetails')"
          color="primary"
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
          v-for="hit in searchResults?.hits"
          :key="hit.document.id"
          class="col-12"
        >
          <q-card>
            <q-card-section horizontal>
              <template v-if="hit.document.url">
                <q-card-section class="col-4">
                  <video
                    class="full-width"
                    :src="hit.document.url"
                    controls
                    preload="none"
                  />
                </q-card-section>
              </template>
              
              <q-card-section class="col">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-h6">{{ hit.document.gloss }}</div>
                    <div class="text-subtitle2">{{ hit.document.senseTitle }}</div>
                    
                    <q-chip
                      v-if="hit.document.lexicalCategory"
                      dense
                      color="primary"
                      text-color="white"
                      class="q-mt-sm"
                    >
                      {{ hit.document.lexicalCategory }}
                    </q-chip>
                  </div>
                  <q-btn
                    color="primary"
                    :label="t('viewDetails')"
                    @click="viewGlossDetails(hit.document.glossId)"
                  />
                </div>

                <q-expansion-item
                  v-if="showDetails"
                  :label="t('configurationDetails')"
                  dense
                  class="q-mt-md"
                >
                  <q-card>
                    <q-card-section>
                      <div v-if="hit.document.hands">
                        <div class="text-caption text-grey">{{ t('hands') }}</div>
                        <div class="q-mb-xs">{{ hit.document.hands }}</div>
                      </div>
                      <div v-if="hit.document.lexicalCategory">
                        <div class="text-caption text-grey">{{ t('lexicalCategory') }}</div>
                        <div class="q-mb-xs">{{ hit.document.lexicalCategory }}</div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="flex flex-center q-mt-lg">
        <q-pagination
          v-if="totalResults > perPage"
          v-model="page"
          :max="Math.ceil(totalResults / perPage)"
          :max-pages="6"
          boundary-numbers
          @update:model-value="performSearch"
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.q-expansion-item :deep(.q-item) {
  padding: 4px 0;
}
</style> 