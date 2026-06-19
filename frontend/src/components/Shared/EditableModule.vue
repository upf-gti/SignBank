<template>
  <q-form
    class="editable-module"
    :class="{ editing: effectiveEditing, 'inline-mode': inlineEdit }"
    @submit.prevent="handleSubmit"
  >
    <div class="column no-wrap">
      <div class="row items-start justify-between q-mb-sm">
        <slot name="header" />
        <div
          v-if="allowEdit && !effectiveEditing"
          class="row items-center action-buttons"
        >
          <q-btn
            flat
            dense
            round
            icon="edit"
            color="primary"
            :aria-label="customEditLabel || translate('edit')"
            @click="startEdit"
          />
          <q-btn
            v-if="showDelete"
            flat
            dense
            round
            icon="delete"
            color="negative"
            :aria-label="customDeleteLabel || translate('delete')"
            @click="confirmDelete"
          />
        </div>
        <div
          v-else-if="inlineEdit && allowEdit && showDelete"
          class="row items-center"
        >
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            :aria-label="customDeleteLabel || translate('delete')"
            @click="confirmDelete"
          />
        </div>
      </div>

      <div class="editable-content col">
        <slot :is-editing="effectiveEditing" />
      </div>
    </div>

    <div
      v-if="effectiveEditing && allowEdit && !inlineEdit"
      class="row justify-end q-gutter-sm q-mt-md editing-actions"
    >
      <q-btn
        flat
        dense
        color="grey-7"
        :label="translate('cancel')"
        @click="cancelEdit"
      />
      <q-btn
        dense
        unelevated
        color="primary"
        :label="translate('save')"
        type="submit"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import translate from 'src/utils/translate'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const props = defineProps<{
  allowEdit: boolean
  initialEditState?: boolean
  inlineEdit?: boolean
  showDelete?: boolean
  customEditLabel?: string
  customDeleteLabel?: string
  validateBeforeSave?: () => { isValid: boolean; errors: string[] }
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'delete'): void
}>()

const isEditing = ref(props.inlineEdit || props.initialEditState || false)

watch(() => props.inlineEdit, (value) => {
  if (value) isEditing.value = true
})

const effectiveEditing = computed(() => props.inlineEdit || isEditing.value)

function startEdit() {
  isEditing.value = true
}

function handleSubmit() {
  if (!props.inlineEdit) {
    saveEdit()
  }
}

function saveEdit() {
  if (props.validateBeforeSave) {
    const { isValid, errors } = props.validateBeforeSave()
    if (!isValid) {
      $q.dialog({
        title: translate('validationErrors'),
        message: `
          <ul style="list-style-type: disc; margin: 0; padding-left: 20px;">
            ${errors.map(error => `<li>${error}</li>`).join('')}
          </ul>
        `,
        html: true,
        style: 'min-width: 300px',
        ok: {
          label: translate('ok'),
          flat: true,
          color: 'primary'
        }
      })
      return
    }
  }

  emit('save')
  if (!props.inlineEdit) {
    isEditing.value = false
  }
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
  transition: background 0.2s ease;
}

.editable-module.inline-mode {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px;
  border-radius: var(--sb-card-radius, 12px);
}

.editable-module:not(.inline-mode):hover .action-buttons {
  opacity: 1;
}

.action-buttons {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.editing-actions .q-btn {
  min-height: 32px;
}
</style>
