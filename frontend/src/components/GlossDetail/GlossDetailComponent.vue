<template>
  <q-card flat>
    <GlossHeader :gloss-data="glossData" />
    <SenseSelector
      v-model="selectedSenseId"
      :senses="glossData.senses"
    />
    <MainContent :selected-sense="selectedSense" />
    <MoreContentComponent

      :sense="selectedSense"
      :gloss-data="glossData"
    />
  </q-card>
</template>

<script setup lang="ts">
import { GlossData, Sense } from 'src/types/models'
import GlossHeader from './components/GlossHeader.vue'
import { ref, computed } from 'vue'
import SenseSelector from './components/SenseSelector.vue';
import MainContent from './components/MainContent.vue';
import MoreContentComponent from './components/MoreContentComponent.vue';
const { glossData } = defineProps<{
  glossData: GlossData
}>()

const selectedSenseId = ref<string>(glossData.senses[0]?.id as string)
const selectedSense = computed<Sense | undefined>(() => glossData.senses.find((sense) => sense.id === selectedSenseId.value))

</script>
