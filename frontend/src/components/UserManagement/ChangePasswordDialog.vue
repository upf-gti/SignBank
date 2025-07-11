<template>
  <q-dialog v-model="dialogVisible" @hide="$emit('close')">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ translate('changePassword') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <div class="text-body2 q-mb-md">
            {{ translate('changePasswordFor', { username: user?.username }) }}
          </div>

          <q-input
            v-model="form.newPassword"
            :label="translate('newPassword')"
            type="password"
            outlined
            :rules="[val => !!val || translate('passwordRequired'), val => val.length >= 6 || translate('passwordMinLength')]"
          />

          <q-input
            v-model="form.confirmPassword"
            :label="translate('confirmPassword')"
            type="password"
            outlined
            :rules="[
              val => !!val || translate('confirmPasswordRequired'),
              val => val === form.newPassword || translate('passwordsDoNotMatch')
            ]"
          />

          <div class="row q-gutter-sm justify-end">
            <q-btn
              :label="translate('cancel')"
              color="grey"
              flat
              @click="$emit('close')"
            />
            <q-btn
              :label="translate('changePassword')"
              type="submit"
              color="primary"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { User } from 'src/types/models';
import translate from 'src/utils/translate';

interface Props {
  show: boolean;
  loading: boolean;
  user: User | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'submit', password: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  newPassword: '',
  confirmPassword: ''
});

const dialogVisible = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      emit('close');
    }
  }
});

watch(() => props.show, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

function resetForm() {
  form.value = {
    newPassword: '',
    confirmPassword: ''
  };
}

function handleSubmit() {
  emit('submit', form.value.newPassword);
}
</script> 