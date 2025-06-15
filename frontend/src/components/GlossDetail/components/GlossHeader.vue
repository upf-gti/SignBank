<template>
  <q-card-section class="row justify-between items-center">
    <div class="column">
      <div
        v-if="!editMode"
        class="text-h4"
      >
        {{ localGlossData.gloss }}
      </div>
      <!-- Status Info -->
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
    </div>
    <div class="row">
      <q-btn
        v-if="allowEdit && !editMode"
        color="primary"
        icon="edit"
        :label="translate('edit')"
        @click="emit('editGloss')"  
      />
      <q-btn
        v-if="allowEdit && editMode"
        color="negative"
        icon="cancel"
        :label="translate('exitEditMode')"
        @click="emit('cancelGloss')"
      />
      <!-- Send Request Button - shown when request is not completed -->
      <q-btn
        v-if="requestStatus === 'NOT_COMPLETED'"
        color="primary"
        icon="send"
        :label="translate('sendRequest')"
        :loading="submitting"
        class="q-mr-sm"
        @click="submitRequest"
      />
      
      <template v-if="isConfirmRequestPage">
        <q-btn
          icon="check"
          color="positive"
          :label="translate('accept')"
          outline
          class="q-mr-sm"
          @click="acceptRequest"
        />
        <q-btn
          icon="close"
          color="negative"
          :label="translate('decline')"
          outline
          class="q-mr-sm"
          @click="declineRequest"
        />
      </template>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { GlossData, RequestStatus } from 'src/types/models'
import translate from 'src/utils/translate'
import { ref, watch } from 'vue'

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
  requestStatus?: RequestStatus | undefined,
  submitting?: boolean | undefined,
  allowEdit: boolean
}>()

// Create a local copy of the glossData
const localGlossData = ref<GlossData>({ ...props.glossData });

// Watch for changes in the prop and update local copy
watch(() => props.glossData, (newGlossData) => {
  localGlossData.value = { ...newGlossData };
}, { deep: true });

// Watch for changes in local copy and emit updates
watch(() => localGlossData.value.gloss, (newGloss) => {
  emit('update:glossData', { ...localGlossData.value, gloss: newGloss });
}, { deep: true });

const acceptRequest = () => {
  emit('acceptRequest')
}

const declineRequest = () => {
  emit('declineRequest')
}

const submitRequest = () => {
  emit('submitRequest')
}

const getStatusColor = (status: RequestStatus | undefined): string => {
  switch (status) {
    case RequestStatus.NOT_COMPLETED:
      return 'orange';
    case RequestStatus.WAITING_FOR_APPROVAL:
      return 'blue';
    case RequestStatus.ACCEPTED:
      return 'positive';
    case RequestStatus.DENIED:
      return 'negative';
    default:
      return 'grey';
  }
};
</script>