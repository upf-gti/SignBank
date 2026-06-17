<template>
  <div class="sign-videos-browse">
    <div class="sign-videos-browse__toolbar">
      <q-btn
        flat
        no-caps
        color="primary"
        icon="arrow_back"
        :label="translate('backToMainVideo')"
        @click="emit('back')"
      />
      <span
        v-if="sortedVideos.length > 1"
        class="text-body2 text-grey-7"
      >
        {{ sortedVideos.length }} {{ translate('videos') }}
      </span>
    </div>

    <div
      v-if="sortedVideos.length > 1"
      class="sign-videos-browse__gallery"
    >
      <button
        v-for="video in sortedVideos"
        :key="video.id"
        type="button"
        class="sign-videos-browse__card"
        :class="{ 'sign-videos-browse__card--active': video.id === selectedVideoId }"
        @click="selectVideo(video.id)"
      >
        <div class="sign-videos-browse__card-title ellipsis">
          {{ video.title || translate('videos') }}
        </div>
        <q-card
          flat
          bordered
          class="sign-videos-browse__card-video"
        >
          <GlossVideoComponent
            :sign-video="video"
            :edit-mode="false"
            compact
          />
        </q-card>
      </button>
    </div>

    <div
      v-else-if="selectedVideo"
      class="sign-videos-browse__single"
    >
      <div
        v-if="selectedVideo.title"
        class="text-subtitle1 text-weight-medium q-mb-sm"
      >
        {{ selectedVideo.title }}
      </div>
      <q-card
        flat
        bordered
        class="sign-videos-browse__single-video"
      >
        <GlossVideoComponent
          :sign-video="selectedVideo"
          :edit-mode="false"
        />
      </q-card>
    </div>

    <q-card
      v-if="selectedVideo?.videoData"
      flat
      bordered
      class="sign-videos-browse__phonology"
    >
      <SignFonologyComponent
        :video-data="selectedVideo.videoData"
        :edit-mode="false"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { GlossData } from 'src/types/models'
import GlossVideoComponent from './GlossVideoComponent.vue'
import SignFonologyComponent from './SignFonologyComponent.vue'
import translate from 'src/utils/translate'

const { glossData } = defineProps<{
  glossData: GlossData
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const selectedVideoId = ref<string | null>(null)

const sortedVideos = computed(() =>
  [...(glossData.glossVideos || [])].sort(
    (a, b) => (a.priority || 0) - (b.priority || 0)
  )
)

const selectedVideo = computed(() =>
  sortedVideos.value.find((video) => video.id === selectedVideoId.value) ?? null
)

watch(
  sortedVideos,
  (videos) => {
    if (!videos.length) {
      selectedVideoId.value = null
      return
    }

    if (!videos.some((video) => video.id === selectedVideoId.value)) {
      selectedVideoId.value = videos[0]?.id ?? null
    }
  },
  { immediate: true }
)

function selectVideo(videoId: string | undefined) {
  if (videoId) {
    selectedVideoId.value = videoId
  }
}
</script>

<style scoped>
.sign-videos-browse {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.sign-videos-browse__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  margin-bottom: 12px;
  gap: 12px;
}

.sign-videos-browse__gallery {
  display: flex;
  gap: 16px;
  flex: 0 0 auto;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  margin-bottom: 16px;
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

.sign-videos-browse__card {
  flex: 0 0 380px;
  width: 380px;
  border: 2px solid transparent;
  border-radius: var(--sb-card-radius, 12px);
  background: transparent;
  cursor: pointer;
  padding: 4px;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.sign-videos-browse__card:hover {
  border-color: rgba(200, 16, 47, 0.35);
}

.sign-videos-browse__card--active {
  border-color: var(--primary);
  box-shadow: 0 2px 12px rgba(200, 16, 47, 0.12);
}

.sign-videos-browse__card-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 8px;
  padding: 0 4px;
}

.sign-videos-browse__card-video {
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
}

.sign-videos-browse__single {
  flex: 0 0 auto;
  margin-bottom: 16px;
}

.sign-videos-browse__single-video {
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
}

.sign-videos-browse__phonology {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  border-radius: var(--sb-card-radius, 12px);
  padding: 12px 16px;
  -webkit-overflow-scrolling: touch;
}

.sign-videos-browse__phonology :deep(.sign-phonology) {
  margin-top: 0;
}

.sign-videos-browse__phonology :deep(.phonology-filters > .column) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  column-gap: 20px;
  row-gap: 4px;
}

.sign-videos-browse__phonology :deep(.q-item-label) {
  margin-bottom: 2px;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.5);
}

.sign-videos-browse__phonology :deep(.q-py-sm) {
  padding-top: 0 !important;
  padding-bottom: 10px !important;
}
</style>
