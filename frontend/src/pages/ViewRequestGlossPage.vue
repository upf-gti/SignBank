<template>
  <q-page>
    <LoadingComponent
      v-if="loading"
      :loading="loading"
    />
  
    <div
      v-else-if="error"
      class="text-center q-pa-md"
    >
      <div class="text-negative text-h6">
        {{ error }}
      </div>
      <q-btn
        color="primary"
        :label="translate('common.goBack')"
        class="q-mt-md"
        @click="router.go(-1)"
      />
    </div>
  
    <div
      v-else
      class="column full-width justify-center items-center"
      style="height: fit-content"
    >
      <GlossDetailComponent
        v-if="glossData"
        v-model:edit-mode="editMode"
        class="col full-width"
        :gloss-data="glossData"
        :allow-edit="true"
        @accept-request="acceptRequest"
        @decline-request="declineRequest"
      />
    </div>
  </q-page>
</template>
  
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import translate from 'src/utils/translate'
import LoadingComponent from 'src/components/LoadingComponent.vue'
import GlossDetailComponent from 'src/components/GlossDetail/GlossDetailComponent.vue'
import { api } from 'src/services/api'
import type { GlossData } from 'src/types/models'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const editMode = ref(false)
const glossData = ref<GlossData>()

onMounted(() => {
  getGlossRequestData()
})

function getGlossRequestData() {
  if(route.params.id) {
    api.glossRequests.get(route.params.id as string)
      .then((response) => {
        glossData.value = response.data.requestedGlossData
      })
      .catch((err) => {
        console.error(err)
        error.value = translate('errors.failedToLoadGlossRequest')
      }).finally(() => {
        loading.value = false
      })
  }
}

const acceptRequest = async (updatedGlossData: GlossData) => {
  try {
    loading.value = true
    await api.glossRequests.accept(route.params.id as string)
    
    // Show success notification
    $q.notify({
      type: 'positive',
      message: translate('requestAcceptedSuccessfully')
    })
    
    // Redirect to pending requests page
    router.push('/pending-requests').catch((err) => {
      console.error(err)
    })
  } catch (err) {
    console.error(err)
    error.value = translate('errors.failedToAcceptRequest')
    
    // Show error notification
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToAcceptRequest')
    })
  } finally {
    loading.value = false
  }
}

const declineRequest = async () => {
  try {
    loading.value = true
    const requestId = route.params.id as string
    await api.glossRequests.decline(requestId, { denyReason: 'Declined by admin' })
    
    // Show success notification
    $q.notify({
      type: 'positive',
      message: translate('requestDeclinedSuccessfully')
    })
    
    // Redirect to pending requests page
    router.push('/pending-requests').catch((err) => {
      console.error(err)
    })
  } catch (err) {
    console.error(err)
    error.value = translate('errors.failedToDeclineRequest')
    
    // Show error notification
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeclineRequest')
    })
  } finally {
    loading.value = false
  }
}

</script>