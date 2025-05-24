<template>
  <q-card flat style="max-width: 1200px">
    <GlossHeader :gloss-data="glossData" :edit-mode="editMode" @edit-gloss="editGloss" @save-gloss="saveGloss" @cancel-gloss="cancelGloss" />
    <SenseSelector
      v-model="selectedSenseId"
      :senses="glossData.senses"
      :edit-mode="editMode"
      @add-sense="addSense"
    />
    <MainContent
      v-if="editMode === 'none' && selectedSense"
      :selected-sense="selectedSense"
    />
    <MoreContentComponent
      :sense="selectedSense"
      :gloss-data="glossData"
      :edit-mode="editMode"
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

const emit = defineEmits<{
  (e: 'update:editMode', mode: 'none' | 'strict' | 'full'): void
}>()

const { glossData, editMode } = defineProps<{
  glossData: GlossData,
  editMode: "strict" | "full" | "none"
}>()

const selectedSenseId = ref<string>(glossData.senses[0]?.id as string)
const selectedSense = computed<Sense>(() => glossData.senses.find((sense) => sense.id === selectedSenseId.value) as Sense) 

const editGloss = () => {
  emit('update:editMode', 'strict')
}

const saveGloss = () => {
  emit('update:editMode', 'none')
}

const cancelGloss = () => {
  emit('update:editMode', 'none')
}

const addSense = (sense: { senseTitle: string, lexicalCategory: string }) => {
  glossData.senses.push({
    id: Date.now().toString(),
    senseTitle: sense.senseTitle,
    priority: glossData.senses.length + 1,
    lexicalCategory: sense.lexicalCategory,
    glossDataId: glossData.id,
    definitions: [],
    signVideos: [],
    examples: [],
    senseTranslations: [],
  })
  selectedSenseId.value = glossData.senses[glossData.senses.length - 1]?.id as string
}
</script>
