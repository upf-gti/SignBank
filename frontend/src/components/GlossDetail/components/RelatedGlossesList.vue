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
        <div class="row items-center">
          <q-btn
            outline
            :label="translate('viewGloss')"
            class="q-mr-sm"
            @click="$router.push(`/gloss/${relatedGloss.relatedGlossId}`)"
          />
          <q-btn
            v-if="editMode !== 'none'"
            flat
            round
            icon="delete"
            color="negative"
            @click="$emit('remove-relation', relatedGloss.id)"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import type { RelatedGloss } from 'src/types/models';
import { useRouter } from 'vue-router';

const $router = useRouter();

const { relatedGlosses, editMode } = defineProps<{
  relatedGlosses: RelatedGloss[];
  editMode: "strict" | "full" | "none";
}>();

defineEmits<{
  (e: 'remove-relation', id: string): void;
}>();
</script>
