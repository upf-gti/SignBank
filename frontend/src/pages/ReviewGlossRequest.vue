<template>
  <q-page>
    <div
      class="column full-width justify-center items-center"
      style="height: fit-content"
    >
      <div
        v-if="loading"
        class="column items-center q-pa-md"
      >
        <q-spinner
          color="primary"
          size="3em"
        />
        <div class="q-mt-sm">
          {{ translate('loading') }}
        </div>
      </div>

      <div
        v-else-if="error"
        class="text-negative q-pa-md"
      >
        {{ error }}
      </div>

      <template v-else>
        <!-- Admin Review Header -->
        <div class="q-pa-md full-width">
          <div class="row items-center justify-between">
            <div class="text-h5">
              {{ translate('reviewRequest') }}
            </div>
            <q-btn
              flat
              icon="arrow_back"
              :label="translate('backToRequests')"
              @click="router.push('/confirm-requests')"
            />
          </div>
          <div class="text-body2 text-grey-6 q-mt-sm">
            {{ translate('requestedBy') }}: {{ glossRequest?.creator?.username }} 
            ({{ new Date(glossRequest?.createdAt || '').toLocaleDateString() }})
          </div>
        </div>

        <!-- Gloss Detail Component -->
        <GlossDetailComponent
          v-model:edit-mode="editMode"
          class="col full-width"
          :gloss-data="glossData"
          :allow-edit="false"
          :is-confirm-request-page="true"
          :request-status="glossRequest?.status"
          @accept-request="acceptRequest"
          @decline-request="declineRequest"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GlossDetailComponent from 'src/components/GlossDetail/GlossDetailComponent.vue';
import { GlossData, GlossRequest, RequestStatus } from 'src/types/models';
import api from 'src/services/api';
import useUserStore from 'src/stores/user.store';
import { useRouter, useRoute } from 'vue-router';
import translate from 'src/utils/translate';
import { useQuasar } from 'quasar';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const $q = useQuasar();

const loading = ref(true);
const error = ref<string | null>(null);
const editMode = ref(true);
const glossRequest = ref<GlossRequest | null>(null);
const glossData = ref<GlossData>({
  id: '',
  gloss: '',
  createdAt: '',
  updatedAt: '',
  editComment: '',
  currentVersion: 0,
  isCreatedFromRequest: false,
  minimalPairsAsSource: [],
  relationsAsSource: [],
  minimalPairsAsTarget: [],
  relationsAsTarget: [],
  senses: [],
  glossRequest: null,
  isCreatedFromEdit: false,
});

const fetchGlossRequest = async () => {
  try {
    const requestId = route.params.id as string;
    const response = await api.glossRequests.get(requestId);
    glossRequest.value = response.data as any as GlossRequest;
    glossData.value = response.data.requestedGlossData;
  } catch (err) {
    console.error('Error fetching gloss request:', err);
    error.value = translate('errors.failedToLoadGlossRequest');
  } finally {
    loading.value = false;
  }
};

const acceptRequest = async (updatedGlossData: GlossData) => {
  try {
    loading.value = true;
    const requestId = route.params.id as string;
    await api.glossRequests.accept(requestId);
    
    // Show success notification
    $q.notify({
      type: 'positive',
      message: translate('requestAcceptedSuccessfully')
    });
    
    // Redirect to pending requests page
    router.push('/confirm-requests');
  } catch (err) {
    console.error('Error accepting request:', err);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToAcceptRequest')
    });
  } finally {
    loading.value = false;
  }
};

const declineRequest = async () => {
  try {
    // Show dialog to get decline reason
    $q.dialog({
      title: translate('declineRequest'),
      message: translate('enterDeclineReason'),
      prompt: {
        model: '',
        type: 'text'
      },
      cancel: true,
      persistent: true
    }).onOk(async (reason: string) => {
      if (!reason.trim()) {
        $q.notify({
          type: 'negative',
          message: translate('declineReasonRequired')
        });
        return;
      }
      
      try {
        loading.value = true;
        const requestId = route.params.id as string;
        await api.glossRequests.decline(requestId, { denyReason: reason });
        
        // Show success notification
        $q.notify({
          type: 'positive',
          message: translate('requestDeclinedSuccessfully')
        });
        
        // Redirect to pending requests page
        router.push('/confirm-requests');
      } catch (err) {
        console.error('Error declining request:', err);
        $q.notify({
          type: 'negative',
          message: translate('errors.failedToDeclineRequest')
        });
      } finally {
        loading.value = false;
      }
    });
  } catch (err) {
    console.error('Error in decline dialog:', err);
  }
};

onMounted(async () => {
  // Check if user is admin
  if (!userStore.isAdmin) {
    router.push('/');
    return;
  }
  await fetchGlossRequest();
});
</script> 