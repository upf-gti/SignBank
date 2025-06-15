<template>
  <q-card-section class="column no-wrap fit">
    <video
      v-if="selectedVideoData?.url"
      class="col fit"
      loop
      autoplay
      :src="getVideoUrl(selectedVideoData.url)"
      :style="{
        objectFit: 'contain',
        maxHeight: '40dvh',
      }"
    />
    <div
      v-else-if="editMode"
      class="col fit row justify-center items-center"
    >
      <UploadVideoComponent
        video-type="gloss"
        :custom-label="translate('addGlossVideo')"
        @upload-complete="(url) => uploadVideo(url)"
      />
    </div>
    <div class="column col justify-start items-start">
      <div class="row justify-between items-center full-width">
        <span class="text-bold">
          {{ translate('videoAngles') }}
        </span>
        <q-btn
          v-if="editMode"
          flat
          round
          icon="add"
          :label="translate('addAngle')"
          @click="addAngle"
        />
      </div>
      <div class="row justify-center items-center q-pt-md">
        <q-btn-toggle
          v-model="selectedVideo"
          :options="sortedVideos.map((video) => ({
            label: video.angle,
            value: video.id,
          })) || []"
        />
      </div>
      <div
        v-if="editMode && selectedVideoData && sortedVideos.length > 1"
        class="row justify-center q-pt-sm"
      >
        <q-btn
          flat
          dense
          icon="keyboard_arrow_left"
          size="sm"
          :disable="getVideoIndex(selectedVideo) === 0"
          @click="moveVideoLeft"
        >
          <q-tooltip>{{ translate('moveLeft') }}</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          icon="keyboard_arrow_right"
          size="sm"
          :disable="getVideoIndex(selectedVideo) === sortedVideos.length - 1"
          @click="moveVideoRight"
        >
          <q-tooltip>{{ translate('moveRight') }}</q-tooltip>
        </q-btn>
      </div>
      <div
        v-if="editMode && selectedVideoData"
        class="column justify-center no-wrap items-start full-width q-mt-md"
      >
        <q-btn
          v-if="signVideo.videos.length > 1"
          flat
          round
          icon="delete"
          :label="translate('deleteAngle')"
          @click="removeAngle"
        />
        <q-input
          v-model="selectedVideoData.angle"
          :label="translate('angle')"
          outlined
          dense
          class="col full-width"
        />
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { SignVideo } from 'src/types/models';
import translate from 'src/utils/translate';
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';
import { getVideoUrl } from 'src/utils/videoUrl';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';

const props = defineProps<{
  signVideo: SignVideo;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:signVideo', value: SignVideo): void
}>();

const $q = useQuasar();

// Create a local copy of the signVideo data
const localSignVideo = ref<SignVideo>({ ...props.signVideo });

// Watch for changes in the prop and update local copy
watch(() => props.signVideo, (newSignVideo) => {
  localSignVideo.value = { ...newSignVideo };
}, { deep: true });

const selectedVideo = ref<string>(localSignVideo.value?.videos[0]?.id || '');

const sortedVideos = computed(() => {
  return [...(localSignVideo.value?.videos || [])].sort((a, b) => (a.priority || 0) - (b.priority || 0));
});

const selectedVideoData = computed(() => {
  return sortedVideos.value.find((video) => video.id === selectedVideo.value) || sortedVideos.value[0];
});

const getVideoIndex = (videoId: string) => {
  return sortedVideos.value.findIndex(video => video.id === videoId);
};

const uploadVideo = (url: string) => {
  const newSignVideo = {
    ...localSignVideo.value,
  }
  const videoToUpdate = newSignVideo.videos.find(video => video.id === selectedVideo.value)
  if (videoToUpdate) {
    videoToUpdate.url = url
  }
  emit('update:signVideo', newSignVideo)
}

const addAngle = () => {
  if (!localSignVideo.value?.videos) return;
  const newVideo = {
    id: Date.now().toString(),
    angle: translate('newAngle'),
    url: '',
    priority: localSignVideo.value.videos.length + 1,
  }
  localSignVideo.value.videos.push(newVideo)
  selectedVideo.value = newVideo.id
  emit('update:signVideo', localSignVideo.value)
}

const removeAngle = () => {
  if (!localSignVideo.value?.videos) return;
  const index = localSignVideo.value.videos.findIndex(video => video.id === selectedVideo.value)
  if (index > -1) {
    localSignVideo.value.videos.splice(index, 1)
    selectedVideo.value = localSignVideo.value.videos[0]?.id || ''
    emit('update:signVideo', localSignVideo.value)
  }
}

const moveVideoLeft = async () => {
  const currentIndex = getVideoIndex(selectedVideo.value);
  if (currentIndex <= 0) return;
  
  const currentVideo = sortedVideos.value[currentIndex];
  const previousVideo = sortedVideos.value[currentIndex - 1];
  
  if (!currentVideo?.id || !previousVideo?.id) return;
  
  try {
    // Swap priorities
    const tempPriority = currentVideo.priority || 0;
    currentVideo.priority = previousVideo.priority || 0;
    previousVideo.priority = tempPriority;
    
    // Update in backend
    await Promise.all([
      api.videoPriority.update(currentVideo.id, { priority: currentVideo.priority }),
      api.videoPriority.update(previousVideo.id, { priority: previousVideo.priority })
    ]);
    
    emit('update:signVideo', localSignVideo.value)
    
    $q.notify({
      type: 'positive',
      message: translate('videoOrderUpdated'),
      position: 'bottom'
    });
  } catch (error) {
    console.error('Error updating video order:', error);
    $q.notify({
      type: 'negative',
      message: translate('errorUpdatingVideoOrder'),
      position: 'bottom'
    });
  }
}

const moveVideoRight = async () => {
  const currentIndex = getVideoIndex(selectedVideo.value);
  if (currentIndex >= sortedVideos.value.length - 1) return;
  
  const currentVideo = sortedVideos.value[currentIndex];
  const nextVideo = sortedVideos.value[currentIndex + 1];
  
  if (!currentVideo?.id || !nextVideo?.id) return;
  
  try {
    // Swap priorities
    const tempPriority = currentVideo.priority || 0;
    currentVideo.priority = nextVideo.priority || 0;
    nextVideo.priority = tempPriority;
    
    // Update in backend
    await Promise.all([
      api.videoPriority.update(currentVideo.id, { priority: currentVideo.priority }),
      api.videoPriority.update(nextVideo.id, { priority: nextVideo.priority })
    ]);
    
    emit('update:signVideo', localSignVideo.value)
    
    $q.notify({
      type: 'positive',
      message: translate('videoOrderUpdated'),
      position: 'bottom'
    });
  } catch (error) {
    console.error('Error updating video order:', error);
    $q.notify({
      type: 'negative',
      message: translate('errorUpdatingVideoOrder'),
      position: 'bottom'
    });
  }
}
</script>
