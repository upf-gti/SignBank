<template>
  <q-dialog v-model="dialogVisible" @hide="$emit('close')">
    <q-card style="min-width: 350px; max-width: 400px;">
      <q-card-section>
        <div class="text-h6">{{ translate('createUser') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-sm">
          <q-input
            v-model="form.username"
            :label="translate('username')"
            outlined
            dense
            :rules="[val => !!val || translate('usernameRequired')]"
          />

          <q-input
            v-model="form.email"
            :label="translate('email')"
            type="email"
            outlined
            dense
            :rules="[val => !!val || translate('emailRequired')]"
          />

          <q-input
            v-model="form.name"
            :label="translate('name')"
            outlined
            dense
            :rules="[val => !!val || translate('nameRequired')]"
          />

          <q-input
            v-model="form.lastName"
            :label="translate('lastName')"
            outlined
            dense
            :rules="[val => !!val || translate('lastNameRequired')]"
          />

          <q-input
            v-model="form.password"
            :label="translate('password')"
            type="password"
            outlined
            dense
            :rules="[val => !!val || translate('passwordRequired'), val => val.length >= 6 || translate('passwordMinLength')]"
          />

          <q-input
            v-model="form.confirmPassword"
            :label="translate('confirmPassword')"
            type="password"
            outlined
            dense
            :rules="[
              val => !!val || translate('confirmPasswordRequired'),
              val => val === form.password || translate('passwordsDoNotMatch')
            ]"
          />

          <q-select
            v-model="form.role"
            :label="translate('role')"
            :options="roleOptions"
            outlined
            dense
            :rules="[val => !!val || translate('roleRequired')]"
          />

          <div class="row q-gutter-sm justify-end q-mt-md">
            <q-btn
              :label="translate('cancel')"
              color="grey"
              flat
              @click="$emit('close')"
            />
            <q-btn
              :label="translate('create')"
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
import { Role } from 'src/types/models';
import translate from 'src/utils/translate';

interface Props {
  show: boolean;
  loading: boolean;
  roleOptions: { label: string; value: Role }[];
}

interface Emits {
  (e: 'close'): void;
  (e: 'submit', userData: {
    username: string;
    email: string;
    name: string;
    lastName: string;
    password: string;
    role: Role;
  }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const form = ref({
  username: '',
  email: '',
  name: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  role: Role.USER as Role
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
    username: '',
    email: '',
    name: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: Role.USER
  };
}

function handleSubmit() {
  emit('submit', { 
    username: form.value.username,
    email: form.value.email,
    name: form.value.name,
    lastName: form.value.lastName,
    password: form.value.password,
    role: form.value.role
  });
}
</script> 