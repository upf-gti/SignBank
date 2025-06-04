<template>
  <div>
    <div class="text-subtitle1 q-mb-sm">
      {{ translate('translations') }}
    </div>
    <div v-if="!translations?.length" class="text-caption text-grey">
      {{ translate('noTranslationsYet') }}
    </div>
    <div
      v-for="(translation, index) in translations.sort((a, b) => a.isNew ? -1 : b.isNew ? 1 : 0)"
      :key="translation.id || index"
      class="q-mb-sm"
    >
      <EditableModule
        :allow-edit="editMode"
        :initial-edit-state="translation.isNew as boolean"
        :show-delete="true"
        :custom-edit-label="translate('editTranslation')"
        :custom-delete-label="translate('deleteTranslation')"
        @save="() => saveTranslation(translation)"
        @cancel="() => cancelTranslation(translation)"
        @delete="() => deleteTranslation(translation)"
      >
        <template #default="{ isEditing }">
          <div class="row items-center q-gutter-sm">
            <LanguageSelector
              v-if="isEditing"
              v-model="translation.language"
              class="col"
            />
            <div
              v-else
              class="text-subtitle2"
            >
              {{ translate(translation.language) }}
            </div>
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
            class="text-body1"
          >
            {{ translation.translation }}
          </div>
        </template>
      </EditableModule>
    </div>

    <!-- Add Translation Button -->
    <q-btn
      v-if="editMode"
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
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

const $q = useQuasar();

const translations = computed(() => props.example.exampleTranslations || []);

const addTranslation = () => {
  translations.value.push({
    id: '',
    translation: '',
    language: 'CATALAN',
    exampleId: props.example.id || '',
    isNew: true
  });
};

const saveTranslation = async (translation: ExampleTranslation) => {
  try {
    let response;
    if (translation.id) {
      response = await api.glossData.updateExampleTranslation(translation.id, {
        translation: translation.translation,
        language: translation.language as Language
      });
    } else {
      response = await api.glossData.createExampleTranslation(props.example.id || '', {
        translation: translation.translation,
        language: translation.language as Language
      });
    }

    if (response.data) {
      emit('update:glossData', response.data);
      $q.notify({
        type: 'positive',
        message: translate(translation.id ? 'translationUpdatedSuccessfully' : 'translationCreatedSuccessfully')
      });
    }
  } catch (error) {
    console.error('Error saving translation:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToSaveTranslation')
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
    const response = await api.glossData.deleteExampleTranslation(translation.id);
    if (response.data) {
      emit('update:glossData', response.data);
      $q.notify({
        type: 'positive',
        message: translate('translationDeletedSuccessfully')
      });
    }
  } catch (error) {
    console.error('Error deleting translation:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeleteTranslation')
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