<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">
      {{ translate('confirmRequests') }}
    </div>

    <q-table
      :rows="wordsRequested"
      :columns="columns"
      row-key="id"
      :loading="loading"
      @row-click="(evt, row)=> $router.push(`/confirm-requests/${row.id}`)"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { QTableProps } from 'quasar'
import { useQuasar } from 'quasar'
import api from 'src/services/api'
import type { ConfirmRequestType } from 'src/types/wordRequest'
import translate from 'src/utils/translate'

const $q = useQuasar()

const wordsRequested = ref<ConfirmRequestType[]>([])
const loading = ref(false)

const columns: QTableProps['columns'] = [
  {
        name: 'word',
        required: true,
        label: translate('word'),
        align: 'left',
        field: (row: ConfirmRequestType) => {
          console.log(row);
          return row.requestedWordData.word
        },
    },
    {
        name: 'description',
        required: true,
        label: translate('description'),
        align: 'left',
        field: (row: ConfirmRequestType) => row.requestedWordData.senses[0]?.descriptions[0]?.text,
    },
    {
        name: 'requestedBy',
        required: true,
        label: translate('requestedBy'),
        align: 'left',
        field: (row: ConfirmRequestType) => row.user.email,
    }
]

const fetchRequests = async () => {
    loading.value = true
    await api.wordRequests.getPending().then(response => {
        wordsRequested.value = response.data
    }).catch(error => {
        console.error('Error fetching wordsRequested:', error)
        $q.notify({
            color: 'negative',
            message: 'Failed to fetch word wordsRequested',
            icon: 'warning',
        })
    }).finally(() => {
        loading.value = false
    })
}

onMounted(async () => {
    await fetchRequests()
})
</script>