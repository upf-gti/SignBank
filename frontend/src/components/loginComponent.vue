<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card class="login-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ translate('login') }}
        </div>
        <q-space />
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense
          :aria-label="translate('cancel')"
        />
      </q-card-section>

      <q-form @submit="handleLogin">
        <q-card-section class="q-pt-none q-pb-sm">
          <q-input
            v-model="email"
            type="email"
            autocomplete="email"
            :label="translate('email')"
            :rules="[val => !!val || translate('emailRequired')]"
            filled
          >
            <template #prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            class="q-mt-md"
            :type="isPwd ? 'password' : 'text'"
            autocomplete="current-password"
            :label="translate('password')"
            :rules="[val => !!val || translate('passwordRequired')]"
            filled
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                :aria-label="translate('password')"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <div class="row items-center q-mt-sm">
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              :label="translate('forgotPassword')"
              tabindex="-1"
            />
          </div>
        </q-card-section>

        <q-card-actions class="q-px-md q-pb-md">
          <q-btn
            type="submit"
            color="primary"
            :label="translate('login')"
            class="full-width"
            unelevated
            no-caps
            :loading="isLoading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { useAuthentication } from '../hooks/useAuthentication'
import translate from '../utils/translate'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const email = ref('')
const password = ref('')
const isPwd = ref(true)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const { login, isLoading, error } = useAuthentication()

const handleLogin = async () => {
  try {
    await login(email.value, password.value)
    Notify.create({
      type: 'positive',
      message: translate('loginSuccessful')
    })

    isOpen.value = false
    email.value = ''
    password.value = ''
  } catch {
    Notify.create({
      type: 'negative',
      message: error.value || translate('loginFailed')
    })
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
}

@media (max-width: 450px) {
  .login-card {
    max-width: calc(100vw - 32px);
  }
}
</style>
