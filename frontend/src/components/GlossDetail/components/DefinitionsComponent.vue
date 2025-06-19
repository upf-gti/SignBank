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
          :show-delete="true"
          :custom-edit-label="translate('editDefinition')"
          :custom-delete-label="translate('deleteDefinition')"
          @save="() => saveDefinition(definition)"
          @cancel="cancelDefinitionEdit"
          @delete="() => deleteDefinition(definition)"
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
            <div
              v-else
              class="q-mb-md text-subtitle1"
            >
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
            <div
              v-else
              class="q-mb-md"
            >
              {{ definition.definition }}
            </div>

            <!-- Definition Video -->
            <div class="q-mb-md">
              <UploadVideoComponent
                v-if="isEditing && !definition.videoDefinitionUrl"
                video-type="definition"
                :custom-label="translate('addDefinitionVideo')"
                @upload-complete="(url) => uploadVideo(definition, url)"
              />
              <div
                v-else
                class="row justify-end q-gutter-sm"
              >
                <q-btn
                  v-if="definition.videoDefinitionUrl"
                  outline
                  :label="translate('seeDefinitionVideo')"
                  icon="play_arrow"
                  :disable="!definition.videoDefinitionUrl"
                  @click="openVideo(definition)"
                />
                <q-btn
                  v-if="isEditing && definition.videoDefinitionUrl"
                  outline
                  :label="translate('deleteDefinitionVideo')"
                  icon="delete"
                  @click="deleteDefinitionVideo(definition)"
                />
              </div>
            </div>

            <!-- Definition Translations -->
            <DefinitionTranslationsComponent
              :allow-edit="allowEdit"
              :definition-id="definition.id || ''"
              :translations="definition.definitionTranslations"
              @update:translations="(translations) => definition.definitionTranslations = translations"
            />
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
            <div
              v-else
              class="q-mb-md"
            >
              {{ newDefinition.definition }}
            </div>

            <!-- Definition Video for new definition -->
            <div class="q-mb-md">
              <UploadVideoComponent
                v-if="isEditing && !newDefinition.videoDefinitionUrl"
                video-type="definition"
                :custom-label="translate('addDefinitionVideo')"
                @upload-complete="(url) => uploadVideo(newDefinition, url)"
              />
            </div>
          </template>
        </EditableModule>
      </q-item>
    </q-list>
    <!-- Translations of the sense -->
    <div class="column">
      <SenseTranslationsComponent
        :sense="sense"
        :allow-edit="allowEdit"
        :edit-mode="editMode"
        @update:gloss-data="emit('update:glossData', $event)"
      />
    </div>
  </q-card-section>

  <VideoPlayerPopup
    v-model:show-dialog="showVideoDialog"
    :video-url="selectedVideoUrl"
    :title="selectedDefinition?.title || translate('definitionVideo')"
    muted
  />
</template>

<script setup lang="ts">
import { Sense, Definition, GlossData } from 'src/types/models';
import translate from 'src/utils/translate';
import EditableModule from 'src/components/Shared/EditableModule.vue'
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';
import VideoPlayerPopup from 'src/components/VideoPlayerPopup.vue';
import { ref, computed } from 'vue';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';
import SenseTranslationsComponent from './SenseTranslationsComponent.vue';
import DefinitionTranslationsComponent from './DefinitionTranslationsComponent.vue';

const $q = useQuasar()
const loading = ref(false)
const displayCreateNewDefinition = ref(false)
const showVideoDialog = ref(false)
const selectedVideoUrl = ref('')
const selectedDefinition = ref<Definition | null>(null)

const newDefinition = ref<Definition>({
  id: '',
  title: '',
  definition: '',
  videoDefinitionUrl: '',
  senseId: '',
  definitionTranslations: [],
  isEditing: true,
  isNew: true,
})

const props = defineProps<{
  allowEdit: boolean;
  editMode: boolean;
  sense: Sense;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

const definitions = computed(() => props.sense?.definitions || []);

const addDefinition = () => {
  displayCreateNewDefinition.value = true;
  newDefinition.value = {
    id: '',
    title: '',
    definition: '',
    videoDefinitionUrl: '',
    senseId: props.sense?.id || '',
    definitionTranslations: [],
    isEditing: true,
    isNew: true,
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
    
    const updateData: { title?: string, definition?: string, videoDefinitionUrl?: string } = {
      title: definition.title,
      definition: definition.definition,
    };
    
    if (definition.videoDefinitionUrl) {
      updateData.videoDefinitionUrl = definition.videoDefinitionUrl;
    }
    
    const response = await api.definitions.update(props.sense.id, definition.id || '', updateData);

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

    const createData: { title?: string, definition: string, videoDefinitionUrl?: string } = {
      title: newDefinition.value.title,
      definition: newDefinition.value.definition,
    };
    
    if (newDefinition.value.videoDefinitionUrl) {
      createData.videoDefinitionUrl = newDefinition.value.videoDefinitionUrl;
    }

    const response = await api.definitions.create(props.sense.id, createData);

    if (response.data && isGlossData(response.data)) {
      $q.notify({
        type: 'positive',
        message: translate('definitionCreatedSuccessfully')
      });
      emit('update:glossData', response.data);

      displayCreateNewDefinition.value = false;
      newDefinition.value = {
        id: '',
        title: '',
        definition: '',
        videoDefinitionUrl: '',
        senseId: props.sense.id,
        definitionTranslations: [],
        isEditing: true,
        isNew: true,
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
    const response = await api.definitions.delete(props.sense.id, definition.id || '');
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

const uploadVideo = async (definition: Definition, url: string) => {
  try {
    // Delete the old video if it exists and is different from the new one
    if (definition.videoDefinitionUrl && definition.videoDefinitionUrl !== url) {
      await api.videos.delete(definition.videoDefinitionUrl);
    }
    definition.videoDefinitionUrl = url;
    if (definition.id) {
      await saveDefinition(definition);
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToUploadVideo')
    });
  }
};

const openVideo = (definition: Definition) => {
  selectedDefinition.value = definition;
  selectedVideoUrl.value = definition.videoDefinitionUrl || '';
  showVideoDialog.value = true;
};

const deleteDefinitionVideo = async (definition: Definition) => {
  try {
    if (definition.id && props.sense?.id) {
      // Use the dedicated endpoint to delete only the video
      const response = await api.definitions.deleteVideo(props.sense.id, definition.id);
      if (response.data) {
        emit('update:glossData', response.data);
        $q.notify({
          type: 'positive',
          message: translate('videoDeleted')
        });
      }
    } else {
      // For new definitions that haven't been saved yet, just clear the URL
      definition.videoDefinitionUrl = '';
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeleteVideo')
    });
  }
};
</script>

<style scoped>
.q-item {
  min-height: 40px;
}
</style>
