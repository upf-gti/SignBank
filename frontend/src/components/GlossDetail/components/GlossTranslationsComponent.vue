<template>
  <q-card-section
    class="gloss-translations"
    :class="{ 'gloss-translations--compact q-px-none q-pb-none': compact }"
  >
    <div
      v-if="!inlineEdit && !hideSectionTitle"
      class="text-h5 q-mb-md row justify-between items-center"
    >
      {{ translate('glossTranslations') }}
      <q-btn
        v-if="editMode"
        flat
        dense
        icon="add"
        :label="translate('addSenseTranslation')"
        @click="addTranslation"
      />
    </div>
    <div
      v-else-if="inlineEdit"
      class="text-subtitle1 text-weight-medium q-mb-md"
    >
      {{ translate('glossTranslations') }}
    </div>

    <template v-if="compact && !editMode">
      <div
        v-for="(translation, index) in glossTranslations"
        :key="translation.id || index"
        class="gloss-translations__item q-mb-sm"
      >
        <q-chip
          dense
          outline
          color="primary"
          class="q-mb-xs"
        >
          {{ translate(translation.language) }}
        </q-chip>
        <div class="text-body1">
          {{ translation.translation }}
        </div>
      </div>
    </template>

    <q-list
      v-else
      class="row q-col-gutter-md"
    >
      <q-item
        v-for="(translation, index) in glossTranslations"
        :key="translation.id || index"
        class="col-12 q-pa-none"
        :class="{ 'col-md-6': !compact }"
        dense
      >
        <EditableModule
          :allow-edit="editMode"
          :inline-edit="inlineEdit"
          :initial-edit-state="translation.isNew as boolean"
          :show-delete="Boolean(translation.id) || glossTranslations.length > 1"
          class="full-width"
          @save="() => saveTranslation(translation)"
          @cancel="() => cancelTranslation(translation)"
          @delete="() => deleteTranslation(translation)"
        >
          <template #default="{ isEditing }">
            <q-card
              bordered
              flat
              class="full-width q-pa-md"
            >
              <div class="row justify-between items-center q-mb-sm">
                <LanguageSelector
                  v-if="isEditing"
                  v-model="translation.language"
                  class="col"
                />
                <q-chip
                  v-else
                  dense
                >
                  {{ translate(translation.language) }}
                </q-chip>
              </div>

              <q-input
                v-if="isEditing"
                v-model="translation.translation"
                :label="translate('translation')"
                outlined
                dense
              />
              <div
                v-else
                class="text-body1"
              >
                {{ translation.translation }}
              </div>
            </q-card>
          </template>
        </EditableModule>
      </q-item>
    </q-list>

    <q-btn
      v-if="inlineEdit && editMode && glossTranslations.length > 0"
      flat
      dense
      icon="add"
      color="primary"
      :label="translate('addSenseTranslation')"
      class="q-mt-sm"
      @click="addTranslation"
    />
  </q-card-section>
</template>

<script setup lang="ts">
import { GlossData, GlossTranslation, Language } from 'src/types/models';
import translate from 'src/utils/translate';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';
import LanguageSelector from './LanguageSelector.vue';
import EditableModule from 'src/components/Shared/EditableModule.vue';
import { ref, computed, watch, onMounted } from 'vue';

const $q = useQuasar();
const loading = ref(false);

const props = defineProps<{
  glossData: GlossData;
  editMode: boolean;
  inlineEdit?: boolean;
  hideSectionTitle?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

const localGlossData = ref<GlossData>({ ...props.glossData });

watch(() => props.glossData, (newGlossData) => {
  localGlossData.value = { ...newGlossData };
}, { deep: true });

const glossTranslations = computed(() => {
  const translations = localGlossData.value.glossTranslations || [];

  return translations.sort((a, b) => {
    const languageOrder = { CATALAN: 1, SPANISH: 2, ENGLISH: 3 };
    const orderA = languageOrder[a.language as keyof typeof languageOrder] || 4;
    const orderB = languageOrder[b.language as keyof typeof languageOrder] || 4;
    return orderA - orderB;
  });
});

onMounted(() => {
  if (props.inlineEdit && props.editMode && glossTranslations.value.length === 0) {
    addTranslation();
  }
});

const addTranslation = () => {
  if (!localGlossData.value.glossTranslations) {
    localGlossData.value.glossTranslations = [];
  }

  localGlossData.value.glossTranslations.push({
    id: '',
    translation: '',
    language: 'CATALAN',
    glossDataId: localGlossData.value.id || '',
    isNew: true,
  });
};

const saveTranslation = async (translation: GlossTranslation, silent = false) => {
  try {
    loading.value = true;
    let response;

    if (translation.id) {
      response = await api.translations.updateGlossTranslation(translation.id, {
        translation: translation.translation,
        language: translation.language as Language,
      });
    } else {
      response = await api.translations.createGlossTranslation(localGlossData.value.id || '', {
        translation: translation.translation,
        language: translation.language as Language,
      });
    }

    if (response.data) {
      emit('update:glossData', response.data);
      if (!silent) {
        $q.notify({
          type: 'positive',
          message: translate(translation.id ? 'translationUpdatedSuccessfully' : 'translationCreatedSuccessfully'),
        });
      }
    }
  } catch (error) {
    console.error('Error saving translation:', error);
    if (!silent) {
      $q.notify({
        type: 'negative',
        message: translate('errors.failedToSaveTranslation'),
      });
    }
    throw error;
  } finally {
    loading.value = false;
  }
};

async function saveAll(silent = false): Promise<void> {
  for (const translation of glossTranslations.value) {
    if (!translation.translation?.trim()) continue;
    await saveTranslation(translation, silent);
  }
}

function getStepValidationErrors(): string[] {
  const hasTranslation = glossTranslations.value.some(t => t.translation?.trim());
  if (!hasTranslation) {
    return [translate('validation.senseTranslationRequired', { senseTitle: localGlossData.value.gloss })];
  }
  return [];
}

defineExpose({ saveAll, getStepValidationErrors });

const deleteTranslation = async (translation: GlossTranslation) => {
  if (!translation.id) {
    const index = localGlossData.value.glossTranslations?.findIndex((t) => t === translation) ?? -1;
    if (index !== -1) {
      localGlossData.value.glossTranslations!.splice(index, 1);
    }
    return;
  }

  try {
    loading.value = true;
    const response = await api.translations.deleteGlossTranslation(translation.id);

    if (response.data) {
      emit('update:glossData', response.data);
      $q.notify({
        type: 'positive',
        message: translate('translationDeletedSuccessfully'),
      });
    }
  } catch (error) {
    console.error('Error deleting translation:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeleteTranslation'),
    });
  } finally {
    loading.value = false;
  }
};

const cancelTranslation = (translation: GlossTranslation) => {
  if (!translation.id) {
    const index = localGlossData.value.glossTranslations?.findIndex((t) => t === translation) ?? -1;
    if (index !== -1) {
      localGlossData.value.glossTranslations!.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.gloss-translations--compact {
  padding-top: 12px;
}

.gloss-translations__item:last-child {
  margin-bottom: 0;
}
</style>
