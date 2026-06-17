<template>
  <q-card-section class="column no-wrap fit">
    <div
      v-if="hasAnyVideoUrl || editMode"
      class="video-angle-container"
      :style="containerStyle"
    >
      <video
        v-for="video in sortedVideosWithUrl"
        :key="video.id"
        :ref="(el) => registerVideoRef(video.id, el)"
        class="angle-video"
        :class="{ 'angle-video--active': video.id === selectedVideo }"
        loop
        muted
        playsinline
        preload="auto"
        :src="getVideoUrl(video.url)"
      />

      <div
        v-if="editMode && !selectedVideoData?.url"
        class="video-angle-upload"
      >
        <UploadVideoComponent
          video-type="gloss"
          :custom-label="translate('addGlossVideo')"
          @upload-complete="(url) => uploadVideo(url)"
        />
      </div>
    </div>

    <div
      v-if="editMode || sortedVideos.length > 1"
      class="column col justify-start items-start q-mt-sm"
    >
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
      <div
        class="row justify-center items-center q-pt-md full-width"
        :class="{ 'angle-toggle--compact': compact }"
      >
        <q-btn-toggle
          v-model="selectedVideo"
          spread
          no-caps
          toggle-color="primary"
          class="full-width"
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
import { ref, computed, watch, onMounted, nextTick, type ComponentPublicInstance, type StyleValue } from 'vue';
import { SignVideo } from 'src/types/models';
import translate from 'src/utils/translate';
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';
import { getVideoUrl } from 'src/utils/videoUrl';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';

const props = defineProps<{
  signVideo: SignVideo;
  editMode: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:signVideo', value: SignVideo): void
}>();

const $q = useQuasar();

const localSignVideo = ref<SignVideo>({ ...props.signVideo });

watch(() => props.signVideo, (newSignVideo) => {
  localSignVideo.value = { ...newSignVideo };
}, { deep: true });

const selectedVideo = ref<string>(localSignVideo.value?.videos[0]?.id || '');
const videoRefs = new Map<string, HTMLVideoElement>();

const sortedVideos = computed(() => {
  return [...(localSignVideo.value?.videos || [])].sort((a, b) => (a.priority || 0) - (b.priority || 0));
});

const sortedVideosWithUrl = computed(() =>
  sortedVideos.value.filter((video) => video.url?.trim())
);

const hasAnyVideoUrl = computed(() => sortedVideosWithUrl.value.length > 0);

const selectedVideoData = computed(() => {
  return sortedVideos.value.find((video) => video.id === selectedVideo.value) || sortedVideos.value[0];
});

const containerStyle = computed<StyleValue>(() => ({
  height: props.compact ? '240px' : '40dvh',
  maxHeight: props.compact ? '240px' : '40dvh',
  width: '100%',
}));

function registerVideoRef(id: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLVideoElement) {
    videoRefs.set(id, el);
    return;
  }
  videoRefs.delete(id);
}

async function syncVideoPlayback(activeId: string) {
  await nextTick();

  for (const [id, element] of videoRefs.entries()) {
    if (id === activeId) {
      try {
        await element.play();
      } catch {
        // Autoplay may be blocked until user interaction.
      }
      continue;
    }

    element.pause();
  }
}

watch(selectedVideo, (activeId) => {
  if (activeId) {
    void syncVideoPlayback(activeId);
  }
});

watch(sortedVideosWithUrl, () => {
  if (selectedVideo.value) {
    void syncVideoPlayback(selectedVideo.value);
  }
});

onMounted(() => {
  if (selectedVideo.value) {
    void syncVideoPlayback(selectedVideo.value);
  }
});

const getVideoIndex = (videoId: string) => {
  return sortedVideos.value.findIndex(video => video.id === videoId);
};

const uploadVideo = (url: string) => {
  const videoToUpdate = localSignVideo.value.videos?.find(video => video.id === selectedVideo.value)
  if (videoToUpdate) {
    videoToUpdate.url = url
  }
  emit('update:signVideo', localSignVideo.value)
  void syncVideoPlayback(selectedVideo.value);
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
    void syncVideoPlayback(selectedVideo.value);
  }
}

const moveVideoLeft = async () => {
  const currentIndex = getVideoIndex(selectedVideo.value);
  if (currentIndex <= 0) return;

  const currentVideo = sortedVideos.value[currentIndex];
  const previousVideo = sortedVideos.value[currentIndex - 1];

  if (!currentVideo?.id || !previousVideo?.id) return;

  try {
    const tempPriority = currentVideo.priority || 0;
    currentVideo.priority = previousVideo.priority || 0;
    previousVideo.priority = tempPriority;

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
    const tempPriority = currentVideo.priority || 0;
    currentVideo.priority = nextVideo.priority || 0;
    nextVideo.priority = tempPriority;

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

<style scoped>
.video-angle-container {
  position: relative;
  width: 100%;
  background: transparent;
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
}

.angle-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.angle-video--active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  z-index: 1;
}

.video-angle-upload {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.96);
}

.angle-toggle--compact :deep(.q-btn) {
  font-size: 0.75rem;
  padding: 4px 6px;
}
</style>
