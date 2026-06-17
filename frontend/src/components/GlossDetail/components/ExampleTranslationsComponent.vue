<template>
  <div
    v-if="translations.length > 0 || allowEdit"
    class="example-translations"
  >
    <div
      v-for="(translation, index) in sortedTranslations"
      :key="translation.id || index"
      class="q-mb-sm"
    >
      <EditableModule
        :allow-edit="allowEdit"
        :initial-edit-state="translation.isNew || false"
        :show-delete="allowEdit"
        :custom-edit-label="translate('editTranslation')"
        :custom-delete-label="translate('deleteTranslation')"
        @save="() => saveTranslation(translation)"
        @cancel="() => cancelTranslation(translation)"
        @delete="() => deleteTranslation(translation)"
      >
        <template #default="{ isEditing }">
          <div class="q-mx-md">
            <div class="row items-center q-gutter-sm">
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
              class="col-12 q-mt-sm"
            />
            <div
              v-else
              class="text-body1 q-mt-xs"
            >
              {{ translation.translation }}
            </div>
          </div>
        </template>
      </EditableModule>
    </div>

    <q-btn
      v-if="allowEdit"
      flat
      :label="translate('addExampleTranslation')"
      icon="add"
      class="q-mt-sm"
      @click="addTranslation"
    />
  </div>
</template>

<script setup lang="ts">
import { Example, ExampleTranslation, GlossData, Language } from 'src/types/models';
import translate from 'src/utils/translate';
import { useQuasar } from 'quasar';
import LanguageSelector from './LanguageSelector.vue';
import EditableModule from 'src/components/Shared/EditableModule.vue';
import { computed } from 'vue';
import { api } from 'src/services/api';

const props = defineProps<{
  example: Example;
  allowEdit: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

const $q = useQuasar();

const translations = computed(() => props.example.exampleTranslations || []);

const sortedTranslations = computed(() => {
  return [...translations.value].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;

    const languageOrder: Record<string, number> = { CATALAN: 1, SPANISH: 2, ENGLISH: 3 };
    const aOrder = languageOrder[a.language] || 999;
    const bOrder = languageOrder[b.language] || 999;
    return aOrder - bOrder;
  });
});

const addTranslation = () => {
  translations.value.push({
    id: '',
    translation: '',
    language: 'CATALAN',
    exampleId: props.example.id || '',
    isNew: true,
  });
};

const saveTranslation = async (translation: ExampleTranslation) => {
  try {
    let response;
    if (translation.id) {
      response = await api.exampleTranslations.updateExampleTranslation(translation.id, {
        translation: translation.translation,
        language: translation.language as Language,
      });
    } else {
      response = await api.exampleTranslations.createExampleTranslation(props.example.id || '', {
        translation: translation.translation,
        language: translation.language as Language,
      });
    }

    if (response.data) {
      emit('update:glossData', response.data);
      $q.notify({
        type: 'positive',
        message: translate(translation.id ? 'translationUpdatedSuccessfully' : 'translationCreatedSuccessfully'),
      });
    }
  } catch (error) {
    console.error('Error saving translation:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToSaveTranslation'),
    });
  }
};

const deleteTranslation = async (translation: ExampleTranslation) => {
  if (!translation.id) {
    const index = translations.value.findIndex(t => t === translation);
    if (index !== -1) {
      translations.value.splice(index, 1);
    }
    return;
  }

  try {
    const response = await api.exampleTranslations.deleteExampleTranslation(translation.id);
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
  }
};

const cancelTranslation = (translation: ExampleTranslation) => {
  if (!translation.id) {
    const index = translations.value.findIndex(t => t === translation);
    if (index !== -1) {
      translations.value.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.example-translations {
  margin-top: 4px;
}
</style>
