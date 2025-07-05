<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('definitions') }}
      <div class="row q-gutter-sm">
        <q-btn
          v-if="allowEdit"
          unelevated
          outline
          color="primary"
          :label="translate('addDefinition')"
          icon="add"
          @click="addDefinition"
        />
        <q-btn
          v-if="allowEdit && definitions.length > 1"
          unelevated
          outline
          :label="translate('sortDefinitions')"
          icon="sort"
          @click="openSortDefinitions"
        />
      </div>
    </div>
    <q-list 
      v-if="!isMobile"
      >
        <DefinitionCardDesktop
          v-for="(definition, index) in definitions.sort((a, b) => a.priority - b.priority)"
          :key="definition.id || index"
          :definition="definition"
          :allow-edit="allowEdit"
          @save="saveDefinition"
          @delete="deleteDefinition"
          @upload-video="uploadVideo"
          @delete-video="deleteDefinitionVideo"
          @video-error="handleVideoError"
          @update-translations="updateDefinitionTranslations"
        />
      </q-list>
      <q-list v-else>
      <DefinitionCardMobile
        v-for="(definition, index) in definitions.sort((a, b) => a.priority - b.priority)"
        :key="definition.id || index"
        :definition="definition"
        :allow-edit="allowEdit"
        @save="saveDefinition"
        @delete="deleteDefinition"
        @upload-video="uploadVideo"
        @delete-video="deleteDefinitionVideo"
        @video-error="handleVideoError"
        @update-translations="updateDefinitionTranslations"
      />
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

  <!-- Sort Definitions Dialog -->
  <q-dialog v-model="sortDefinitionsDialog">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">
          {{ translate('sortDefinitions') }}
        </div>
      </q-card-section>

      <q-card-section>
        <div
          v-for="(definition, index) in localDefinitions"
          :key="definition.id || index"
          class="row items-center q-mb-sm"
        >
          <div class="col">
            <div class="text-bold">{{ definition.title }}</div>
            <div >{{ definition.definition }}</div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              dense
              icon="arrow_upward"
              :disable="index === 0"
              @click="moveDefinition(index, 'up')"
            />
            <q-btn
              flat
              round
              dense
              icon="arrow_downward"
              :disable="index === localDefinitions.length - 1"
              @click="moveDefinition(index, 'down')"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="translate('cancel')"
          @click="cancelSortDefinitions"
        />
        <q-btn
          flat
          :label="translate('save')"
          @click="saveSortDefinitions"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Create Definition Dialog -->
  <CreateDefinitionDialog
    v-model="showCreateDefinitionDialog"
    :sense-id="sense?.id || ''"
    @definition-created="handleDefinitionCreated"
  />
</template>

<script setup lang="ts">
import { Sense, Definition, GlossData, DefinitionTranslation } from 'src/types/models';
import translate from 'src/utils/translate';
import VideoPlayerPopup from 'src/components/VideoPlayerPopup.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';
import SenseTranslationsComponent from '../SenseTranslationsComponent.vue';
import DefinitionCardDesktop from './DefinitionCardDesktop.vue';
import DefinitionCardMobile from './DefinitionCardMobile.vue';
import CreateDefinitionDialog from './CreateDefinitionDialog.vue';

const $q = useQuasar()
const loading = ref(false)
const showCreateDefinitionDialog = ref(false)
const showVideoDialog = ref(false)
const selectedVideoUrl = ref('')
const selectedDefinition = ref<Definition | null>(null)
const sortDefinitionsDialog = ref(false)
const localDefinitions = ref<Definition[]>([])
const isMobile = ref(false)

// Screen size detection
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});

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
  showCreateDefinitionDialog.value = true;
}

const handleDefinitionCreated = async (definition: Definition) => {
  if (!props.sense?.id) return;

  try {
    loading.value = true;

    const createData: { title?: string, definition: string, videoDefinitionUrl?: string } = {
      title: definition.title,
      definition: definition.definition,
    };
    
    if (definition.videoDefinitionUrl) {
      createData.videoDefinitionUrl = definition.videoDefinitionUrl;
    }

    const response = await api.definitions.create(props.sense.id, createData);

    if (response.data && isGlossData(response.data)) {
      emit('update:glossData', response.data);
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

const handleVideoError = (event: Event) => {
  console.error('Error playing video:', event);
  $q.notify({
    type: 'negative',
    message: translate('errors.failedToPlayVideo')
  });
};

const openSortDefinitions = () => {
  localDefinitions.value = [...definitions.value]
  sortDefinitionsDialog.value = true
}

const moveDefinition = (index: number, direction: 'up' | 'down') => {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if ((direction === 'up' && index > 0) || 
      (direction === 'down' && index < localDefinitions.value.length - 1)) {
    
    const definitionToMove = localDefinitions.value[index]
    const otherDefinition = localDefinitions.value[newIndex]
    
    if (!definitionToMove || !otherDefinition) return

    // Swap the definitions
    localDefinitions.value[index] = otherDefinition
    localDefinitions.value[newIndex] = definitionToMove
  }
}

const cancelSortDefinitions = () => {
  sortDefinitionsDialog.value = false
  localDefinitions.value = []
}

const updateDefinitionTranslations = (definition: Definition, translations: DefinitionTranslation[]) => {
  definition.definitionTranslations = translations;
};

const saveSortDefinitions = async () => {
  try {
    loading.value = true
    
    if (!props.sense?.id) {
      throw new Error('Sense ID is required')
    }
    
    // Update each definition with their new priority based on position
    const updatePromises = localDefinitions.value.map((definition, index) => {
      const updateData: { title?: string, definition?: string, videoDefinitionUrl?: string, priority?: number } = {
        title: definition.title,
        definition: definition.definition,
        priority: index // Assign sequential priorities: 0, 1, 2, ...
      }
      
      if (definition.videoDefinitionUrl) {
        updateData.videoDefinitionUrl = definition.videoDefinitionUrl
      }
      
      return api.definitions.update(props.sense!.id!, definition.id!, updateData)
    })
    
    if (updatePromises.length === 0) {
      throw new Error('No valid definitions to update')
    }
    
    const responses = await Promise.all(updatePromises)
    
    // Use the last response to update the parent
    const lastResponse = responses[responses.length - 1]
    if (lastResponse && isGlossData(lastResponse.data)) {
      emit('update:glossData', lastResponse.data)
    }
    
    sortDefinitionsDialog.value = false
    localDefinitions.value = []
    
    $q.notify({
      message: translate('definitionsSortedSuccessfully'),
      color: 'positive',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error sorting definitions:', error)
    $q.notify({
      message: translate('errors.failedToSortDefinitions'),
      color: 'negative',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Styles are now handled in DefinitionCard component */
</style>
