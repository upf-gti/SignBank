<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="q-pa-lg">
          <div class="text-h4 q-mb-md">
            {{ translate('createNewGloss') }}
          </div>
          
          <q-form
            class="q-gutter-md"
            @submit="onSubmit"
          >
            <!-- Gloss Name Input -->
            <q-input
              v-model="form.gloss"
              :label="translate('glossName')"
              :rules="[val => !!val || translate('glossNameRequired')]"
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

          <!-- Instructions -->
          <div class="text-caption q-mt-lg">
            <div class="text-weight-bold q-mb-sm">
              {{ translate('howItWorks') }}:
            </div>
            <ol class="q-pl-md">
              <li>{{ translate('step1EnterGlossName') }}</li>
              <li>{{ translate('step2AddDetails') }}</li>
              <li>{{ translate('step3Review') }}</li>
              <li>{{ translate('step4Submit') }}</li>
            </ol>
          </div>
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
    
    // Show success message
    $q.notify({
      type: 'positive',
      message: translate('glossRequestCreated')
    })

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