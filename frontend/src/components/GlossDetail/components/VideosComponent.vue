<template>
  <div class="videos-component q-pa-sm">
    <div
      v-if="!inlineEdit && !hideSectionTitle"
      class="text-h5 q-mb-md"
    >
      {{ translate('videos') }}
    </div>

    <!-- Browse-style editor: videos left, phonology right -->
    <div
      v-if="editMode && inlineEdit"
      class="videos-editor"
    >
      <aside class="videos-editor__videos">
        <div
          v-if="sortedVideos.length > 1"
          class="videos-editor__picker"
        >
          <button
            v-for="(video, index) in sortedVideos"
            :key="getVideoKey(video, index)"
            type="button"
            class="videos-editor__picker-item"
            :class="{ 'videos-editor__picker-item--active': index === selectedSortedIndex }"
            @click="selectedSortedIndex = index"
          >
            <span class="videos-editor__picker-label ellipsis">
              {{ video.title || translate('videos') }}
            </span>
            <q-card
              flat
              bordered
              class="videos-editor__picker-video"
            >
              <GlossVideoComponent
                :sign-video="video"
                :edit-mode="index === selectedSortedIndex"
                :compact="index !== selectedSortedIndex"
                @update:sign-video="(updated) => updateSignVideoByRef(video, updated)"
              />
            </q-card>
          </button>
        </div>

        <template v-else-if="selectedVideo">
          <q-card
            flat
            bordered
            class="videos-editor__player"
          >
            <GlossVideoComponent
              :sign-video="selectedVideo"
              :edit-mode="true"
              @update:sign-video="(updated) => { if (selectedVideo) updateSignVideoByRef(selectedVideo, updated) }"
            />
          </q-card>
        </template>

        <q-btn
          v-if="!isCreatingVideo"
          flat
          no-caps
          color="primary"
          icon="add"
          class="videos-editor__add-btn full-width"
          :label="translate('addVideo')"
          @click="addVideo"
        />
      </aside>

      <section
        v-if="selectedVideo"
        class="videos-editor__phonology"
      >
        <div class="videos-editor__phonology-toolbar row items-center q-gutter-sm q-mb-md">
          <q-input
            v-model="selectedVideo.title"
            :label="translate('title')"
            outlined
            dense
            class="col"
          />
          <q-btn
            v-if="sortedVideos.length > 1 && selectedSortedIndex > 0"
            flat
            round
            dense
            icon="keyboard_arrow_up"
            @click="moveVideoUp"
          >
            <q-tooltip>{{ translate('moveLeft') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="sortedVideos.length > 1 && selectedSortedIndex < sortedVideos.length - 1"
            flat
            round
            dense
            icon="keyboard_arrow_down"
            @click="moveVideoDown"
          >
            <q-tooltip>{{ translate('moveRight') }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="selectedVideo.id || sortedVideos.length > 1"
            flat
            round
            dense
            icon="delete"
            color="negative"
            @click="confirmRemoveSelected"
          >
            <q-tooltip>{{ translate('delete') }}</q-tooltip>
          </q-btn>
        </div>

        <SignFonologyComponent
          :video-data="selectedVideo.videoData"
          :edit-mode="true"
          :compact="false"
          natural-height
          @update:video-data="updateSelectedVideoData"
        />
      </section>
    </div>

    <!-- Legacy card layout (non-inline edit) -->
    <div
      v-else
      :class="videosRowClass"
    >
      <div
        v-if="editMode && !isCreatingVideo"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          flat
          bordered
          class="add-video-card cursor-pointer"
          @click="addVideo"
        >
          <q-card-section class="column items-center justify-center text-grey-7 fit">
            <q-icon
              name="add"
              size="32px"
            />
            <div class="text-body2 q-mt-xs">
              {{ translate('addVideo') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div
        v-for="(video, index) in sortedVideos"
        :key="video.id || index"
        :class="videoItemClass"
      >
        <EditableModule
          :allow-edit="editMode"
          :inline-edit="inlineEdit"
          :initial-edit-state="video.isNew ?? false"
          :show-delete="Boolean(video.id)"
          :validate-before-save="() => validateVideo(video)"
          @save="() => updateSignVideo(video, index)"
          @cancel="() => handleVideoCancel(index)"
          @delete="() => removeVideo(index)"
        >
          <template #header>
            <div class="text-subtitle1 ellipsis">
              {{ video.title }}
            </div>
          </template>

          <template #default="{ isEditing }">
            <q-input
              v-if="isEditing"
              v-model="video.title"
              :label="translate('title')"
              outlined
              dense
              class="q-mb-sm"
            />
            <div class="video-content">
              <div class="video-content__player">
                <GlossVideoComponent
                  :sign-video="video"
                  :edit-mode="isEditing"
                  @update:sign-video="(newVideo) => updateLocalVideo(newVideo, index)"
                />
              </div>
              <div class="video-content__phonology">
                <SignFonologyComponent
                  :video-data="video.videoData"
                  :edit-mode="isEditing"
                  :compact="inlineEdit"
                  @update:video-data="updateVideoData(index, $event)"
                />
              </div>
            </div>
          </template>
        </EditableModule>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GlossData, SignVideo, PhonologyData } from 'src/types/models';
import translate from 'src/utils/translate';
import GlossVideoComponent from './GlossVideoComponent.vue';
import SignFonologyComponent from './SignFonologyComponent.vue';
import EditableModule from 'src/components/Shared/EditableModule.vue';
import { ref, watch, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import api from 'src/services/api';
import { createDefaultPhonology } from 'src/utils/defaultPhonology';

const glossData = defineModel<GlossData>({ required: true });
const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void
}>();
const { editMode, inlineEdit = false, hideSectionTitle = false, stacked = false, horizontalScroll = false } = defineProps<{
  editMode: boolean;
  inlineEdit?: boolean;
  hideSectionTitle?: boolean;
  stacked?: boolean;
  horizontalScroll?: boolean;
}>();

const videosRowClass = computed(() => {
  if (stacked) return 'column q-gutter-md';
  if (horizontalScroll) return 'row q-col-gutter-md no-wrap videos-row--horizontal-scroll';
  return 'row q-col-gutter-md no-wrap overflow-auto';
});

const videoItemClass = computed(() => {
  if (stacked) return 'col-12';
  if (horizontalScroll) return 'videos-row__item';
  return 'col-12 col-sm-6 col-md-4';
});

const $q = useQuasar();

const videosBackup = ref<SignVideo[]>([]);
const isCreatingVideo = ref(false);
const selectedSortedIndex = ref(0);

const videos = computed(() => glossData.value?.glossVideos || []);

const sortedVideos = computed(() => {
  const videoList = [...videos.value];
  return videoList.sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return (a.priority || 0) - (b.priority || 0);
  });
});

const selectedVideo = computed(() =>
  sortedVideos.value[selectedSortedIndex.value] ?? null
);

watch(() => glossData.value.glossVideos, (newVideos) => {
  videosBackup.value = JSON.parse(JSON.stringify(newVideos));
}, { deep: true });

watch(sortedVideos, (list) => {
  if (!list.length) {
    selectedSortedIndex.value = 0;
    return;
  }
  if (selectedSortedIndex.value >= list.length) {
    selectedSortedIndex.value = list.length - 1;
  }
}, { immediate: true });

onMounted(() => {
  if (inlineEdit && editMode && videos.value.length === 0) {
    addVideo();
  }
});

function getVideoKey(video: SignVideo, index: number): string {
  return video.id || `new-${index}-${video.priority ?? 0}`;
}

function getActualIndex(video: SignVideo): number {
  const byRef = glossData.value.glossVideos.indexOf(video);
  if (byRef >= 0) return byRef;
  if (video.id) {
    return glossData.value.glossVideos.findIndex((v) => v.id === video.id);
  }
  return -1;
}

function updateLocalVideo(newVideo: SignVideo, index: number) {
  glossData.value.glossVideos[index] = newVideo;
}

function updateSignVideoByRef(video: SignVideo, updated: SignVideo) {
  const index = getActualIndex(video);
  if (index >= 0) {
    glossData.value.glossVideos[index] = updated;
  }
}

function updateSelectedVideoData(videoData: PhonologyData) {
  const video = selectedVideo.value;
  if (!video) return;
  const index = getActualIndex(video);
  const target = glossData.value.glossVideos[index];
  if (index >= 0 && target) {
    target.videoData = videoData;
  }
}

function confirmRemoveSelected() {
  const video = selectedVideo.value;
  if (!video) return;
  $q.dialog({
    title: translate('confirmDelete'),
    message: translate('confirmDeleteMessage'),
    persistent: true,
    ok: {
      color: 'negative',
      label: translate('delete'),
      flat: true,
    },
    cancel: {
      color: 'primary',
      flat: true,
      label: translate('cancel'),
    },
  }).onOk(() => {
    const index = getActualIndex(video);
    if (index >= 0) {
      void removeVideo(index);
    }
  });
}

const addVideo = () => {
  const maxPriority = Math.max(...glossData.value.glossVideos.map(v => v.priority || 0), 0);

  const newVideo: SignVideo = {
    id: '',
    title: '',
    priority: maxPriority + 1,
    videoDataId: '',
    glossDataId: glossData.value.id || '',
    isNew: true,
    videos: [{
      id: Date.now().toString(),
      angle: translate('newAngle'),
      url: '',
      priority: 1,
    }],
    minimalPairs: [],
    videoData: createDefaultPhonology(),
  };

  glossData.value.glossVideos.unshift(newVideo);
  isCreatingVideo.value = true;
  selectedSortedIndex.value = 0;
};

const removeVideo = async (index: number) => {
  const video = glossData.value.glossVideos[index];
  if (!video) return;

  try {
    if (video.id) {
      await api.signVideos.delete(video.id);
    }

    if (index === 0 && isCreatingVideo.value) {
      isCreatingVideo.value = false;
    }
    glossData.value.glossVideos.splice(index, 1);

    if (selectedSortedIndex.value >= sortedVideos.value.length) {
      selectedSortedIndex.value = Math.max(0, sortedVideos.value.length - 1);
    }

    $q.notify({
      type: 'positive',
      message: translate('videoDeleted'),
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    $q.notify({
      type: 'negative',
      message: translate('errorDeletingVideo'),
    });
  }
};

const updateSignVideo = async (video: SignVideo, index: number, silent = false) => {
  try {
    const currentVideo = glossData.value.glossVideos[index];
    if (!currentVideo) return;

    if (!currentVideo.videos?.[0]?.url) {
      $q.notify({
        type: 'negative',
        message: translate('videoUrlRequired'),
      });
      return;
    }
    if (!currentVideo.videos[0].angle) {
      $q.notify({
        type: 'negative',
        message: translate('videoAngleRequired'),
      });
      return;
    }

    let response;
    if (currentVideo.id) {
      const payload = { ...currentVideo };

      if (payload.videoData) {
        Object.keys(payload.videoData).forEach((key: string) => {
          if (payload.videoData[key as keyof PhonologyData] === '' || payload.videoData[key as keyof PhonologyData] === null || payload.videoData[key as keyof PhonologyData] === undefined) {
            delete payload.videoData[key as keyof PhonologyData];
          }
        });
      }

      response = await api.signVideos.update(currentVideo.id, payload);
    } else {
      response = await api.signVideos.create(currentVideo);
      emit('update:glossData', response.data);
    }

    if (index === 0 && currentVideo.isNew) {
      currentVideo.isNew = false;
      isCreatingVideo.value = false;
    }

    if (!silent) {
      $q.notify({
        type: 'positive',
        message: currentVideo.id ? translate('videoUpdated') : translate('videoCreated'),
      });
    }
  } catch (error) {
    console.error('Error saving video:', error);
    if (!silent) {
      $q.notify({
        type: 'negative',
        message: translate('errorSavingVideo'),
      });
    }
    throw error;
  }
};

function getStepValidationErrors(): string[] {
  const errors: string[] = [];
  const videoList = glossData.value.glossVideos || [];

  if (!videoList.length) {
    errors.push(translate('validation.videoRequired'));
    return errors;
  }

  for (const video of videoList) {
    const { isValid, errors: videoErrors } = validateVideo(video);
    if (!isValid) {
      errors.push(...videoErrors);
    }
  }

  return errors;
}

async function saveAll(silent = false): Promise<boolean> {
  const list = [...glossData.value.glossVideos];
  for (let index = 0; index < list.length; index++) {
    const video = glossData.value.glossVideos[index];
    if (!video) continue;
    const hasContent = video.videos?.some(v => v.url?.trim());
    if (!hasContent && !video.id) continue;
    await updateSignVideo(video, index, silent);
  }
  return true;
}

defineExpose({ saveAll, getStepValidationErrors });

const updateVideoData = (index: number, videoData: PhonologyData) => {
  if (glossData.value.glossVideos[index]) {
    glossData.value.glossVideos[index].videoData = videoData;
  }
};

const handleVideoCancel = (index: number) => {
  if (index === 0 && isCreatingVideo.value) {
    removeVideo(index).catch((err) => {
      console.error(err);
    });
  } else if (videosBackup.value[index]) {
    glossData.value.glossVideos[index] = JSON.parse(JSON.stringify(videosBackup.value[index]));
  }
};

async function swapVideoPriorities(current: SignVideo, other: SignVideo) {
  if (!current?.id || !other?.id) return;

  const tempPriority = current.priority || 0;
  current.priority = other.priority || 0;
  other.priority = tempPriority;

  await Promise.all([
    api.signVideoPriority.update(current.id, { priority: current.priority }),
    api.signVideoPriority.update(other.id, { priority: other.priority }),
  ]);

  $q.notify({
    type: 'positive',
    message: translate('videoOrderUpdated'),
    position: 'bottom',
  });
}

function moveVideoUp() {
  const index = selectedSortedIndex.value;
  if (index <= 0) return;
  const current = sortedVideos.value[index];
  const previous = sortedVideos.value[index - 1];
  if (!current || !previous) return;
  swapVideoPriorities(current, previous)
    .then(() => {
      selectedSortedIndex.value = index - 1;
    })
    .catch((error) => {
      console.error('Error updating video order:', error);
      $q.notify({
        type: 'negative',
        message: translate('errorUpdatingVideoOrder'),
        position: 'bottom',
      });
    });
}

function moveVideoDown() {
  const index = selectedSortedIndex.value;
  if (index >= sortedVideos.value.length - 1) return;
  const current = sortedVideos.value[index];
  const next = sortedVideos.value[index + 1];
  if (!current || !next) return;
  swapVideoPriorities(current, next)
    .then(() => {
      selectedSortedIndex.value = index + 1;
    })
    .catch((error) => {
      console.error('Error updating video order:', error);
      $q.notify({
        type: 'negative',
        message: translate('errorUpdatingVideoOrder'),
        position: 'bottom',
      });
    });
}

function validateVideo(video: SignVideo): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!video.videos?.length) {
    errors.push(translate('errors.atLeastOneVideoRequired'));
  }
  video.videos.forEach((v, index) => {
    if (!v.angle?.trim()) {
      errors.push(translate('errors.angleRequired', { index: index + 1 }));
    }
    if (!v.url?.trim()) {
      errors.push(translate('errors.videoRequired', { index: index + 1 }));
    }
  });

  if (!video.videoData?.handedness) {
    errors.push(translate('errors.handednessRequired'));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
</script>

<style scoped>
.videos-component {
  width: 100%;
}

.videos-editor {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.videos-editor__videos {
  flex: 0 0 34%;
  max-width: 380px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.videos-editor__picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: 100%;
}

.videos-editor__picker-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 2px solid transparent;
  border-radius: var(--sb-card-radius, 12px);
  background: transparent;
  cursor: pointer;
  padding: 6px;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.videos-editor__picker-item:hover {
  border-color: color-mix(in srgb, var(--primary) 35%, transparent);
}

.videos-editor__picker-item--active {
  border-color: var(--primary);
  box-shadow: 0 2px 12px color-mix(in srgb, var(--primary) 12%, transparent);
}

.videos-editor__picker-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.75);
  padding: 0 2px;
}

.videos-editor__picker-video,
.videos-editor__player {
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
}

.videos-editor__add-btn {
  flex: 0 0 auto;
  min-height: 40px;
  font-size: 0.85rem;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: var(--sb-card-radius, 12px);
}

.videos-editor__phonology {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--sb-card-radius, 12px);
  padding: 16px 20px;
  background: var(--sb-surface);
}

.videos-editor__phonology-toolbar {
  flex: 0 0 auto;
}

.videos-editor__phonology :deep(.sign-phonology) {
  margin-top: 0;
}

.videos-editor__phonology :deep(.phonology-table__grid) {
  font-size: 0.95rem;
}

.videos-row--horizontal-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  width: 100%;
}

.videos-row__item {
  flex: 0 0 min(720px, 95vw);
  width: min(720px, 95vw);
  max-width: min(720px, 95vw);
}

.overflow-auto {
  overflow: auto;
}

.video-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.video-content__player {
  flex: 0 0 34%;
  max-width: 360px;
  min-width: 0;
}

.video-content__phonology {
  flex: 1 1 0;
  min-width: 0;
}

.add-video-card {
  height: 120px;
  transition: all 0.3s ease;
}

.add-video-card:hover {
  background: rgba(0, 0, 0, 0.03);
}

@media (max-width: 767px) {
  .videos-editor {
    flex-direction: column;
    min-height: auto;
  }

  .videos-editor__videos {
    flex: 0 0 auto;
    max-width: none;
    width: 100%;
  }

  .videos-editor__picker {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }

  .videos-editor__picker-item {
    flex: 0 0 140px;
    width: 140px;
  }

  .videos-editor__picker-item--active {
    flex: 0 0 min(280px, 72vw);
    width: min(280px, 72vw);
  }

  .video-content {
    flex-direction: column;
  }

  .video-content__player {
    flex: 0 0 auto;
    max-width: none;
    width: 100%;
  }

  .videos-row__item {
    flex: 0 0 min(100%, 92vw);
    width: min(100%, 92vw);
    max-width: min(100%, 92vw);
  }
}
</style>
