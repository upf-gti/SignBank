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

    <q-list
      class="row q-col-gutter-md"
      separator
    >
      <q-item
        v-for="(example, index) in examples.sort((a, b) => a.isNew ? -1 : b.isNew ? 1 : 0)"
        :key="example.id || index"
        class="col-12 q-pa-none"
      >
        <ExampleCardDesktop
          v-if="$q.screen.gt.sm"
          :example="example"
          :allow-edit="editMode"
          @save="saveExample"
          @delete="deleteExample"
          @upload-video="uploadVideo"
          @delete-video="deleteExampleVideo"
          @video-error="handleVideoError"
          @update-gloss-data="(data) => emit('update:glossData', data)"
        />

        <ExampleCardMobile
          v-else
          :example="example"
          :allow-edit="editMode"
          @save="saveExample"
          @delete="deleteExample"
          @upload-video="uploadVideo"
          @delete-video="deleteExampleVideo"
          @video-error="handleVideoError"
          @update-gloss-data="(data) => emit('update:glossData', data)"
        />
      </q-item>
    </q-list>
  </q-card-section>

  <VideoPlayerPopup
    v-model:show-dialog="showVideoDialog"
    :video-url="selectedVideoUrl"
    :title="selectedExample?.example || translate('exampleVideo')"
    muted
  />
</template>

<script setup lang="ts">
import { Example, GlossData } from 'src/types/models';
import translate from 'src/utils/translate';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';
import VideoPlayerPopup from 'src/components/VideoPlayerPopup.vue';
import ExampleCardDesktop from './ExampleCardDesktop.vue';
import ExampleCardMobile from './ExampleCardMobile.vue';
import { ref, computed, watch } from 'vue';

const $q = useQuasar();
const loading = ref(false);
const showVideoDialog = ref(false);
const selectedVideoUrl = ref('');
const selectedExample = ref<Example | null>(null);

const props = defineProps<{
  glossData: GlossData;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

const localGlossData = ref<GlossData>({ ...props.glossData });

watch(() => props.glossData, (newGlossData) => {
  localGlossData.value = { ...newGlossData };
}, { deep: true });

const examples = computed(() => localGlossData.value?.examples || []);

const addExample = () => {
  if (!localGlossData.value.examples) {
    localGlossData.value.examples = [];
  }
  localGlossData.value.examples.push({
    id: '',
    example: '',
    exampleVideoURL: '',
    glossDataId: localGlossData.value.id || '',
    exampleTranslations: [],
    isNew: true,
  });
};

const saveExample = async (example: Example) => {
  try {
    loading.value = true;
    let response;

    if (example.id) {
      response = await api.examples.update(example.id, {
        example: example.example,
        exampleVideoURL: example.exampleVideoURL,
      });
    } else {
      response = await api.examples.create(localGlossData.value.id || '', {
        example: example.example,
        exampleVideoURL: example.exampleVideoURL,
      });
    }

    if (response.data) {
      emit('update:glossData', response.data);
      $q.notify({
        type: 'positive',
        message: translate(example.id ? 'exampleUpdatedSuccessfully' : 'exampleCreatedSuccessfully'),
      });
    }
  } catch (error) {
    console.error('Error saving example:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToSaveExample'),
    });
  } finally {
    loading.value = false;
  }
};

const deleteExample = async (example: Example) => {
  if (!example.id) {
    const index = localGlossData.value.examples.findIndex((e) => e === example);
    if (index !== -1) {
      localGlossData.value.examples.splice(index, 1);
    }
    return;
  }

  try {
    loading.value = true;
    const response = await api.examples.delete(example.id);
    if (response.data) {
      emit('update:glossData', response.data);
      $q.notify({
        type: 'positive',
        message: translate('exampleDeletedSuccessfully'),
      });
    }
  } catch (error) {
    console.error('Error deleting example:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeleteExample'),
    });
  } finally {
    loading.value = false;
  }
};

const uploadVideo = async (example: Example, url: string) => {
  try {
    if (example.exampleVideoURL && example.exampleVideoURL !== url) {
      await api.videos.delete(example.exampleVideoURL);
    }
    example.exampleVideoURL = url;
    if (example.id) {
      await saveExample(example);
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToUploadVideo'),
    });
  }
};

const deleteExampleVideo = async (example: Example) => {
  try {
    if (example.id) {
      const response = await api.examples.deleteVideo(example.id);
      if (response.data) {
        emit('update:glossData', response.data);
        $q.notify({
          type: 'positive',
          message: translate('videoDeleted'),
        });
      }
    } else {
      example.exampleVideoURL = '';
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToDeleteVideo'),
    });
  }
};

const handleVideoError = (event: Event) => {
  console.error('Error playing video:', event);
  $q.notify({
    type: 'negative',
    message: translate('errors.failedToPlayVideo'),
  });
};
</script>
