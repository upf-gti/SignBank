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
        :allow-edit="false"
        :is-confirm-request-page="true"
        @save-gloss="saveGloss"
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
const editMode = ref(true)
const glossData = ref<GlossData>()

onMounted(() => {
  getGlossRequestData()
})

function getGlossRequestData() {
  if(route.params.id) {
    api.requests.get(route.params.id as string)
      .then((response) => {
        glossData.value = response.data.requestedGlossData
      })
      .catch((error) => {
        console.error(error)
        error.value = translate('errors.failedToLoadGloss')
      }).finally(() => {
        loading.value = false
      })
  }
}


const saveGloss = (glossData: GlossData) => {
  api.requests.update(route.params.id as string, glossData).then((response) => {
    router.push(`/requests/view/${response.data.id}`);
    $q.notify({
      message: translate('glossCreatedSuccessfully'),
      color: 'positive',
      icon: 'check'
    });
  }).catch((error) => {
    console.error('Error creating gloss request:', error);
  });
};

const acceptRequest = () => {
  debugger
  if (!glossData.value) return;

  api.requests.accept(route.params.id as string, glossData.value)
    .then(() => {
      $q.notify({
        message: translate('requestAccepted'),
        color: 'positive',
        icon: 'check'
      });
      router.push('/glosses');
    })
    .catch((error) => {
      console.error(error);
      $q.notify({
        message: translate('errors.failedToAcceptRequest'),
        color: 'negative',
        icon: 'error'
      });
    });
};

const declineRequest = () => {
  $q.dialog({
    title: translate('declineRequest'),
    message: translate('enterDeclineReason'),
    prompt: {
      model: '',
      type: 'text',
      isValid: val => val.length > 0, // Require some reason
    },
    cancel: true,
    persistent: true,
  }).onOk((reason) => {
    api.requests.decline({
      id: route.params.id as string,
      reason
    })
      .then(() => {
        $q.notify({
          message: translate('requestDeclined'),
          color: 'info',
          icon: 'check'
        });
        router.push('/glosses');
      })
      .catch((error) => {
        console.error(error);
        $q.notify({
          message: translate('errors.failedToDeclineRequest'),
          color: 'negative',
          icon: 'error'
        });
      });
  });
};

</script>