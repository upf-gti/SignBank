<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('definitions') }}
      <q-btn
        v-if="allowEdit"
        unelevated
        outline
        color="primary"
        :label="translate('addDefinition')"
        icon="add"
        @click="addDefinition"
      />
    </div>
    <q-list>
      <q-item
        v-for="(definition, index) in definitions"
        :key="definition.id || index"
        class="column q-mb-lg"
      >
        <EditableModule
          :allow-edit="allowEdit"
          :allow-delete="true"
          @save="() => saveDefinition(definition)"
          @cancel="cancelDefinitionEdit"
        >
          <template #default="{ isEditing }">
            <!-- Definition Title -->
            <q-input
              v-if="isEditing"
              v-model="definition.title"
              :label="translate('definitionTitle')"
              outlined
              dense
              class="col-12 q-mb-sm"
            />
            <div v-else class="q-mb-md text-subtitle1">
              {{ definition.title }}
            </div>

            <!-- Definition Text -->
            <q-input
              v-if="isEditing"
              v-model="definition.definition"
              :label="translate('definition')"
              outlined            
              dense
              class="col-12 q-mb-sm"
            />
            <div v-else class="q-mb-md">
              {{ definition.definition }}
            </div>

            <!-- Definition Translations -->
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">{{ translate('definitionTranslations') }}</div>
              <div v-for="(translation, tIndex) in definition.definitionTranslations" :key="translation.id || tIndex">
                <EditableModule
                  :allow-edit="allowEdit"
                  @save="() => saveTranslation(definition, translation)"
                  @cancel="cancelTranslationEdit"
                >
                  <template #header>
                    <q-chip size="sm">{{ translation.language }}</q-chip>
                  </template>
                  <template #default="{ isEditing }">
                    <div class="row items-center q-gutter-md">
                      <LanguageSelector 
                        v-if="isEditing"
                        v-model="translation.language"
                        class="col"
                      />
                      <q-input
                        v-if="isEditing"
                        v-model="translation.translation"
                        :label="translate('translation')"
                        outlined
                        dense
                        class="col"
                      />
                      <div v-else class="q-ml-lg">
                        {{ translation.translation }}
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
        </EditableModule>
      </q-item>
      <q-item
        v-if="displayCreateNewDefinition"
        key="newDefinition"
        class="column q-mb-lg"
      >
        <EditableModule
          :allow-edit="allowEdit"
          :initial-edit-state="true"
          @save="createNewDefinition"
          @cancel="displayCreateNewDefinition = false"
        >
          <template #default="{ isEditing }">
            <!-- Definition Title -->
            <q-input
              v-if="isEditing"
              v-model="newDefinition.title"
              :label="translate('definitionTitle')"
              outlined
              dense
              class="col-12 q-mb-sm"
            />

            <!-- Definition Text -->
            <q-input
              v-if="isEditing"
              v-model="newDefinition.definition"
              :label="translate('definition')"
              outlined            
              dense
              class="col-12 q-mb-sm"
            />
            <div v-else class="q-mb-md">
              {{ newDefinition.definition }}
            </div>
          </template>
        </EditableModule>
      </q-item>
    </q-list>
    <!-- Translations of the sense -->
    <div class="column">
      <div class="text-h5 q-mt-md row justify-between items-center">
        {{ translate('glossTranslations') }}
        <q-btn
          v-if="editMode"
          flat
          round
          icon="add"
          :label="translate('addGlossTranslation')"
          @click="addSenseTranslation"
        />
      </div>
      <q-list class="row">
        <q-item
          v-for="(translation, index) in senseTranslations"
          :key="translation.id || index"
          class="col"
          style="min-width: 300px"
        >
          <q-card
            bordered
            flat
            class="col-12 q-pa-md"
          >
            <div class="row justify-between items-center">
              <LanguageSelector 
                v-if="editMode"
                v-model="translation.language"
                class="col"
              />
              <div v-else>
                {{ translation.language }}
              </div>
              <q-btn
                v-if="editMode"
                flat
                round
                icon="delete"
                :label="translate('deleteGlossTranslation')"
                class="q-mx-md"
                @click="removeSenseTranslation"
              />
            </div>
            <q-input
              v-if="editMode"
              v-model="translation.translation"
              :label="translate('translation')"
              outlined
              dense
              class="col-12 q-mt-sm"
            />
            <q-item-label
              v-else
              class="text-h6"
            >
              {{ translation.translation }}
            </q-item-label>
          </q-card>
        </q-item>
      </q-list>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense, Definition, Translation, SenseTranslation, GlossData } from 'src/types/models';
