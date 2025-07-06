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
        <!-- Gloss Detail Component -->
        <GlossDetailComponent
          v-model:edit-mode="editMode"
          class="col full-width"
          :gloss-data="glossData"
          :allow-edit="glossRequest?.status === 'NOT_COMPLETED'"
          :request-status="glossRequest?.status"
          :submitting="submitting"
          @save-gloss="saveGloss"
          @submit-request="submitRequest"
          @update:gloss-data="handleGlossDataUpdate"
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
import { validateGloss } from 'src/utils/glossValidation';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const $q = useQuasar();

const loading = ref(true);
const error = ref<string | null>(null);
const submitting = ref(false);
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
  glossVideos: []
});

const fetchGlossRequest = async () => {
  try {
    const requestId = route.params.id as string;
    const response = await api.glossRequests.get(requestId);
    glossRequest.value = response.data as any as GlossRequest;
    glossData.value = response.data.requestedGlossData;
    
    // Set edit mode based on request status - only editable if NOT_COMPLETED
    editMode.value = response.data.status === RequestStatus.NOT_COMPLETED;
  } catch (err) {
    console.error('Error fetching gloss request:', err);
    error.value = translate('errors.failedToLoadGlossRequest');
  } finally {
    loading.value = false;
  }
};

const saveGloss = async (updatedGlossData: GlossData) => {
  try {
    loading.value = true
    const response = await api.glossData.editGloss(updatedGlossData.id || '', updatedGlossData)
    glossData.value = response.data
    editMode.value = false
    
    // Show success notification
    $q.notify({
      type: 'positive',
      message: translate('glossSavedSuccessfully')
    })
  } catch (err) {
    console.error(err)
    error.value = translate('errors.failedToSaveGloss')
    
    // Show error notification
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToSaveGloss')
    })
  } finally {
    loading.value = false
  }
}

const submitRequest = async () => {
  try {
    // Validate the gloss data before submitting
    const validationErrors = validateGloss(glossData.value);

    if (validationErrors.length > 0) {
      // Show validation errors to the user
      $q.dialog({
        title: translate('validationErrors'),
        message: `
          <ul style="list-style-type: disc; margin: 0; padding-left: 20px;">
            ${validationErrors.map(error => `<li>${error.message}</li>`).join('')}
          </ul>
        `,
        html: true,
        style: 'min-width: 300px',
        ok: {
          label: translate('ok'),
          flat: true,
          color: 'primary'
        }
      });
      return;
    }

    submitting.value = true;
    const requestId = route.params.id as string;
    await api.glossRequests.submit(requestId);
    
    // Show success notification
    $q.notify({
      type: 'positive',
      message: translate('requestSubmittedSuccessfully')
    });
    
    // Refresh the request data
    await fetchGlossRequest();
  } catch (err) {
    console.error('Error submitting request:', err);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToSubmitRequest')
    });
  } finally {
    submitting.value = false;
  }
};

const handleGlossDataUpdate = (updatedGlossData: GlossData) => {
  glossData.value = updatedGlossData
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/').catch((err) => {
      console.error(err)
    })
    return;
  }
  await fetchGlossRequest();
});
</script>