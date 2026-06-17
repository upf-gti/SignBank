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
      :request-status="requestStatus"
      :submitting="submitting"
      @edit-gloss="editGloss"
      @cancel-gloss="cancelGloss"
      @update:gloss-data="handleGlossDataUpdate"
      @accept-request="acceptRequest"
      @decline-request="declineRequest"
      @submit-request="submitRequest"
    />
    <MainContent
      v-if="!editMode"
      :gloss-data="glossData"
    />
    <MoreContentComponent
      :gloss-data="glossData"
      :edit-mode="editMode"
      @update:gloss-data="handleGlossDataUpdate"
    />
  </q-card>
</template>

<script setup lang="ts">
import { GlossData, RequestStatus } from 'src/types/models'
import GlossHeader from './components/GlossHeader.vue'
import MainContent from './components/MainContent.vue';
import MoreContentComponent from './components/MoreContentComponent.vue';
import { validateGloss } from 'src/utils/glossValidation';
import { useQuasar } from 'quasar';
import translate from 'src/utils/translate'

const emit = defineEmits<{
  (e: 'update:editMode', mode: boolean): void
  (e: 'update:glossData', glossData: GlossData): void
  (e: 'acceptRequest', glossData: GlossData): void
  (e: 'declineRequest'): void
  (e: 'submitRequest'): void
}>()

const { glossData, editMode, allowEdit = true, isConfirmRequestPage = false, requestStatus, submitting = false } = defineProps<{
  glossData: GlossData,
  editMode: boolean,
  allowEdit: boolean,
  isConfirmRequestPage?: boolean | undefined,
  requestStatus?: RequestStatus | undefined,
  submitting?: boolean | undefined
}>()

const $q = useQuasar()

const editGloss = () => {
  if (!allowEdit) return
  emit('update:editMode', true)
}

const cancelGloss = () => {
  if (!allowEdit) return
  emit('update:editMode', false)
}

const acceptRequest = () => {
  const validationErrors = validateGloss(glossData)

  if (validationErrors.length > 0) {
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
  emit('acceptRequest', glossData)
}

const declineRequest = () => {
  emit('declineRequest')
}

const submitRequest = () => {
  emit('submitRequest')
}

const handleGlossDataUpdate = (updatedGlossData: GlossData) => {
  emit('update:glossData', updatedGlossData)
}
</script>
