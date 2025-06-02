<template>
  <q-page>
    <div
      class="column full-width justify-center items-center"
      style="height: fit-content"
    >
      <div v-if="loading" class="column items-center q-pa-md">
        <q-spinner color="primary" size="3em" />
        <div class="q-mt-sm">{{ translate('loading') }}</div>
      </div>

      <div v-else-if="error" class="text-negative q-pa-md">
        {{ error }}
      </div>

      <template v-else>
        <!-- Gloss Detail Component -->
        <GlossDetailComponent
          v-model:edit-mode="editMode"
          class="col full-width"
          :gloss-data="glossData"
          :allow-edit="true"
          @save-gloss="saveGloss"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GlossDetailComponent from 'src/components/GlossDetail/GlossDetailComponent.vue';
import { GlossData } from 'src/types/models';
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
    const response = await api.requests.get(requestId);
    glossData.value = response.data.requestedGlossData;
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

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/');
    return;
  }
  await fetchGlossRequest();
});
</script>