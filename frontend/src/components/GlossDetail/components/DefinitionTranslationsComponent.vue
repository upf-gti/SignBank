<template>
  <div class="q-mt-md" v-if="translations.length > 0 || allowEdit">
    <div class="text-subtitle2 q-mb-sm">
      {{ translate('definitionTranslations') }}
    </div>
    <div
      v-for="(definitionTranslation, tIndex) in translations"
      :key="definitionTranslation.id || tIndex"
    >
      <EditableModule
        :allow-edit="allowEdit"
        :initial-edit-state="definitionTranslation.isNew || false"
        :show-delete="true"
        :custom-delete-label="translate('deleteDefinitionTranslation')"
        @save="() => saveDefinitionTranslation(definitionTranslation)"
        @cancel="cancelDefinitionTranslationEdit"
        @delete="() => deleteDefinitionTranslation(definitionTranslation)"
      >
        <template #header>
          <q-chip size="sm">
            {{ definitionTranslation.language }}
          </q-chip>
        </template>
        <template #default="{ isEditing }">
          <div class="row items-center q-gutter-md">
            <LanguageSelector 
              v-if="isEditing"
              v-model="definitionTranslation.language"
              class="col"
            />
            <q-input
              v-if="isEditing"
              v-model="definitionTranslation.translation"
              :label="translate('definitionTranslation')"
              outlined
              dense
              class="col"
            />
            <div
              v-else
              class="q-ml-lg"
            >
              {{ definitionTranslation.translation }}
            </div>
          </div>
        </template>
      </EditableModule>
    </div>
    <q-btn
      v-if="allowEdit"
      flat
      class="q-mt-sm"
      icon="add"
      :label="translate('addDefinitionTranslation')"
      @click="addTranslation"
    />
  </div>
</template>

<script setup lang="ts">
import { DefinitionTranslation, Language, Sense, Definition } from 'src/types/models';
import translate from 'src/utils/translate';
import LanguageSelector from './LanguageSelector.vue'
import EditableModule from 'src/components/Shared/EditableModule.vue'
import { ref } from 'vue';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';

const $q = useQuasar()
const loading = ref(false)

const props = defineProps<{
  allowEdit: boolean;
  definitionId: string;
  translations: DefinitionTranslation[];
}>();

const emit = defineEmits<{
  (e: 'update:translations', translations: DefinitionTranslation[]): void;
}>();

const addTranslation = () => {
  emit('update:translations', [
    ...props.translations,
    {
      id: '',
      translation: '',
      language: 'CATALAN',
      definitionId: props.definitionId,
      isNew: true
    }
  ]);
}

const saveDefinitionTranslation = async (definitionTranslation: DefinitionTranslation) => {
  try {
    loading.value = true;
    let response;

    if (definitionTranslation.id) {
      // Update existing translation
      response = await api.definitions.updateTranslation(
        props.definitionId,
        definitionTranslation.id,
        {
          translation: definitionTranslation.translation,
          language: definitionTranslation.language as Language
        }
      );
    } else {
      // Create new translation
      response = await api.definitions.createTranslation(
        props.definitionId,
        {
          translation: definitionTranslation.translation,
          language: definitionTranslation.language as Language
        }
      );
    }
    
    if (response.data && 'senses' in response.data) {
      // Find the updated translation in the response
      const updatedGlossData = response.data;
      const updatedDefinition = updatedGlossData.senses
        .flatMap((sense: Sense) => sense.definitions)
        .find((def: Definition) => def.id === props.definitionId);
      
      if (updatedDefinition) {
        emit('update:translations', updatedDefinition.definitionTranslations);
        
        $q.notify({
          type: 'positive',
          message: translate(definitionTranslation.id ? 'translationSavedSuccessfully' : 'translationCreatedSuccessfully')
        });
      }
    }
  } catch (error) {
    console.error('Error saving translation:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToSaveTranslation')
    });
  } finally {
    loading.value = false;
  }
}

const deleteDefinitionTranslation = async (definitionTranslation: DefinitionTranslation) => {
  if (!definitionTranslation.id) {
    // If it's a new translation that hasn't been saved yet, just remove it from the list
    emit('update:translations', props.translations.filter(t => t !== definitionTranslation));
    return;
  }

  try {
    loading.value = true;
    const response = await api.definitions.deleteTranslation(props.definitionId, definitionTranslation.id);
    
    if (response.data && 'senses' in response.data) {
      // Find the updated translations in the response
      const updatedGlossData = response.data;
      const updatedDefinition = updatedGlossData.senses
        .flatMap((sense: Sense) => sense.definitions)
        .find((def: Definition) => def.id === props.definitionId);
      
      if (updatedDefinition) {
        emit('update:translations', updatedDefinition.definitionTranslations);
        
        $q.notify({
          type: 'positive',
          message: translate('translationDeletedSuccessfully')
        });
      }
    }
  } catch (error) {
    console.error('Error deleting translation:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeleteTranslation')
    });
  } finally {
    loading.value = false;
  }
}

const cancelDefinitionTranslationEdit = () => {
  // Reset any pending changes if needed
}
</script> 