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
          @click="$router.push('/requests/create')"
        />
      </div>
  
      <!-- Requests Table -->
      <q-table
        :rows="requests"
        :columns="columns"
        row-key="id"
        :loading="loading"
        @row-click="editRequest"
      >
        <!-- Status column with colored badges -->
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.value)">
              {{ translate(props.value) }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>
  
<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useQuasar } from 'quasar'
  import translate from '../utils/translate'
  import api from '../services/api'
  import type { WordRequest } from '../types/database'
  import type { QTableProps } from 'quasar'
  import { useRouter } from 'vue-router'

  const $q = useQuasar()
  const router = useRouter()

  
  const columns: QTableProps['columns'] = [
    { name: 'word',  label: translate('word'),  sortable: true, align: 'left', field: (row: WordRequest) => {
      return row.requestedWordData.word} },
    { name: 'description', label: translate('description'), align: 'left', field: (row: WordRequest) => row.requestedWordData.senses[0]?.descriptions[0]?.description },
    { name: 'status', label: translate('status'), sortable: true, align: 'left', field: (row: WordRequest) => row.status },
    { name: 'denyReason',  label: translate('denyReason'), sortable: true, align: 'left', field: (row: WordRequest) => row.denyReason }
  ]
  
  const requests = ref<WordRequest[]>([])
  const loading = ref(false)
  
  
  const getStatusColor = (status: string): string => {
    const colors = {
      PENDING: 'warning',
      ACCEPTED: 'positive',
      DENIED: 'negative'
    }
    return colors[status as keyof typeof colors] || 'grey'
  }
  
  const fetchRequests = (): void => {
    loading.value = true

    api.wordRequests.get().then(response => {
      requests.value = response.data as WordRequest[] 
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
  
  function editRequest (evt: Event, row: WordRequest) {
    console.log(row)
    router.push(`/requests/${row.id}`).catch(error => {
      console.error('Error editing request:', error)
      $q.notify({
        color: 'negative',
        message: translate('errorEditingRequest'),
        icon: 'error'
      })
    })
  }
  onMounted(() => {
    fetchRequests()
  })
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  </style>