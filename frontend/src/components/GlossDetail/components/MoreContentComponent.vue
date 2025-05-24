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
        :sense="sense"
        :edit-mode="editMode"
      />
      <ExamplesComponent
        v-if="selectedContent === 'examples'"
        :sense="sense"
        :edit-mode="editMode"
      />
      <VideosComponent
        v-if="selectedContent === 'videos'"
        :sense="sense"
        :edit-mode="editMode"
      />
      <RelatedGlosses
        v-if="selectedContent === 'relatedGlosses'"
        :related-glosses="glossData.relatedGlosses"
        :minimal-pairs="glossData.minimalPairs"
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
import { Sense, GlossData } from 'src/types/models';
import ExamplesComponent from './ExamplesComponent.vue';
import VideosComponent from './VideosComponent.vue';
import RelatedGlosses from './RelatedGlosses.vue';

const selectedContent = ref<string>('definitions')

const { sense, glossData, editMode } = defineProps<{
  sense: Sense;
  glossData: GlossData;
  editMode: "strict" | "full" | "none";
}>();
</script>