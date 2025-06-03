<template>
  <q-form class="editable-module" @submit="saveEdit">
    <!-- Header with title and action buttons -->
    <div class="row reverse no-wrap">

    <div class="row items-start justify-between q-mb-sm">
      <slot name="header" />
      <div class="column items-end q-gutter-sm" v-if="allowEdit && !isEditing">
        <q-btn
          outline
          icon="edit"
          color="primary"
          :label="customEditLabel || translate('edit')"
          @click="startEdit"
          class="full-width"
        >
          <q-tooltip>{{ translate('edit') }}</q-tooltip>
        </q-btn>
        <q-btn
          v-if="showDelete"
          outline
          icon="delete"
          color="negative"
          :label="customDeleteLabel || translate('delete')"
          @click="confirmDelete"
          class="full-width"
        >
          <q-tooltip>{{ translate('delete') }}</q-tooltip>
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
}
</style> 