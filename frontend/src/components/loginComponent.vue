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
              :loading="loading"
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
import api from '../services/api'
import useUser from 'src/stores/user.store'
import translate from '../utils/translate'
const userStore = useUser()

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
const loading = ref(false)

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Methods
const handleLogin = async () => {
  try {
    loading.value = true
    const { data: response } = await api.login({
      email: email.value,
      password: password.value
    })

    userStore.setUserData(response)    

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

    // Handle successful login (e.g., redirect, store token, etc.)
  } catch (error) {
    console.log(error)
    Notify.create({
      type: 'negative',
      message: 'Login failed. Please check your credentials.'
    })
  } finally {
    loading.value = false
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