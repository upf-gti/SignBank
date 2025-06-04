<template>
  <q-form
    class="editable-module"
    @submit="saveEdit"
  >
    <!-- Header with title and action buttons -->
    <div class="column no-wrap">
      <div class="row items-start justify-between q-mb-sm">
        <slot name="header" />
        <div
          v-if="allowEdit && !isEditing"
          class="row items-center action-buttons q-py-sm"
        >
          <q-btn
            flat
            dense
            size="sm"
            icon="edit"
            color="primary"
            @click="startEdit"
            :label="customEditLabel || translate('edit')"
            class="edit-button"
          >
            <q-tooltip>{{ customEditLabel || translate('edit') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="showDelete"
            flat
            dense
            size="sm"
            icon="delete"
            color="negative"
            @click="confirmDelete"
            :label="customDeleteLabel || translate('delete')"
            class="delete-button"
          >
            <q-tooltip>{{ customDeleteLabel || translate('delete') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Content area -->
      <div class="editable-content col">
        <slot :is-editing="isEditing" />
      </div>
    </div>

    <!-- Action buttons when editing -->
    <div
      v-if="isEditing"
      class="row justify-end q-gutter-sm q-mt-md editing-actions"
    >
      <q-btn
        flat
        dense
        color="negative"
        :label="translate('cancel')"
        @click="cancelEdit"
      />
      <q-btn
        dense
        color="primary"
        :label="translate('save')"
        type="submit"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import translate from 'src/utils/translate'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const props = defineProps<{
  allowEdit: boolean
  initialEditState?: boolean
  showDelete?: boolean
  customEditLabel?: string
  customDeleteLabel?: string
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'delete'): void
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

function confirmDelete() {
  $q.dialog({
    title: translate('confirmDelete'),
    message: translate('confirmDeleteMessage'),
    persistent: true,
    ok: {
      color: 'negative',
      label: translate('delete'),
      flat: true
    },
    cancel: {
      color: 'primary',
      flat: true,
      label: translate('cancel')
    }
  }).onOk(() => {
    emit('delete')
  })
}
</script>

<style scoped>
.editable-module {
  position: relative;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.editable-module:hover .action-buttons {
  opacity: 1;
}

.action-buttons {
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.action-buttons .q-btn {
  min-height: 24px;
  padding: 0 8px;
}

.action-buttons .q-btn :deep(.q-btn__wrapper) {
  padding: 4px 8px;
  min-height: unset;
}

.editing-actions .q-btn {
  min-height: 32px;
}

.editable-module:hover {
  background: rgba(0, 0, 0, 0.02);
}

.editable-module.editing {
  background: rgba(0, 0, 0, 0.03);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
</style> 