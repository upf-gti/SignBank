<template>
  <q-card-section class="row justify-between items-center">
    <q-card
      class="col"
      flat
    >
      <q-card-section
        v-if="primaryDefinition"
        class="row justify-start items-center"
      >
        <q-chip
          outline
          color="primary"
        >
          {{ translate(primaryDefinition.lexicalCategory) }}
        </q-chip>
        <span class="text-h6">
          {{ primaryDefinition.title || glossData.gloss }}
        </span>
      </q-card-section>
      <q-card-section class="column">
        <GlossVideoComponent
          v-if="glossData?.glossVideos?.[0]"
          :sign-video="glossData.glossVideos.sort((a, b) => a.priority - b.priority)[0] || glossData.glossVideos[0]"
          :edit-mode="false"
        />
      </q-card-section>
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GlossData } from 'src/types/models'
import GlossVideoComponent from './GlossVideoComponent.vue'
import translate from 'src/utils/translate';

const { glossData } = defineProps<{
  glossData: GlossData
}>()

const primaryDefinition = computed(() =>
  [...(glossData.definitions || [])].sort((a, b) => a.priority - b.priority)[0]
)
</script>

<style scoped>
.full-height {
  height: 100%;
}
</style>
