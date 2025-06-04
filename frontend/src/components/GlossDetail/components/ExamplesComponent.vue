<template>
  <q-card-section>
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('examples') }}
      <q-btn
        v-if="editMode"
        flat
        round
        icon="add"
        :label="translate('addExample')"
        @click="addExample"
      />
    </div>

    <q-list class="row q-col-gutter-md " separator>
      <q-item
        v-for="(example, index) in examples.sort((a, b) => a.isNew ? -1 : b.isNew ? 1 : 0)"
        :key="example.id || index"
        class="col-12 q-pa-none"
      >
        <EditableModule
          :allow-edit="editMode"
          :initial-edit-state="example.isNew"
          :show-delete="true"
          :custom-edit-label="translate('editExample')"
          :custom-delete-label="translate('deleteExample')"
          class="full-width q-pa-none"
          @save="() => saveExample(example)"
          @cancel="() => cancelExample(example)"
          @delete="() => deleteExample(example)"
        >
          <template #default="{ isEditing }">
            <q-card
              flat
              class="full-width q-px-md"
              style="background-color: transparent"
            >
              <!-- Example Text -->
              <q-input
                v-if="isEditing"
                v-model="example.example"
                :label="translate('example')"
                outlined
                dense
                class="col-12 q-mb-sm"
              />
              <div
                v-else
                class="text-h6 q-mb-md"
              >
                {{ example.example }}
              </div>

              <!-- Example Video -->
              <div class="q-mb-md">
                <UploadVideoComponent
                  v-if="isEditing && example.exampleVideoURL === ''"
                  v-model:show-dialog="showUploadDialog"
                  video-type="example"
                  :custom-label="translate('addExampleVideo')"
                  @upload-complete="(url) => uploadVideo(example, url)"
                />
                <div
                  v-else
                  class="row justify-end q-gutter-sm"
                >
                  <q-btn
                    v-if="example.exampleVideoURL"
                    outline
                    :label="translate('seeExampleVideo')"
                    icon="play_arrow"
                    :disable="!example.exampleVideoURL"
                    @click="openVideo(example)"
                  />
                  <q-btn
                    v-else-if="isEditing"
                    outline
                    :label="translate('deleteExampleVideo')"
                    icon="delete"
                    @click="deleteExampleVideo(example)"
                  />
                </div>
              </div>

              <!-- Example Translations -->
              <div v-if="!example.isNew">
                <ExampleTranslationsComponent
                  :example="example"
                  :allow-edit="editMode"
                  @update:gloss-data="(data) => emit('update:glossData', data)"
                />
              </div>
            </q-card>
          </template>
        </EditableModule>
      </q-item>
    </q-list>
  </q-card-section>

  <VideoPlayerPopup
    v-model:show-dialog="showVideoDialog"
    :video-url="selectedVideoUrl"
    :title="selectedExample?.example || translate('exampleVideo')"
  />
</template>

<script setup lang="ts">
import { Sense, Example, GlossData } from 'src/types/models';
import translate from 'src/utils/translate';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';
import EditableModule from 'src/components/Shared/EditableModule.vue';
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';
import VideoPlayerPopup from 'src/components/VideoPlayerPopup.vue';
import ExampleTranslationsComponent from './ExampleTranslationsComponent.vue';
import { ref, computed } from 'vue';

const examples = computed(() => props.sense?.examples || []);

const $q = useQuasar();
const loading = ref(false);
const showUploadDialog = ref(false);
const showVideoDialog = ref(false);
const selectedVideoUrl = ref('');
const selectedExample = ref<Example | null>(null);

const props = defineProps<{
  sense: Sense;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

const addExample = () => {
  examples.value.push({
    id: '',
    example: '',
    exampleVideoURL: '',
    senseId: props.sense.id || '',
    exampleTranslations: [],
    isNew: true
  });
};

const saveExample = async (example: Example) => {
  try {
    loading.value = true;
    let response;

    if (example.id) {
      response = await api.glossData.updateExample(example.id, {
        example: example.example,
        exampleVideoURL: example.exampleVideoURL
      });
    } else {
      response = await api.glossData.createExample(props.sense.id || '', {
        example: example.example,
        exampleVideoURL: example.exampleVideoURL
      });
    }

    if (response.data) {
      emit('update:glossData', response.data);
      $q.notify({
        type: 'positive',
        message: translate(example.id ? 'exampleUpdatedSuccessfully' : 'exampleCreatedSuccessfully')
      });
    }
  } catch (error) {
    console.error('Error saving example:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToSaveExample')
    });
  } finally {
    loading.value = false;
  }
};

const deleteExample = async (example: Example) => {
  if (!example.id) {
    const index = props.sense.examples.findIndex(e => e === example);
    if (index !== -1) {
      props.sense.examples.splice(index, 1);
    }
    return;
  }

  try {
    loading.value = true;
    const response = await api.glossData.deleteExample(example.id);
    
    if (response.data) {
      emit('update:glossData', response.data);
      $q.notify({
        type: 'positive',
        message: translate('exampleDeletedSuccessfully')
      });
    }
  } catch (error) {
    console.error('Error deleting example:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeleteExample')
    });
  } finally {
    loading.value = false;
  }
};

const cancelExample = (example: Example) => {
  if (!example.id) {
    const index = props.sense.examples.findIndex(e => e === example);
    if (index !== -1) {
      props.sense.examples.splice(index, 1);
    }
  }
};

const uploadVideo = async (example: Example, url: string) => {
  example.exampleVideoURL = url;
  if (example.id) {
    await saveExample(example);
  }
};

const openVideo = (example: Example) => {
  selectedExample.value = example;
  selectedVideoUrl.value = example.exampleVideoURL;
  showVideoDialog.value = true;
};

const deleteExampleVideo = async (example: Example) => {
  try {
    if (example.exampleVideoURL) {
      await api.videos.delete(example.exampleVideoURL);
    }
    example.exampleVideoURL = '';
    if (example.id) {
      await saveExample(example);
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

