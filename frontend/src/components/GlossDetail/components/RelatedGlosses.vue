<template>
  <q-card-section class="related-glosses">
    <div class="text-h5 q-mb-md">
      {{ t('relatedGlosses') }}
    </div>

    <!-- Tabs for Relations and Minimal Pairs -->
    <q-tabs
      v-model="selectedTab"
      class="text-primary"
      indicator-color="primary"
      active-color="primary"
      align="justify"
    >
      <q-tab
        name="relations"
        :label="t('relations')"
        icon="link"
      />
      <q-tab
        name="minimal-pairs"
        :label="t('minimalPairs')"
        icon="compare"
      />
    </q-tabs>

    <q-separator />

    <!-- Error Alert -->
    <q-banner
      v-if="error"
      class="bg-negative text-white q-my-md"
      rounded
    >
      {{ error }}
      <template #action>
        <q-btn
          flat
          color="white"
          label="Dismiss"
          @click="error = null"
        />
      </template>
    </q-banner>

    <q-tab-panels
      v-model="selectedTab"
      animated
      class="q-mt-md"
    >
      <!-- Relations Panel -->
      <q-tab-panel name="relations">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">
            {{ t('relations') }}
            <q-badge
              color="primary"
              :label="relatedGlosses.length"
              class="q-ml-sm"
            />
          </div>
          <q-btn
            v-if="editMode"
            color="primary"
            :label="t('addRelation')"
            icon="add_link"
            :loading="loading"
            @click="showRelationDialog = true"
          />
        </div>

        <div
          v-if="relatedGlosses.length === 0"
          class="text-center q-pa-md text-grey"
        >
          <q-icon
            name="link_off"
            size="48px"
            class="q-mb-md"
          />
          <div>{{ t('noRelations') }}</div>
        </div>

        <div
          v-else
          class="row q-col-gutter-md"
        >
          <div
            v-for="relation in relatedGlosses"
            :key="relation.id || Math.random()"
            class="col-12"
          >
            <RelatedGlossCard
              :gloss="relation"
              :edit-mode="editMode"
              @view="viewGloss"
              @delete="removeRelation"
            />
          </div>
        </div>
      </q-tab-panel>

      <!-- Minimal Pairs Panel -->
      <q-tab-panel name="minimal-pairs">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">
            {{ t('minimalPairs') }}
            <q-badge
              color="primary"
              :label="minimalPairs.length"
              class="q-ml-sm"
            />
          </div>
          <q-btn
            v-if="editMode"
            color="primary"
            :label="t('addMinimalPair')"
            icon="add"
            :loading="loading"
            @click="showMinimalPairDialog = true"
          />
        </div>

        <div
          v-if="minimalPairs.length === 0"
          class="text-center q-pa-md text-grey"
        >
          <q-icon
            name="compare_arrows"
            size="48px"
            class="q-mb-md"
          />
          <div>{{ t('noMinimalPairs') }}</div>
        </div>

        <div
          v-else
          class="row q-col-gutter-md"
        >
          <div
            v-for="pair in minimalPairs"
            :key="pair.id || Math.random()"
            class="col-12"
          >
            <MinimalPairCard
              :pair="pair"
              :edit-mode="editMode"
              @view="viewGloss"
              @delete="removeMinimalPair"
            />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Search Dialog -->
    <GlossSearch
      v-model="showRelationDialog"
      :title="t('addRelation')"
      :loading="loading"
      @select="handleRelationSelect"
    />

    <GlossSearch
      v-model="showMinimalPairDialog"
      :title="t('addMinimalPair')"
      :loading="loading"
      @select="handleMinimalPairSelect"
    />

    <!-- Relation Type Dialog -->
    <q-dialog v-model="showRelationTypeDialog">
      <q-card class="relation-type-dialog">
        <q-card-section>
          <div class="text-h6">
            {{ t('selectRelationType') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="selectedRelationType"
            :options="relationTypes"
            :label="t('relationType')"
            outlined
            emit-value
            map-options
            :options-dense="true"
            :loading="loading"
            :disable="loading"
            option-value="value"
            option-label="label"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="t('cancel')"
            color="primary"
            :disable="loading"
          />
          <q-btn
            flat
            :label="t('add')"
            color="primary"
            :disable="!selectedRelationType || loading"
            @click="handleAddRelation"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Distinction Dialog -->
    <q-dialog v-model="showDistinctionDialog">
      <q-card class="distinction-dialog">
        <q-card-section>
          <div class="text-h6">
            {{ t('enterDistinction') }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="distinction"
            :label="t('distinction')"
            outlined
            dense
            autofocus
            :disable="loading"
            :rules="[val => !!val || t('distinctionRequired')]"
          >
            <template #hint>
              {{ t('distinctionHint') }}
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="t('cancel')"
            color="primary"
            :disable="loading"
          />
          <q-btn
            flat
            :label="t('add')"
            color="primary"
            :disable="!distinction || loading"
            @click="handleAddMinimalPair"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card-section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import translate from 'src/utils/translate';
import { useGlossRelations } from 'src/composables/useGlossRelations';
import GlossSearch from './GlossSearch.vue';
import RelatedGlossCard from './RelatedGlossCard.vue';
import MinimalPairCard from './MinimalPairCard.vue';
import type { RelatedGloss, MinimalPair, SearchResult } from 'src/types/gloss';

const t = (key: string) => translate(key);
const router = useRouter();

const props = defineProps<{
  relatedGlosses: RelatedGloss[];
  minimalPairs: MinimalPair[];
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'add-relation', relatedGloss: RelatedGloss): void;
  (e: 'remove-relation', id: string): void;
  (e: 'add-minimal-pair', minimalPair: MinimalPair): void;
  (e: 'remove-pair', id: string): void;
}>();

// UI state
const selectedTab = ref('relations');
const showRelationDialog = ref(false);
const showMinimalPairDialog = ref(false);
const showRelationTypeDialog = ref(false);
const showDistinctionDialog = ref(false);

const {
  selectedGloss,
  selectedRelationType,
  distinction,
  loading,
  error,
  relationTypes,
  addRelation,
  addMinimalPair,
  removeRelation,
  removeMinimalPair
} = useGlossRelations(
  props.relatedGlosses,
  props.minimalPairs,
  (gloss) => emit('add-relation', gloss),
  (id) => emit('remove-relation', id),
  (pair) => emit('add-minimal-pair', pair),
  (id) => emit('remove-pair', id)
);

function viewGloss(glossId: string) {
  router.push(`/gloss/${glossId}`).catch((err: any) => {
    console.error(err)
  })
}

async function handleRelationSelect(gloss: SearchResult) {
  selectedGloss.value = gloss;
  showRelationDialog.value = false;
  showRelationTypeDialog.value = true;
}

async function handleMinimalPairSelect(gloss: SearchResult) {
  selectedGloss.value = gloss;
  showMinimalPairDialog.value = false;
  showDistinctionDialog.value = true;
}

async function handleAddRelation() {
  const success = await addRelation();
  if (success) {
    showRelationTypeDialog.value = false;
  }
}

async function handleAddMinimalPair() {
  const success = await addMinimalPair();
  if (success) {
    showDistinctionDialog.value = false;
  }
}
</script>

<style scoped>
.related-glosses {
  max-width: 1200px;
  margin: 0 auto;
}

.relation-type-dialog,
.distinction-dialog {
  min-width: 400px;
  max-width: 90vw;
}

@media (max-width: 600px) {
  .relation-type-dialog,
  .distinction-dialog {
    min-width: 300px;
  }
}
</style>
