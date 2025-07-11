<template>
  <q-dialog v-model="dialogVisible" @hide="$emit('close')">
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ translate('confirmDelete') }}</div>
      </q-card-section>

      <q-card-section>
        {{ translate('deleteUserConfirm', { username: user?.username }) }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          :label="translate('cancel')"
          color="grey"
          flat
          @click="$emit('close')"
        />
        <q-btn
          :label="translate('delete')"
          color="negative"
          @click="handleDelete"
          :loading="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from 'src/types/models';
import translate from 'src/utils/translate';

interface Props {
  show: boolean;
  loading: boolean;
  user: User | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'confirm'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      emit('close');
    }
  }
});

function handleDelete() {
  emit('confirm');
}
</script> 