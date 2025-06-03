<template>
  <div class="editable-module">
    <!-- Header with title and action buttons -->
    <div class="row items-center justify-between q-mb-sm">
      <slot name="header" />
      <div class="row q-gutter-sm" v-if="allowEdit && !isEditing">
        <q-btn
          flat
          round
          dense
          icon="edit"
          color="primary"
          @click="startEdit"
        >
          <q-tooltip>{{ translate('edit') }}</q-tooltip>
        </q-btn>
        <q-btn
          v-if="showDelete"
          flat
          round
          dense
          icon="delete"
          color="negative"
          @click="confirmDelete"
        >
          <q-tooltip>{{ translate('delete') }}</q-tooltip>
        </q-btn>
      </div>
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
import { useQuasar } from 'quasar'

const $q = useQuasar()
const props = defineProps<{
  allowEdit: boolean
  initialEditState?: boolean
  showDelete?: boolean
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
}
</style> 