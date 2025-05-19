<template>
  <q-card-section class="q-gutter-y-md">
    <q-card
      v-for="relatedGloss in relatedGlosses"
      :key="relatedGloss.id"
      dense
      class="column"
      flat
      bordered
    >
      <q-card-section class="row justify-between">
        <div>
          <q-chip outline>
            {{ relatedGloss.relationType }}
          </q-chip>
          <div class="text-h6">
            {{ relatedGloss.relatedGloss.gloss }}
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
import type { RelatedGloss } from 'src/types/models';

const { relatedGlosses } = defineProps<{
  relatedGlosses: RelatedGloss[];
}>();
</script>
