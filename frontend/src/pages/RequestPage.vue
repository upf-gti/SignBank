<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <h5 class="q-mt-none">
          {{ translate('myRequests') }}
        </h5>
        <q-btn 
          color="primary" 
          :label="translate('newRequest')" 
          icon="add" 
          @click="showForm = true"
        />
      </div>
  
      <!-- Requests Table -->
      <q-table
        :rows="requests"
        :columns="columns"
        row-key="id"
        :loading="loading"
      >
        <!-- Status column with colored badges -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.value)">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
  
      <!-- New Request Dialog -->
      <q-dialog v-model="showForm">
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              {{ translate('newRequest') }}
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
              @submit.prevent="onSubmit"
            >
              <template
                v-for="field in wordStructure"
                :key="field.field"
              >
                <q-input
                  v-if="field.type === 'text' && field.editable"
                  v-model="formData[field.field]"
                  :label="field.label"
                  :rules="[(val) => !!val || translate('fieldRequired')]"
                  outlined
                />
              </template>
  
              <div class="row justify-end q-mt-md">
                <q-btn
                  v-close-popup
                  :label="translate('cancel')"
                  type="reset"
                  flat
                  class="q-mr-sm"
                  @click="resetForm"
                />
                <q-btn
                  :label="translate('submit')"
                  type="submit"
                  color="primary"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>
  
<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import wordStructure from '../utils/wordStructure'
  import { useQuasar } from 'quasar'
  import translate from '../utils/translate'
  import api from '../services/api'
import type { WordRequest } from 'src/types/wordRequest'
  
  const $q = useQuasar()
  
  interface FormData {
    word: string
    description: string
    videoUrl: string
    [key: string]: string
  }
  
  const columns = [
    { name: 'word', field: 'word', label: 'Word',  sortable: true, align: 'left'  },
    { name: 'description', field: 'description', label: 'Description', align: 'left' },
    { name: 'status', field: 'status', label: 'Status', sortable: true, align: 'left' },
    { name: 'denyReason', field: 'denyReason', label: 'Deny Reason', sortable: true, align: 'left'}
  ]
  
  const requests = ref<WordRequest[]>([])
  const loading = ref(false)
  const showForm = ref(false)
  
  const formData = ref<FormData>({
    word: '',
    description: '',
    videoUrl: ''
  })
  
  const getStatusColor = (status: string): string => {
    const colors = {
      PENDING: 'warning',
      ACCEPTED: 'positive',
      DENIED: 'negative'
    }
    return colors[status as keyof typeof colors] || 'grey'
  }
  
  const resetForm = (): void => {
    formData.value = {
      word: '',
      description: '',
      videoUrl: ''
    }
  }
  
  const fetchRequests = (): void => {
    loading.value = true

    api.wordRequests.get().then(response => {
      requests.value = response.data
    }).catch(error => {
      console.error('Error fetching requests:', error)
      $q.notify({
        color: 'negative',
        message: translate('errorFetchingRequests'),
        icon: 'error'
      })
    }).finally(() => {
      loading.value = false
    })
  }
  
const onSubmit = (): void => {
    try {
      if (!formData.value.word || !formData.value.description) {
        $q.notify({
          color: 'negative',
          message: translate('pleaseCompleteAllFields'),
          icon: 'warning'
        })
        return
      }
  
      api.wordRequests.post(formData.value).then(response => {
        requests.value.push(response.data)
        $q.notify({
          color: 'positive',
          message: translate('requestSubmittedSuccessfully'),
          icon: 'check'
        })
        
        showForm.value = false
        resetForm()
      }).catch(error => {
        console.error('Error submitting form:', error)
        $q.notify({
          color: 'negative',
          message: translate('errorSubmittingForm'),
          icon: 'error'
        })
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      $q.notify({
        color: 'negative',
        message: translate('errorSubmittingForm'),
        icon: 'error'
      })
    }
  }
  
  onMounted(() => {
    fetchRequests()
  })
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>