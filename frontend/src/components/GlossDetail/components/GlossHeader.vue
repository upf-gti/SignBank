<template>
  <q-card-section class="row justify-between items-center">
    <div class="column">
      <div
        v-if="!editMode"
        class="text-h4"
      >
        {{ glossData.gloss }}
      </div>
      <q-input
        v-else
        v-model="glossData.gloss"
        outlined
        :label="translate('gloss')"
      />
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

const emit = defineEmits<{
  (e: 'editGloss'): void
  (e: 'cancelGloss'): void
  (e: 'acceptRequest'): void
  (e: 'declineRequest'): void
  (e: 'submitRequest'): void
}>()

const { glossData, allowEdit = true, isConfirmRequestPage = false, requestStatus, submitting = false } = defineProps<{
  glossData: GlossData,
  editMode: boolean,
  allowEdit: boolean,
  isConfirmRequestPage?: boolean,
  requestStatus?: RequestStatus | undefined,
  submitting?: boolean | undefined
}>()

const editGloss = () => {
  emit('editGloss')
}

const cancelGloss = () => {
  emit('cancelGloss')
}

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
    case 'NOT_COMPLETED':
      return 'orange';
    case 'WAITING_FOR_APPROVAL':
      return 'blue';
    case 'ACCEPTED':
      return 'positive';
    case 'DENIED':
      return 'negative';
    default:
      return 'grey';
  }
};
</script>