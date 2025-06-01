<template>
  <q-page>
    <div
      class="column full-width justify-center items-center"
      style="height: fit-content"
    >
      <!-- Step 1: Initial Gloss Info Card -->
      <q-card
        v-if="!hasInitialData"
        flat
        bordered
        class="col-12 col-sm-8 col-md-6 q-pa-md"
      >
        <q-card-section>
          <div class="text-h5 q-mb-md">{{ translate('createNewGloss') }}</div>
          <q-input
            v-model="initialGlossData.gloss"
            :label="translate('gloss')"
            outlined
            class="q-mb-md"
          />
          <div class="text-subtitle2 q-mb-sm">{{ translate('firstSense') }}</div>
          <q-input
            v-model="initialGlossData.senseTitle"
            :label="translate('senseTitle')"
            outlined
            class="q-mb-md"
          />
          <q-select
            v-model="initialGlossData.lexicalCategory"
            :options="lexicalCategories"
            :label="translate('lexicalCategory')"
            outlined
            emit-value
            class="q-mb-md"
            :rules="[val => !!val || translate('lexicalCategoryRequired')]"
          />
          <div class="row justify-end">
            <q-btn
              :label="translate('continue')"
              color="primary"
              :disable="!canContinue"
              @click="initializeGlossData"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Step 2: Full Gloss Detail Component -->
      <GlossDetailComponent
        v-else
        v-model:edit-mode="editMode"
        class="col full-width"
        :gloss-data="glossData"
        :allow-edit="true"
        @save-gloss="saveGloss"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GlossDetailComponent from 'src/components/GlossDetail/GlossDetailComponent.vue';
import { GlossData } from 'src/types/models';
import api from 'src/services/api';
import useUserStore from 'src/stores/user.store';
import { useRouter } from 'vue-router';
import translate from 'src/utils/translate';
import { useQuasar } from 'quasar'; 

const router = useRouter();
const userStore = useUserStore();
const $q = useQuasar();

const hasInitialData = ref(false);
const editMode = ref(true);

const initialGlossData = ref({
  gloss: '',
  senseTitle: '',
  lexicalCategory: ''
});

const lexicalCategories = [
  { label: translate('noun'), value: 'noun' },
  { label: translate('verb'), value: 'verb' },
  { label: translate('adjective'), value: 'adjective' },
  { label: translate('adverb'), value: 'adverb' },
  { label: translate('preposition'), value: 'preposition' },
  { label: translate('conjunction'), value: 'conjunction' },
  { label: translate('interjection'), value: 'interjection' }
];

const canContinue = computed(() => {
  return !!initialGlossData.value.gloss &&
         !!initialGlossData.value.lexicalCategory;
});

const glossData = ref<GlossData>({
  id: '',
  gloss: '',
  createdAt: '',
  updatedAt: '',
  editComment: '',
  currentVersion: 0,
  isCreatedFromRequest: false,
  minimalPairsTo: [],
  relationsAsSource: [],
  minimalPairsFrom: [],
  relationsAsTarget: [],
  senses: [],
  glossRequest: null,
  isCreatedFromEdit: false,
});

const initializeGlossData = () => {
  glossData.value.gloss = initialGlossData.value.gloss;
  glossData.value.senses = [{
    id: Date.now().toString(),
    senseTitle: initialGlossData.value.senseTitle,
    priority: 1,
    lexicalCategory: initialGlossData.value.lexicalCategory,
    glossDataId: '',
    definitions: [],
    signVideos: [],
    examples: [],
    senseTranslations: [],
  }];
  hasInitialData.value = true;
};

const saveGloss = (glossData: GlossData) => {
  api.requests.create(glossData).then((response) => {
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

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/');
  }
});
</script>