<template>
  <q-card-section class="row justify-between items-center">
    <div class="column">
      <div v-if="editMode !== 'full'" class="text-h4">
        {{ glossData.gloss }}
      </div>
      <q-input v-else outlined v-model="glossData.gloss" :label="translate('gloss')" />
    </div>
    <div class="row" v-if="allowEdit">
      <q-btn v-if="editMode === 'none'" icon="edit" @click="editGloss" />
      <q-btn v-else icon="save" @click="saveGloss" :label="translate('saveGloss')" outline />
      <q-btn v-if="editMode === 'strict'" icon="cancel" @click="cancelGloss" />
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
  editMode: "strict" | "full" | "none",
  allowEdit: boolean
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