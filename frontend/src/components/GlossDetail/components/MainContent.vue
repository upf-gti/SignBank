<template>
  <q-card-section class="row justify-between items-center">
    <q-card
      class="col-12 col-md-8"
      flat
      bordered
    >
      <q-card-section class="row justify-start items-center">
        <q-chip
          outline
          color="primary"
        >
          {{ selectedSense?.lexicalCategory }}
        </q-chip>
        <span class="text-h6">
          {{ selectedSense?.senseTitle }}
        </span>
      </q-card-section>
      <q-card-section class="column">
        <GlossVideoComponent
          :sign-video="selectedSense?.signVideos[0]"
        />
      </q-card-section>
    </q-card>
    <q-card
      class="col-12 col-md-4 full-height"
      flat
      bordered
    >
      <div class="full-height">
        quick info
      </div>
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense } from 'src/types/models'
import GlossVideoComponent from './GlossVideoComponent.vue'
const { selectedSense } = defineProps<{
  selectedSense: Sense
}>()
</script>
