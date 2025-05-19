<template>
  <q-card-section class="q-gutter-y-md">
    <q-card
      v-for="minimalPair in minimalPairs"
      :key="minimalPair.id"
      dense
      class="column"
      flat
      bordered
    >
      <q-card-section class="row justify-between">
        <div>
          <q-chip outline>
            {{ minimalPair.distinction }}
          </q-chip>
          <div class="text-h6">
            {{ minimalPair.minimalPairGlossData.gloss }}
          </div>
        </div>
        <div>
          <q-btn
            outline
            :label="translate('viewGloss')"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import type { MinimalPair } from 'src/types/models';

const { minimalPairs } = defineProps<{
  minimalPairs: MinimalPair[];
}>();
</script>
