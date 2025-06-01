<template>
  <q-dialog
    v-model="showDialog"
    persistent
    maximized
  >
    <q-card class="column no-wrap">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section class="row q-pa-md">
        <!-- Left Sidebar -->
        <div class="col-12 col-md-3 q-pr-md">
          <q-card flat bordered>
            <SearchInput
              :model-value="searchQuery"
              @update:model-value="updateSearchQuery"
              @search="performSearch"
            />

            <q-separator />

            <q-card-section>
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
                    :disable="!hasActiveFilters"
                    @click="clearFilters"
                  />
                  <q-btn
                    color="primary"
                    dense
                    :label="t('applyFilters')"
                    @click="performSearch"
                  />
                </div>
              </div>

              <FilterCategories
                :selected-category="selectedCategory"
                @update:selected-category="updateCategory"
              />

              <FilterInputs
                :model-value="filterInputs"
                @update:model-value="updateFilterInputs"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Main Content -->
        <div class="col-12 col-md-9">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1">
              {{ totalResults }} {{ t('resultsFound') }}
            </div>
          </div>

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
            class="row q-col-gutter-md"
          >
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
                        :src="getVideoUrl(hit.document.url)"
                        preload="none"            
                        loop
                        autoplay
                      />
                    </q-card-section>
                  </template>
                  
                  <q-card-section class="col">
                    <div class="row items-center justify-between">
                      <div>
                        <div class="text-h6">
                          {{ hit.document.gloss }}
                        </div>
                        <div class="text-subtitle2">
                          {{ hit.document.senseTitle }}
                        </div>
                        
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
                        :label="t('select')"
                        @click="selectGloss(hit.document)"
                      />
                    </div>
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="flex flex-center q-mt-lg">
            <q-pagination
              v-if="totalResults > perPage"
              :model-value="page"
              :max="Math.ceil(totalResults / perPage)"
              :max-pages="6"
              boundary-numbers
              @update:model-value="updatePage"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import translate from 'src/utils/translate';
import { searchService, type SearchParams, type SearchResult } from 'src/services/search.service';
import { getVideoUrl } from 'src/utils/videoUrl';
import SearchInput from 'src/components/Search/components/SearchInput.vue';
import FilterCategories from 'src/components/Search/components/FilterCategories.vue';
import FilterInputs from 'src/components/Search/components/FilterInputs.vue';
import type { FilterInputs as FilterInputsType } from 'src/components/Search/types';

const t = (key: string) => translate(key);

interface Props {
  title: string;
  modelValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  modelValue: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', gloss: SearchResult): void;
}>();

// Search state
const searchQuery = ref('');
const searchResults = ref<any>(null);
const loading = ref(false);
const page = ref(1);
const perPage = ref(20);
const selectedCategory = ref('');
const filterInputs = ref<FilterInputsType>({
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

// Computed
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const hasResults = computed(() => {
  return searchResults.value?.hits && searchResults.value.hits.length > 0;
});

const totalResults = computed(() => {
  return searchResults.value?.found || 0;
});

const hasActiveFilters = computed(() => {
  return selectedCategory.value !== '' || 
    Object.values(filterInputs.value).some(value => value !== '');
});

// Methods
async function performSearch() {
  try {
    loading.value = true;
    const filters = [];
    
    if (selectedCategory.value) {
      filters.push(`lexicalCategory:='${selectedCategory.value}'`);
    }
    
    for (const [field, value] of Object.entries(filterInputs.value)) {
      if (value.trim()) {
        filters.push(`${field}:='${value.trim()}'`);
      }
    }

    const params: SearchParams = {
      query: searchQuery.value || '*',
      page: Number(page.value),
      limit: Number(perPage.value),
      filter_by: filters.join(' && ') || undefined,
      facet_by: 'lexicalCategory,hands'
    };
    
    searchResults.value = await searchService.search(params);
  } catch (error) {
    console.error('Error performing search:', error);
  } finally {
    loading.value = false;
  }
}

function updateSearchQuery(value: string) {
  searchQuery.value = value;
}

function updateCategory(value: string) {
  selectedCategory.value = value;
}

function updateFilterInputs(value: FilterInputsType) {
  filterInputs.value = value;
}

function updatePage(value: number) {
  page.value = value;
  performSearch();
}

function clearFilters() {
  selectedCategory.value = '';
  filterInputs.value = {
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
  };
  performSearch();
}

function selectGloss(gloss: SearchResult) {
  emit('select', gloss);
  showDialog.value = false;
}
</script> 