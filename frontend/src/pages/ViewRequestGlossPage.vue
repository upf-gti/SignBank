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
        :label="translate('goBack')"
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
        class="col full-width"
        :gloss-data="glossData"
        :edit-mode="false"
        :allow-edit="false"
        :request-status="requestStatus"
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
import type { GlossData, RequestStatus } from 'src/types/models'

const route = useRoute()
const router = useRouter()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const requestStatus = ref<RequestStatus>()
const glossData = ref<GlossData>()

onMounted(() => {
  getGlossRequestData()
})

function getGlossRequestData() {
  if(route.params.id) {
    api.glossRequests.get(route.params.id as string)
      .then((response) => {
        glossData.value = response.data.requestedGlossData
        requestStatus.value = response.data.status
      })
      .catch((err) => {
        console.error(err)
        error.value = translate('errors.failedToLoadGlossRequest')
      }).finally(() => {
        loading.value = false
      })
  }
}

</script>