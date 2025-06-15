<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="q-pa-lg">
          <div class="text-h4 q-mb-xl">
            {{ translate('createNewGloss') }}
          </div>
          
          <q-form
            class="q-gutter-md"
            @submit="onSubmit"
          >
            <!-- Gloss Name Input -->
            <q-input
              v-model="form.gloss"
              :label="translate('gloss')"
              :rules="[val => !!val || translate('required')]"
              outlined
              clearable
            />

            <!-- Submit Button -->
            <div class="row justify-end q-mt-md">
              <q-btn
                :label="translate('createGloss')"
                type="submit"
                color="primary"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import translate from 'src/utils/translate'
import { api } from 'src/services/api'

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const form = ref({
  gloss: ''
})

async function onSubmit() {
  try {
    loading.value = true
    const response = await api.glossRequests.create(form.value)

    // Navigate to the edit page for this request
    router.push(`/my-requests/edit/${response.data.id}`)
  } catch (error) {
    console.error('Error creating gloss request:', error)
    $q.notify({
      type: 'negative',
      message: translate('errorCreatingGlossRequest')
    })
  } finally {
    loading.value = false
  }
}
</script> 