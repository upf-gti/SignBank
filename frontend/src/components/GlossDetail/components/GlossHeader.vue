<template>
  <q-card-section class="gloss-header">
    <div class="gloss-header__inner">
      <div class="gloss-header__title column">
        <div
          v-if="!editMode || !allowEdit"
          class="text-h4 gloss-header__gloss-name"
        >
          {{ localGlossData.gloss }}
        </div>

        <q-input
          v-else-if="editMode && allowEdit"
          v-model="localGlossData.gloss"
          :label="translate('gloss')"
          outlined
          debounce="500"
          class="gloss-header__gloss-input"
          @update:model-value="saveGloss"
        />

        <div
          v-if="requestStatus && requestStatus !== 'NOT_COMPLETED'"
          class="q-mt-sm"
        >
          <q-chip
            :color="getStatusColor(requestStatus)"
            text-color="white"
            :label="translate(requestStatus)"
            dense
          />
        </div>
        <div
          v-if="isArchived"
          class="q-mt-sm"
        >
          <q-chip
            color="grey"
            text-color="white"
            :label="translate('archived')"
            dense
          />
        </div>
      </div>

      <div class="gloss-header__actions row q-gutter-sm">
        <q-btn
          v-if="allowEdit && !editMode && userStore.isAdmin"
          color="primary"
          icon="edit"
          :label="translate('edit')"
          @click="emit('editGloss')"
        />
        <q-btn
          v-if="allowEdit && !editMode && userStore.isAdmin && isPublished"
          color="negative"
          icon="archive"
          :label="translate('archive')"
          outline
          @click="confirmArchive"
        />
        <q-btn
          v-if="allowEdit && !editMode && userStore.isAdmin && isArchived"
          color="positive"
          icon="unarchive"
          :label="translate('unarchive')"
          outline
          @click="confirmUnarchive"
        />
        <q-btn
          v-if="allowEdit && editMode && router.currentRoute.value.path.includes('/gloss')"
          color="negative"
          icon="cancel"
          :label="translate('exitEditMode')"
          @click="emit('cancelGloss')"
        />
        <q-btn
          v-if="requestStatus === 'NOT_COMPLETED' && !isDraft"
          color="primary"
          icon="send"
          :label="translate('sendRequest')"
          :loading="submitting"
          @click="submitRequest"
        />

        <template v-if="isConfirmRequestPage && requestStatus === RequestStatus.WAITING_FOR_APPROVAL">
          <q-btn
            icon="check"
            color="positive"
            :label="translate('accept')"
            outline
            @click="acceptRequest"
          />
          <q-btn
            icon="close"
            color="negative"
            :label="translate('decline')"
            outline
            @click="declineRequest"
          />
        </template>
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { GlossData, RequestStatus } from 'src/types/models'
import translate from 'src/utils/translate'
import { ref, watch, computed } from 'vue'
import useUserStore from 'src/stores/user.store'
import { useRouter } from 'vue-router'
import api from 'src/services/api'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const userStore = useUserStore()
const router = useRouter()
const editGloss = ref(false)

const emit = defineEmits<{
  (e: 'editGloss'): void
  (e: 'cancelGloss'): void
  (e: 'saveGloss'): void
  (e: 'acceptRequest'): void
  (e: 'declineRequest'): void
  (e: 'submitRequest'): void
  (e: 'update:glossData', value: GlossData): void
}>()

const props = defineProps<{
  glossData: GlossData,
  editMode: boolean,
  isConfirmRequestPage?: boolean,
  isDraft?: boolean,
  requestStatus?: RequestStatus | undefined,
  submitting?: boolean | undefined,
  allowEdit: boolean
}>()

// Create a local copy of the glossData
const localGlossData = ref<GlossData>({ ...props.glossData })

// Watch for changes in the prop and update local copy
watch(() => props.glossData, (newGlossData) => {
  localGlossData.value = { ...newGlossData }
}, { deep: true })

// Check if the gloss is published
const isPublished = computed(() => {
  return localGlossData.value.dictionaryEntry?.status === 'PUBLISHED'
})

// Check if the gloss is archived
const isArchived = computed(() => {
  return localGlossData.value.dictionaryEntry?.status === 'ARCHIVED'
})

const acceptRequest = () => {
  emit('acceptRequest')
}

const declineRequest = () => {
  emit('declineRequest')
}

const submitRequest = () => {
  emit('submitRequest')
}

const saveGloss = () => {
  api.glossData.updateGloss(localGlossData.value.id || '', {gloss: localGlossData.value.gloss}).then((response) => {
    // Update local data with the response
    localGlossData.value = response.data
    // Emit the updated data to parent
    emit('update:glossData', response.data)
    $q.notify({
      type: 'positive',
      message: translate('glossUpdatedSuccessfully')
    })
  }).catch((error) => {
    $q.notify({
      type: 'negative',
      message: translate('glossUpdatedFailed')
    })
    console.error(error)
  })
}

const confirmArchive = () => {
  $q.dialog({
    title: translate('confirmArchive'),
    message: translate('archiveGlossConfirmation'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    archiveGloss()
  })
}

const archiveGloss = () => {
  api.glossData.archiveGloss(localGlossData.value.id || '').then((response) => {
    emit('update:glossData', response.data)
    $q.notify({
      type: 'positive',
      message: translate('glossArchivedSuccessfully')
    })
  }).catch((error) => {
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToArchiveGloss')
    })
    console.error(error)
  })
}

const confirmUnarchive = () => {
  $q.dialog({
    title: translate('confirmUnarchive'),
    message: translate('unarchiveGlossConfirmation'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    unarchiveGloss()
  })
}

const unarchiveGloss = () => {
  api.glossData.unarchiveGloss(localGlossData.value.id || '').then((response) => {
    emit('update:glossData', response.data)
    $q.notify({
      type: 'positive',
      message: translate('glossUnarchivedSuccessfully')
    })
  }).catch((error) => {
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToUnarchiveGloss')
    })
    console.error(error)
  })
}

const getStatusColor = (status: RequestStatus | undefined): string => {
  switch (status) {
    case RequestStatus.NOT_COMPLETED:
      return 'orange'
    case RequestStatus.WAITING_FOR_APPROVAL:
      return 'blue'
    case RequestStatus.ACCEPTED:
      return 'positive'
    case RequestStatus.DENIED:
      return 'negative'
    default:
      return 'grey'
  }
}
</script>

<style scoped>
.gloss-header {
  flex: 0 0 auto;
  flex-shrink: 0;
  overflow: visible;
  position: relative;
  z-index: 2;
}

.gloss-header__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.gloss-header__title {
  flex: 1 1 180px;
  min-width: 0;
}

.gloss-header__gloss-name {
  word-break: break-word;
}

.gloss-header__gloss-input {
  min-width: 200px;
  max-width: 100%;
}

.gloss-header__actions {
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}
</style>