import translate from 'src/utils/translate';
import LanguageSelector from './LanguageSelector.vue'
import EditableModule from 'src/components/Shared/EditableModule.vue'
import { ref, computed } from 'vue';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';

const $q = useQuasar()
const loading = ref(false)
const displayCreateNewDefinition = ref(false)
const newDefinition = ref<Definition>({
  id: '',
  title: '',
  definition: '',
  videoDefinitionId: '',
  senseId: '',
  definitionTranslations: [],
  isEditing: true,
  isNew: true,
  videoDefinition: { id: '', url: '' }
})

const props = defineProps<{
  allowEdit: boolean;
  editMode: boolean;
  sense: Sense;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

// Add computed properties for safe access
const definitions = computed(() => props.sense?.definitions || []);
const senseTranslations = computed(() => props.sense?.senseTranslations || []);

const addDefinition = () => {
  displayCreateNewDefinition.value = true;
  newDefinition.value = {
    id: '',
    title: '',
    definition: '',
    videoDefinitionId: '',
    senseId: props.sense?.id || '',
    definitionTranslations: [],
    isEditing: true,
    isNew: true,
    videoDefinition: { id: '', url: '' }
  };
}

const isGlossData = (data: any): data is GlossData => {
  return data && 
    typeof data === 'object' && 
    'gloss' in data &&
    'createdAt' in data &&
    'updatedAt' in data &&
    'senses' in data;
}

const saveDefinition = async (definition: Definition) => {
  if (!props.sense?.id) return;

  try {
    loading.value = true;
    
    const response = await api.glossData.updateDefinition(props.sense.id, definition.id || '', {
      title: definition.title,
      definition: definition.definition,
      videoDefinitionId: definition.videoDefinitionId
    });

    if (response.data && isGlossData(response.data)) {
      emit('update:glossData', response.data);

      $q.notify({
        type: 'positive',
        message: translate('definitionSavedSuccessfully')
      });
    }
  } catch (error) {
    console.error('Error saving definition:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToSaveDefinition')
    });
  } finally {
    loading.value = false;
  }
}

const createNewDefinition = async () => {
  if (!props.sense?.id) return;

  try {
    loading.value = true;

    const response = await api.glossData.createDefinition(props.sense.id, {
      title: newDefinition.value.title,
      definition: newDefinition.value.definition
    });

    if (response.data && isGlossData(response.data)) {
      emit('update:glossData', response.data);

      displayCreateNewDefinition.value = false;
      newDefinition.value = {
        id: '',
        title: '',
        definition: '',
        videoDefinitionId: '',
        senseId: props.sense.id,
        definitionTranslations: [],
        isEditing: true,
        isNew: true,
        videoDefinition: { id: '', url: '' }
      }
    }
  } catch (error) {
    console.error('Error creating new definition:', error);
    $q.notify({ 
      type: 'negative',
      message: translate('errors.failedToCreateDefinition')
    });
  } finally {
    loading.value = false;
  }
}

const deleteDefinition = async (definition: Definition) => {
  if (!props.sense?.id) return;

  try {
    loading.value = true;
    const response = await api.glossData.deleteDefinition(props.sense.id, definition.id || '');
    emit('update:glossData', response.data);

    $q.notify({
      type: 'positive',
      message: translate('definitionDeletedSuccessfully')
    });
  } catch (error) {
    console.error('Error deleting definition:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeleteDefinition')
    });
  } finally {
    loading.value = false;
  }
}

const cancelDefinitionEdit = () => {
  displayCreateNewDefinition.value = false;
}

const addTranslation = () => {
  displayCreateNewDefinition.value = false;
}

const saveTranslation = async (definition: Definition, translation: Translation) => {
  try {
    loading.value = true;
    const response = await api.glossData.editDefinitionTranslation(definition.id || '', translation.id || '', {
      translation: translation.translation,
      language: translation.language
    });
    
    if (response.data && isGlossData(response.data)) {
      emit('update:glossData', response.data);
      
      $q.notify({
        type: 'positive',
        message: translate('translationSavedSuccessfully')
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
}

const deleteTranslation = async (definition: Definition, translation: Translation) => {
  try {
    loading.value = true;
    const response = await api.glossData.deleteDefinitionTranslation(translation.id || '');
    
    if (response.data && isGlossData(response.data)) {
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
}

const cancelTranslationEdit = () => {
  displayCreateNewDefinition.value = false;
}

const addSenseTranslation = () => {
  displayCreateNewDefinition.value = false;
}

const removeSenseTranslation = () => {
  displayCreateNewDefinition.value = false;
}
</script>

<style scoped>
.q-item {
  min-height: 40px;
}
</style>
