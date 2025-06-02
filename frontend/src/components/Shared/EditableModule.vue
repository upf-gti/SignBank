<template>
  <div class="editable-module">
    <!-- Header with title and edit button -->
    <div class="row items-center justify-between q-mb-sm">
      <slot name="header" />
      <q-btn
        v-if="allowEdit && !isEditing"
        flat
        round
        dense
        icon="edit"
        color="primary"
        @click="startEdit"
      >
        <q-tooltip>{{ translate('edit') }}</q-tooltip>
      </q-btn>
    </div>

    <!-- Content area -->
    <div class="editable-content">
      <slot :is-editing="isEditing" />
    </div>

    <!-- Action buttons when editing -->
    <div
      v-if="isEditing"
      class="row justify-end q-gutter-sm q-mt-md"
    >
      <q-btn
        flat
        color="negative"
        :label="translate('cancel')"
        @click="cancelEdit"
      />
      <q-btn
        color="primary"
        :label="translate('save')"
        @click="saveEdit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import translate from 'src/utils/translate'

const props = defineProps<{
  allowEdit: boolean
  initialEditState?: boolean
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const isEditing = ref(props.initialEditState || false)

function startEdit() {
  isEditing.value = true
}

function saveEdit() {
  emit('save')
  isEditing.value = false
}

function cancelEdit() {
  emit('cancel')
  isEditing.value = false
}
</script>

<style scoped>
.editable-module {
  position: relative;
}
</style> 