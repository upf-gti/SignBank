<template>
  <q-card-section
    class="justify-around no-wrap"
  >
    <q-btn-toggle
      v-if="$q.screen.lt.md"
      v-model="selectedContent"
      class="no-wrap"
      spread
      :options="[
        { label: 'Related Glosses', value: 'relatedGlosses' },
        { label: 'Minimal Pairs', value: 'minimalPairs' },
      ]"
    />
    <q-card
      v-if="$q.screen.gt.md || selectedContent === 'relatedGlosses'"
      class="col-12 col-sm-6 q-ma-sm"
      flat
      bordered
    >
      <q-card-section class="row justify-between items-center">
        <q-item-label class="text-h6">
          {{ translate('relatedGlosses') }}
        </q-item-label>
        <q-btn
          v-if="editMode !== 'none'"
          flat
          round
          icon="add"
          @click="showAddRelatedGlossDialog = true"
        />
      </q-card-section>
      <RelatedGlossesList 
        :related-glosses="relatedGlosses" 
        :edit-mode="editMode"
        @remove-relation="removeRelation"
      />
    </q-card>
    <q-card
      v-if="$q.screen.gt.md || selectedContent === 'minimalPairs'"
      class="col-12 col-sm-6 q-ma-sm"
      flat
      bordered
    >
      <q-card-section class="row justify-between items-center">
        <q-item-label class="text-h6">
          {{ translate('minimalPairs') }}
        </q-item-label>
        <q-btn
          v-if="editMode !== 'none'"
          flat
          round
          icon="add"
          @click="showAddMinimalPairDialog = true"
        />
      </q-card-section>
      <MinimalPairsList 
        :minimal-pairs="minimalPairs" 
        :edit-mode="editMode"
        @remove-pair="removePair"
      />
    </q-card>

    <!-- Dialog for adding related glosses -->
    <q-dialog v-model="showAddRelatedGlossDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ translate('addRelatedGloss') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="newRelation.relationType"
            :options="relationTypes"
            :label="translate('relationType')"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="glossSearch"
            :label="translate('searchGloss')"
            outlined
            dense
            @update:model-value="searchGlosses"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-list v-if="searchResults.length > 0" bordered separator class="q-mt-sm">
            <q-item
              v-for="result in searchResults"
              :key="result.id"
              clickable
              v-close-popup
              @click="selectGloss(result)"
            >
              <q-item-section>
                <q-item-label>{{ result.gloss }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="translate('cancel')" color="primary" v-close-popup />
          <q-btn flat :label="translate('add')" color="primary" @click="addRelation" :disable="!newRelation.relatedGlossId" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog for adding minimal pairs -->
    <q-dialog v-model="showAddMinimalPairDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ translate('addMinimalPair') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newPair.distinction"
            :label="translate('distinction')"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="videoSearch"
            :label="translate('searchVideo')"
            outlined
            dense
            @update:model-value="searchVideos"
          >
            <template #append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-list v-if="videoSearchResults.length > 0" bordered separator class="q-mt-sm">
            <q-item
              v-for="result in videoSearchResults"
              :key="result.id"
              clickable
              v-close-popup
              @click="selectVideo(result)"
            >
              <q-item-section>
                <q-item-label>{{ result.title }}</q-item-label>
                <q-item-label caption>{{ result.gloss }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="translate('cancel')" color="primary" v-close-popup />
          <q-btn flat :label="translate('add')" color="primary" @click="addMinimalPair" :disable="!newPair.signVideoId" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card-section>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import RelatedGlossesList from './RelatedGlossesList.vue';
import MinimalPairsList from './MinimalPairsList.vue';
import type { RelatedGloss, MinimalPair } from 'src/types/models';
import { ref } from 'vue';
import { api } from 'src/services/api';

interface SearchResult {
  id: string;
  gloss: string;
  title?: string;
  glossDataId?: string;
}

const selectedContent = ref('relatedGlosses');

const { relatedGlosses, minimalPairs, editMode } = defineProps<{
  relatedGlosses: RelatedGloss[];
  minimalPairs: MinimalPair[];
  editMode: "strict" | "full" | "none";
}>();

const emit = defineEmits<{
  (e: 'add-relation', relation: Partial<RelatedGloss>): void;
  (e: 'remove-relation', id: string): void;
  (e: 'add-minimal-pair', pair: Partial<MinimalPair>): void;
  (e: 'remove-pair', id: string): void;
}>();

// Related glosses
const showAddRelatedGlossDialog = ref(false);
const glossSearch = ref('');
const searchResults = ref<SearchResult[]>([]);
const newRelation = ref({
  relationType: '',
  relatedGlossId: ''
});

const relationTypes = [
  'synonym',
  'antonym',
  'homonym',
  'variant'
];

// Minimal pairs
const showAddMinimalPairDialog = ref(false);
const videoSearch = ref('');
const videoSearchResults = ref<SearchResult[]>([]);
const newPair = ref({
  distinction: '',
  signVideoId: '',
  minimalPairGlossDataId: ''
});

const searchGlosses = async () => {
  if (glossSearch.value.length < 2) return;
  try {
    const response = await api.glosses.search(glossSearch.value);
    searchResults.value = response.data;
  } catch (error) {
    console.error('Error searching glosses:', error);
  }
};

const selectGloss = (gloss: SearchResult) => {
  newRelation.value.relatedGlossId = gloss.id;
  showAddRelatedGlossDialog.value = false;
  emit('add-relation', newRelation.value);
  // Reset form
  newRelation.value = {
    relationType: '',
    relatedGlossId: ''
  };
};

const searchVideos = async () => {
  if (videoSearch.value.length < 2) return;
  try {
    const response = await api.videos.search(videoSearch.value);
    videoSearchResults.value = response.data;
  } catch (error) {
    console.error('Error searching videos:', error);
  }
};

const selectVideo = (video: SearchResult) => {
  if (!video.glossDataId) return;
  newPair.value.signVideoId = video.id;
  newPair.value.minimalPairGlossDataId = video.glossDataId;
  showAddMinimalPairDialog.value = false;
  emit('add-minimal-pair', newPair.value);
  // Reset form
  newPair.value = {
    distinction: '',
    signVideoId: '',
    minimalPairGlossDataId: ''
  };
};

const removeRelation = (id: string) => {
  emit('remove-relation', id);
};

const removePair = (id: string) => {
  emit('remove-pair', id);
};

const addRelation = () => {
  if (!newRelation.value.relatedGlossId || !newRelation.value.relationType) return;
  emit('add-relation', newRelation.value);
  showAddRelatedGlossDialog.value = false;
  // Reset form
  newRelation.value = {
    relationType: '',
    relatedGlossId: ''
  };
};

const addMinimalPair = () => {
  if (!newPair.value.signVideoId || !newPair.value.distinction || !newPair.value.minimalPairGlossDataId) return;
  emit('add-minimal-pair', newPair.value);
  showAddMinimalPairDialog.value = false;
  // Reset form
  newPair.value = {
    distinction: '',
    signVideoId: '',
    minimalPairGlossDataId: ''
  };
};
</script>
