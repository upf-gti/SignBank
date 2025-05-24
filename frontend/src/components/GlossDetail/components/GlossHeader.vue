<template>
  <q-card-section class="row justify-between items-center">
    <div class="column">
      <div v-if="editMode !== 'full'" class="text-h6">
        {{ glossData.gloss }}
      </div>
      <q-input v-else v-model="glossData.gloss" />
      <div class="text-subtitle2">
        {{ translate('last_updated') }}: {{ glossData.updatedAt }}
      </div>
    </div>
    <div class="row">
      <q-btn v-if="editMode === 'none'" icon="edit" @click="editGloss" />
      <q-btn v-else icon="save" @click="saveGloss" />
      <q-btn v-if="editMode === 'strict'" icon="cancel" @click="cancelGloss" />
      <q-btn icon="more_vert" />
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { GlossData } from 'src/types/models'
import translate from 'src/utils/translate'

const emit = defineEmits<{
  (e: 'editGloss'): void
  (e: 'saveGloss'): void
  (e: 'cancelGloss'): void
}>()

const { glossData } = defineProps<{
  glossData: GlossData,
  editMode: "strict" | "full" | "none"
}>()

const editGloss = () => {
  emit('editGloss')
}

const saveGloss = () => {
  emit('saveGloss')
}

const cancelGloss = () => {
  emit('cancelGloss')
}
</script>