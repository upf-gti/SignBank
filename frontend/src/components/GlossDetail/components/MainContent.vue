<template>
  <q-card-section class="row justify-between items-center">
    <q-card
      class="col"
      flat
    >
      <q-card-section class="row justify-start items-center">
        <q-chip
          outline
          color="primary"
        >
          {{ translate(selectedSense?.lexicalCategory) }}
        </q-chip>
        <span class="text-h6">
          {{ selectedSense?.senseTitle }}
        </span>
      </q-card-section>
      <q-card-section class="column">
        <GlossVideoComponent
          v-if="selectedSense?.signVideos?.[0]"
          :sign-video="selectedSense.signVideos.sort((a, b) => a.priority - b.priority)[0] || selectedSense.signVideos[0]"
          :edit-mode="false"
        />
      </q-card-section>
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense } from 'src/types/models'
import GlossVideoComponent from './GlossVideoComponent.vue'
import translate from 'src/utils/translate';

const { selectedSense } = defineProps<{
  selectedSense: Sense
}>()

</script>

<style scoped>
.full-height {
  height: 100%;
}
</style>
