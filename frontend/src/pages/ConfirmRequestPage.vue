<template>
    <q-page padding>
        <div class="text-h4 q-mb-md">Word Requests</div>

        <q-table :rows="wordsRequested" :columns="columns" row-key="id" :loading="loading">
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="word" :props="props">
                        {{ props.row.word }}
                    </q-td>
                    <q-td key="description" :props="props">
                        {{ props.row.description }}
                    </q-td>
                    <q-td key="requestedBy" :props="props">
                        {{ props.row.user.email }}
                    </q-td>
                    <q-td key="actions" :props="props">
                        <q-btn-group flat>
                            <q-btn color="info" icon="info" flat dense @click="openDetailsDialog(props.row)" />
                            <q-btn color="positive" icon="check" flat dense
                                @click="openConfirmDialog('ACCEPTED', props.row)" />
                            <q-btn color="negative" icon="close" flat dense
                                @click="openConfirmDialog('DENIED', props.row)" />
                        </q-btn-group>
                    </q-td>
                </q-tr>
            </template>
        </q-table>

        <!-- Confirmation Dialog -->
        <!-- Replace the existing confirmation dialog with this -->
<q-dialog v-model="confirmDialog" persistent>
    <q-card>
        <q-card-section>
            <div class="text-h6">Confirm Action</div>
        </q-card-section>

        <q-card-section>
            Are you sure you want to {{ actionStatus === 'ACCEPTED' ? 'approve' : 'reject' }}
            the word "{{ selectedWord?.word }}"?
            
            <template v-if="actionStatus === 'DENIED'">
                <div class="q-mt-md">
                    <q-input
                        v-model="rejectionComment"
                        label="Reason for rejection"
                        type="textarea"
                        autofocus
                        :rules="[val => !!val || 'Please provide a reason for rejection']"
                    />
                </div>
            </template>
        </q-card-section>

        <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn 
                flat 
                :label="actionStatus === 'ACCEPTED' ? 'Approve' : 'Reject'"
                :color="actionStatus === 'ACCEPTED' ? 'positive' : 'negative'" 
                @click="handleConfirm"
                :disable="actionStatus === 'DENIED' && !rejectionComment"
            />
        </q-card-actions>
    </q-card>
</q-dialog>

        <!-- Details Dialog -->
        <q-dialog v-model="detailsDialog">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">Word Details</div>
                </q-card-section>

                <q-card-section v-if="selectedWord">
                    <div class="q-mb-md">
                        <div class="text-weight-bold">Word:</div>
                        <div>{{ selectedWord.word }}</div>
                    </div>
                    <div class="q-mb-md">
                        <div class="text-weight-bold">Description:</div>
                        <div>{{ selectedWord.description }}</div>
                    </div>
                    <div class="q-mb-md">
                        <div class="text-weight-bold">Requested By:</div>
                        <div>{{ selectedWord.user?.email }}</div>
                    </div>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn flat label="Close" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { QTableColumn, useQuasar } from 'quasar'
import api from 'src/services/api'
import { WordRequest } from 'src/types/wordRequest'

const $q = useQuasar()

const wordsRequested = ref<WordRequest[]>([])
const loading = ref(false)
const confirmDialog = ref(false)
const detailsDialog = ref(false)
const actionStatus = ref('')
const selectedWord = ref<WordRequest>({} as WordRequest)
const rejectionComment = ref('')

const columns: QTableColumn = [
    {
        name: 'word',
        required: true,
        label: 'Word',
        align: 'left',
        field: 'word',
    },
    {
        name: 'description',
        required: true,
        label: 'Description',
        align: 'left',
        field: 'description',
    },
    {
        name: 'requestedBy',
        required: true,
        label: 'Requested By',
        align: 'left',
        field: 'user.email',
    },
    {
        name: 'actions',
        required: true,
        label: 'Actions',
        align: 'center',
    },
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

const openConfirmDialog = (status: string, request: any) => {
    actionStatus.value = status
    selectedWord.value = request
    confirmDialog.value = true
}

const openDetailsDialog = (request: any) => {
    selectedWord.value = request
    detailsDialog.value = true
}

const handleConfirm = async () => {
    if (!selectedWord.value) return

    try {
        await api.wordRequests.updateRequestStatus(selectedWord.value.id, {
            status: actionStatus.value,
            denyReason: rejectionComment.value
        })

        $q.notify({
            color: 'positive',
            message: `Request ${actionStatus.value.toLowerCase()} successfully`,
            icon: 'check',
        })

        confirmDialog.value = false
        rejectionComment.value = '' // Reset the denyReason
        await fetchRequests()
    } catch (error) {
        $q.notify({
            color: 'negative',
            message: 'Failed to update request status',
            icon: 'warning',
        })
    }
}

onMounted(() => {
    fetchRequests()
})
</script>