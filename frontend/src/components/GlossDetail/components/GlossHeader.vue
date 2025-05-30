<template>
  <q-card-section class="row justify-between items-center">
    <div class="column">
      <div
        v-if="editMode !== 'full'"
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
    <div
      v-if="allowEdit"
      class="row"
    >
      <q-btn
        v-if="editMode === 'none'"
        icon="edit"
        @click="editGloss"
      />
      <q-btn
        v-else
        icon="save"
        :label="translate('saveGloss')"
        outline
        @click="saveGloss"
      />
      <q-btn
        v-if="editMode === 'strict'"
        icon="cancel"
        @click="cancelGloss"
      />
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

const { glossData, allowEdit = true } = defineProps<{
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