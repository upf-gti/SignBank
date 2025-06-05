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
    </div>
    <div class="row">
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
      <div
        v-if="allowEdit"
        class="row"
      >
        <q-btn
          v-if="!editMode"
          icon="edit"
          @click="editGloss"
        />
        <q-btn
          v-if="editMode"
          icon="cancel"
          @click="cancelGloss"
        />
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { GlossData } from 'src/types/models'
import translate from 'src/utils/translate'

const emit = defineEmits<{
  (e: 'editGloss'): void
  (e: 'cancelGloss'): void
  (e: 'acceptRequest'): void
  (e: 'declineRequest'): void
}>()

const { glossData, allowEdit = true, isConfirmRequestPage = false } = defineProps<{
  glossData: GlossData,
  editMode: boolean,
  allowEdit: boolean,
  isConfirmRequestPage?: boolean
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
</script>