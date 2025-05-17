<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card class="login-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          Login
        </div>
        <q-space />
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense
        />
      </q-card-section>

      <q-card-section>
        <q-form
          class="q-gutter-md"
          @submit="handleLogin"
        >
          <q-input
            v-model="email"
            type="email"
            :label="translate('email')"
            :rules="[val => !!val || 'Email is required']"
            filled
          >
            <template #prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="isPwd ? 'password' : 'text'"
            :label="translate('password')"
            :rules="[val => !!val || 'Password is required']"
            filled
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <div class="row justify-between items-center">
            <q-btn
              flat
              dense
              color="primary"
              :label="translate('forgotPassword')"
            />
          </div>

          <div class="row q-mt-md">
            <q-btn
              type="submit"
              color="primary"              
              :label="translate('login')"
              class="full-width"
              :loading="isLoading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { useAuthentication } from '../hooks/useAuthentication'
import translate from '../utils/translate'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Reactive references
const email = ref('')
const password = ref('')
const isPwd = ref(true)
const rememberMe = ref(false)

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const { login, isLoading, error } = useAuthentication()

// Methods
const handleLogin = async () => {
  try {
    await login(email.value, password.value)
    Notify.create({
      type: 'positive',
      message: 'Login successful'
    })

    // Close dialog
    isOpen.value = false

    // Reset form
    email.value = ''
    password.value = ''
    rememberMe.value = false
  } catch {
    Notify.create({
      type: 'negative',
      message: error.value || 'Login failed. Please check your credentials.'
    })
  }
}
</script>

<style scoped>
.login-card {
  min-width: 400px;
}

@media (max-width: 450px) {
  .login-card {
    min-width: 300px;
  }
}
</style>