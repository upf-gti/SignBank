<template>
  <q-card
    flat
    class="gloss-detail-card"
    :class="{ 'gloss-detail-card--constrained': constrainedLayout }"
  >
    <GlossRequestProgress
      v-if="editMode"
      :gloss-data="glossData"
    />

    <GlossHeader
      :gloss-data="glossData"
      :edit-mode="editMode"
      :allow-edit="allowEdit"
      :is-confirm-request-page="isConfirmRequestPage"
      :is-draft="isDraft"
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
      v-if="!contentEditable"
      class="gloss-detail-card__main"
      :gloss-data="glossData"
    />

    <MoreContentComponent
      v-if="contentEditable"
      class="gloss-detail-card__edit"
      :gloss-data="glossData"
      :edit-mode="contentEditable"
      :is-draft="isDraft"
      :submitting="submitting"
      @update:gloss-data="handleGlossDataUpdate"
      @submit-request="submitRequest"
      @finish-edit="finishEdit"
    />
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GlossData, RequestStatus } from 'src/types/models'
import GlossHeader from './components/GlossHeader.vue'
import MainContent from './components/MainContent.vue'
import MoreContentComponent from './components/MoreContentComponent.vue'
import GlossRequestProgress from './components/GlossRequestProgress.vue'
import { validateGloss } from 'src/utils/glossValidation'
import { useQuasar } from 'quasar'
import translate from 'src/utils/translate'

const emit = defineEmits<{
  (e: 'update:editMode', mode: boolean): void
  (e: 'update:glossData', glossData: GlossData): void
  (e: 'acceptRequest', glossData: GlossData): void
  (e: 'declineRequest'): void
  (e: 'submitRequest'): void
}>()

const { glossData, editMode, allowEdit = true, isConfirmRequestPage = false, requestStatus, submitting = false, constrainedLayout = false } = defineProps<{
  glossData: GlossData,
  editMode: boolean,
  allowEdit: boolean,
  isConfirmRequestPage?: boolean | undefined,
  requestStatus?: RequestStatus | undefined,
  submitting?: boolean | undefined,
  constrainedLayout?: boolean | undefined,
}>()

const isDraft = computed(() =>
  editMode && allowEdit && requestStatus === RequestStatus.NOT_COMPLETED
)

const contentEditable = computed(() => allowEdit && editMode)

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

const finishEdit = () => {
  $q.notify({
    type: 'positive',
    message: translate('glossSavedSuccessfully'),
  })
  emit('update:editMode', false)
}

const handleGlossDataUpdate = (updatedGlossData: GlossData) => {
  emit('update:glossData', updatedGlossData)
}
</script>

<style scoped>
.gloss-detail-card {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.gloss-detail-card--constrained {
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gloss-detail-card--constrained > :not(.gloss-detail-card__main) {
  flex: 0 0 auto;
}

.gloss-detail-card--constrained .gloss-detail-card__main {
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gloss-detail-card__edit {
  width: 100%;
}
</style>
