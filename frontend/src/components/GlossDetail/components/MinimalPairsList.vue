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
        <div class="row items-center">
          <q-btn
            outline
            :label="translate('viewGloss')"
            class="q-mr-sm"
            @click="$router.push(`/gloss/${minimalPair.minimalPairGlossDataId}`)"
          />
          <q-btn
            v-if="editMode"
            flat
            round
            icon="delete"
            color="negative"
            @click="$emit('remove-pair', minimalPair.id)"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import type { MinimalPair } from 'src/types/models';
import { useRouter } from 'vue-router';

const $router = useRouter();

const { minimalPairs, editMode } = defineProps<{
  minimalPairs: MinimalPair[];
  editMode: boolean;
}>();

defineEmits<{
  (e: 'remove-pair', id: string): void;
}>();
</script>
