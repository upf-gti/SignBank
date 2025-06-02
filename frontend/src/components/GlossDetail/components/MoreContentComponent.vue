<template>
  <q-card-section class="column justify-start items-start col q-pt-none">
    <q-btn-toggle
      v-model="selectedContent"
      unelevated
      toggle-color="primary"
      class="q-mb-md"
      :style="{
        border: '1px solid #e0e0e0',
      }"
      :options="[
        {
          label: translate('definitions'),
          value: 'definitions',
        },
        {
          label: translate('examples'),
          value: 'examples',
        },
        {
          label: translate('videos'),
          value: 'videos',
        },
        {
          label: translate('relatedGlosses'),
          value: 'relatedGlosses',
        },
        {
          label: translate('technicalTerms'),
          value: 'technicalTerms',
        },
      ]"
    />
    <q-card
      class="full-width"
      flat
      bordered
      :style="{
        maxHeight: '80dvh',
        overflow: 'auto',
      }"
    >
      <DefinitionsComponent
        v-if="selectedContent === 'definitions'"
        v-model="sense"
        :edit-mode="editMode"
        :allow-edit="editMode"
        :sense="sense"
        @update:glossData="updateGlossData"
      />
      <ExamplesComponent
        v-if="selectedContent === 'examples'"
        v-model="sense"
        :edit-mode="editMode"
      />
      <VideosComponent
        v-if="selectedContent === 'videos'"
        v-model="sense"
        :edit-mode="editMode"
      />
      <RelatedGlosses
        v-if="selectedContent === 'relatedGlosses'" 
        :related-glosses="glossData.relationsAsSource as RelatedGloss[]"
        :minimal-pairs="glossData.minimalPairsAsSource"
        :edit-mode="editMode"
      />
      <q-card-section v-if="selectedContent === 'technicalTerms'">
        <div class="text-h6">
          {{ translate('technicalTerms') }}
        </div>
      </q-card-section>
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import DefinitionsComponent from './DefinitionsComponent.vue';
import translate from 'src/utils/translate';
import { ref } from 'vue';
import { Sense } from 'src/types/models';
import type { RelatedGloss, MinimalPair } from 'src/types/gloss';
import type { GlossData } from 'src/types/models';
import ExamplesComponent from './ExamplesComponent.vue';
import VideosComponent from './VideosComponent.vue';
import RelatedGlosses from './RelatedGlosses.vue';

const selectedContent = ref<string>('definitions')
const sense = defineModel<Sense>({ required: true })
const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void
}>();

const { glossData, editMode } = defineProps<{
  glossData: GlossData;
  editMode: boolean;
}>();

const updateGlossData = (glossData: GlossData) => {
  emit('update:glossData', glossData);
}
</script>