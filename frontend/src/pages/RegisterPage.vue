<template>
  <q-page class="flex flex-center">
    <q-card
      class="q-pa-md"
      style="width: 400px"
    >
      <q-card-section>
        <div class="text-h5 text-center q-mb-md">
          Create Account
        </div>
        <q-form
          class="q-gutter-md"
          @submit="onSubmit"
        >
          <q-input
            v-model="form.username"
            label="Username"
            :rules="[val => !!val || 'Username is required']"
          />
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            :rules="[
              val => !!val || 'Email is required',
              val => /.+@.+\..+/.test(val) || 'Email must be valid'
            ]"
          />
          <q-input
            v-model="form.password"
            label="Password"
            type="password"
            :rules="[
              val => !!val || 'Password is required',
              val => val.length >= 6 || 'Password must be at least 6 characters'
            ]"
          />
          <q-input
            v-model="form.confirmPassword"
            label="Confirm Password"
            type="password"
            :rules="[
              val => !!val || 'Please confirm your password',
              val => val === form.password || 'Passwords do not match'
            ]"
          />
          <div class="text-center">
            <q-btn
              type="submit"
              color="primary"
              label="Register"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/services/api'

const $q = useQuasar()
const router = useRouter()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const onSubmit = async () => {
  try {
    loading.value = true
    await api.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })
    $q.notify({
      color: 'positive',
      message: 'Registration successful! Please login.'
    })
    router.push('/')
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Registration failed. Please try again.'
    })
  } finally {
    loading.value = false
  }
}
</script> 