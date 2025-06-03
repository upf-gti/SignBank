<template>
  <q-card
    flat
    style="max-width: 1200px"
  >
    <GlossHeader
      :gloss-data="glossData"
      :edit-mode="editMode"
      :allow-edit="allowEdit"
      :is-confirm-request-page="isConfirmRequestPage"
      @edit-gloss="editGloss"
      @save-gloss="saveGloss"
      @cancel-gloss="cancelGloss"
      @accept-request="acceptRequest"
      @decline-request="declineRequest"
    />
    <SenseSelector
      v-model="selectedSenseId"
      :senses="glossData.senses"
      :edit-mode="editMode"
      :gloss-data="glossData"
      @update:gloss-data="handleGlossDataUpdate"
    />
    <MainContent
      v-if="!editMode && selectedSense"
      :selected-sense="selectedSense"
    />
    <MoreContentComponent
      v-if="glossData.senses.length > 0"
      v-model="selectedSense"
      :gloss-data="glossData"
      :edit-mode="editMode"
      @update:gloss-data="handleGlossDataUpdate"
    />
  </q-card>
</template>

<script setup lang="ts">
import { GlossData, Sense } from 'src/types/models'
import type { RelatedGloss, MinimalPair } from 'src/types/gloss'
import GlossHeader from './components/GlossHeader.vue'
import { ref, computed } from 'vue'
import SenseSelector from './components/SenseSelector.vue';
import MainContent from './components/MainContent.vue';
import MoreContentComponent from './components/MoreContentComponent.vue';
import { validateGloss } from 'src/utils/glossValidation';
import { useQuasar } from 'quasar';
import translate from 'src/utils/translate'

const emit = defineEmits<{
  (e: 'update:editMode', mode: boolean): void
  (e: 'saveGloss', glossData: GlossData): void
  (e: 'acceptRequest', glossData: GlossData): void
  (e: 'declineRequest'): void
}>()

const { glossData, editMode, allowEdit = true, isConfirmRequestPage = false } = defineProps<{
  glossData: GlossData,
  editMode: boolean,
  allowEdit: boolean,
  isConfirmRequestPage?: boolean
}>()

const selectedSenseId = ref<string>(glossData.senses[0]?.id as string)
const selectedSense = computed<Sense>(() => glossData.senses.find((sense) => sense.id === selectedSenseId.value) as Sense) 
const $q = useQuasar()

const editGloss = () => {
  if (!allowEdit) return
  emit('update:editMode', true)
}

const saveGloss = () => {
  if (!allowEdit) return

  // Validate the gloss data
  const validationErrors = validateGloss(glossData)
  
  if (validationErrors.length > 0) {
    // Show validation errors to the user
    $q.dialog({
      title: translate('validationErrors'),
      message: `
        <ul style="list-style-type: disc; margin: 0; padding-left: 20px;">
          ${validationErrors.map(error => `<li>${error.message}</li>`).join('')}
        </ul>
      `,
      html: true,
      style: 'min-width: 300px',
      ok: {
        label: translate('ok'),
        flat: true,
        color: 'primary'
      }
    })
    return
  }

  emit('saveGloss', glossData)
}

const cancelGloss = () => {
  if (!allowEdit) return
  emit('update:editMode', false)
}

const acceptRequest = () => {

  // Validate the gloss data
  const validationErrors = validateGloss(glossData)

  if (validationErrors.length > 0) {
    // Show validation errors to the user
    $q.dialog({
      title: translate('validationErrors'),
      message: `
        <ul style="list-style-type: disc; margin: 0; padding-left: 20px;">
          ${validationErrors.map(error => `<li>${error.message}</li>`).join('')}
        </ul>
      `,
      html: true,
      style: 'min-width: 300px',
      ok: {
        label: translate('ok'),
        flat: true,
        color: 'primary'
      }
    })
    return
  }
  emit('acceptRequest', glossData )
}

const declineRequest = () => {
  emit('declineRequest')
}

const handleGlossDataUpdate = (updatedGlossData: GlossData) => {
  // Update the local glossData with the new data
  Object.assign(glossData, updatedGlossData)
}


</script>
