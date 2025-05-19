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
      <q-card-section>
        <q-item-label class="text-h6">
          {{ translate('relatedGlosses') }}
        </q-item-label>
      </q-card-section>
      <RelatedGlossesList :related-glosses="relatedGlosses" />
    </q-card>
    <q-card
      v-if="$q.screen.gt.md || selectedContent === 'minimalPairs'"
      class="col-12 col-sm-6 q-ma-sm"
      flat
      bordered
    >
      <q-card-section>
        <q-item-label class="text-h6">
          {{ translate('minimalPairs') }}
        </q-item-label>
      </q-card-section>
      <MinimalPairsList :minimal-pairs="minimalPairs" />
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import RelatedGlossesList from './RelatedGlossesList.vue';
import MinimalPairsList from './MinimalPairsList.vue';
import type { RelatedGloss, MinimalPair } from 'src/types/models';
import { ref } from 'vue';

const selectedContent = ref('relatedGlosses');

const { relatedGlosses, minimalPairs } = defineProps<{
  relatedGlosses: RelatedGloss[];
  minimalPairs: MinimalPair[];
}>();
</script>
