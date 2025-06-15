<template>
  <q-card-section>
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('glossTranslations') }}
      <q-btn
        v-if="editMode"
        flat
        round
        icon="add"
        :label="translate('addSenseTranslation')"
        @click="addTranslation"
      />
    </div>

    <q-list class="row q-col-gutter-md">
      <q-item
        v-for="(translation, index) in senseTranslations"
        :key="translation.id || index"
        class="col-12 col-md-6 q-pa-none"
        style="min-width: 300px"
        dense
      >
        <EditableModule        
          :allow-edit="editMode"
          :initial-edit-state="translation.isNew as boolean"
          :show-delete="true"
          :custom-edit-label="translate('editTranslation')"
          :custom-delete-label="translate('deleteTranslation')"
          class="full-width q-pa-none"
          @save="() => saveTranslation(translation)"
          @cancel="() => cancelTranslation(translation)"
          @delete="() => deleteTranslation(translation)"
        >
          <template #default="{ isEditing }">
            <q-card
              bordered
              flat
              class="full-width q-pa-md"
              style="min-height: 120px"
            >
              <div class="row justify-between items-center q-mb-sm">
                <LanguageSelector
                  v-if="isEditing"
                  v-model="translation.language"
                  class="col"
                />
                <div
                  v-else
                  class="text-subtitle1"
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
                class="col-12"
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
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense, SenseTranslation, GlossData, Language } from 'src/types/models';
import translate from 'src/utils/translate';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';
import LanguageSelector from './LanguageSelector.vue';
import EditableModule from 'src/components/Shared/EditableModule.vue';
import { ref, computed, watch } from 'vue';

const $q = useQuasar();
const loading = ref(false);

const props = defineProps<{
  sense: Sense;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

// Create a local copy of the sense data
const localSense = ref<Sense>({ ...props.sense });

// Watch for changes in the prop and update local copy
watch(() => props.sense, (newSense) => {
  localSense.value = { ...newSense };
}, { deep: true });

const senseTranslations = computed(() => {
  return localSense.value.senseTranslations || [];
});

const addTranslation = () => {
  // Initialize senseTranslations array if it doesn't exist
  if (!localSense.value.senseTranslations) {
    localSense.value.senseTranslations = [];
  }
  
  localSense.value.senseTranslations.push({
    id: '',
    translation: '',
    language: 'CATALAN',
    senseId: localSense.value.id || '',
    isNew: true
  });
};

const saveTranslation = async (translation: SenseTranslation) => {
  try {
    loading.value = true;
    let response;

    if (translation.id) {
      response = await api.translations.updateSenseTranslation(translation.id, {
        translation: translation.translation,
        language: translation.language as Language
      });
    } else {
      response = await api.translations.createSenseTranslation(localSense.value.id || '', {
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
  } finally {
    loading.value = false;
  }
};

const deleteTranslation = async (translation: SenseTranslation) => {
  if (!translation.id) {
    // Initialize senseTranslations array if it doesn't exist
    if (!localSense.value.senseTranslations) {
      localSense.value.senseTranslations = [];
    }
    
    const index = localSense.value.senseTranslations.findIndex(t => t === translation);
    if (index !== -1) {
      localSense.value.senseTranslations.splice(index, 1);
    }
    return;
  }

  try {
    loading.value = true;
    const response = await api.translations.deleteSenseTranslation(translation.id);
    
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
  } finally {
    loading.value = false;
  }
};

const cancelTranslation = (translation: SenseTranslation) => {
  if (!translation.id) {
    // Initialize senseTranslations array if it doesn't exist
    if (!localSense.value.senseTranslations) {
      localSense.value.senseTranslations = [];
    }
    
    const index = localSense.value.senseTranslations.findIndex(t => t === translation);
    if (index !== -1) {
      localSense.value.senseTranslations.splice(index, 1);
    }
  }
};
</script> 