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
        v-if="hasMultipleVideos"
        class="text-body2 text-grey-7"
      >
        {{ pickerVideos.length }} {{ translate('videos') }}
      </span>
    </div>

    <div class="sign-videos-browse__main">
      <aside class="sign-videos-browse__videos">
        <template v-if="!hasMultipleVideos && selectedVideo">
          <div
            v-if="selectedVideo.title"
            class="text-subtitle2 text-weight-medium sign-videos-browse__video-title"
          >
            {{ selectedVideo.title }}
          </div>
          <q-card
            flat
            bordered
            class="sign-videos-browse__player"
          >
            <GlossVideoComponent
              :sign-video="selectedVideo"
              :edit-mode="false"
            />
          </q-card>
        </template>

        <!-- Multiple videos: list others only (primary stays on main gloss view) -->
        <div
          v-else-if="pickerVideos.length"
          class="sign-videos-browse__picker"
        >
          <button
            v-for="video in pickerVideos"
            :key="video.id ?? video.title"
            type="button"
            class="sign-videos-browse__picker-item"
            :class="{ 'sign-videos-browse__picker-item--active': video.id === selectedVideoId }"
            @click="selectVideo(video.id)"
          >
            <span class="sign-videos-browse__picker-label ellipsis">
              {{ video.title || translate('videos') }}
            </span>
            <q-card
              flat
              bordered
              class="sign-videos-browse__picker-video"
            >
              <GlossVideoComponent
                :sign-video="video"
                :edit-mode="false"
                :compact="video.id !== selectedVideoId"
              />
            </q-card>
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { GlossData } from 'src/types/models'
import GlossVideoComponent from './GlossVideoComponent.vue'
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

const hasMultipleVideos = computed(() => sortedVideos.value.length > 1)

const primaryVideoId = computed(() => sortedVideos.value[0]?.id ?? null)

/** Other sign videos — primary is already shown on the main gloss view */
const pickerVideos = computed(() => {
  if (!hasMultipleVideos.value) return []
  return sortedVideos.value.filter((video) => video.id !== primaryVideoId.value)
})

const selectedVideo = computed(() =>
  sortedVideos.value.find((video) => video.id === selectedVideoId.value) ?? null
)

watch(
  [sortedVideos, hasMultipleVideos, primaryVideoId],
  () => {
    const videos = sortedVideos.value
    if (!videos.length) {
      selectedVideoId.value = null
      return
    }

    if (!hasMultipleVideos.value) {
      selectedVideoId.value = videos[0]?.id ?? null
      return
    }

    const others = pickerVideos.value
    if (!others.length) {
      selectedVideoId.value = null
      return
    }

    if (!others.some((video) => video.id === selectedVideoId.value)) {
      selectedVideoId.value = others[0]?.id ?? null
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

.sign-videos-browse__main {
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
}

.sign-videos-browse__videos {
  flex: 1 1 0;
  max-width: none;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sign-videos-browse__video-title {
  flex: 0 0 auto;
}

.sign-videos-browse__player {
  flex: 0 0 auto;
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
}

.sign-videos-browse__picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 0 0 auto;
}

.sign-videos-browse__picker-item {
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

.sign-videos-browse__picker-item:hover {
  border-color: color-mix(in srgb, var(--primary) 35%, transparent);
}

.sign-videos-browse__picker-item--active {
  border-color: var(--primary);
  box-shadow: 0 2px 12px color-mix(in srgb, var(--primary) 12%, transparent);
}

.sign-videos-browse__picker-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.75);
  padding: 0 2px;
}

.sign-videos-browse__picker-video {
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
}

.sign-videos-browse__picker-item--active .sign-videos-browse__picker-video {
  overflow: hidden;
}

@media (max-width: 767px) {
  .sign-videos-browse__main {
    flex-direction: column;
    overflow-y: auto;
  }

  .sign-videos-browse__videos {
    flex: 0 0 auto;
    max-width: none;
    width: 100%;
  }

  .sign-videos-browse__picker {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }

  .sign-videos-browse__picker-item {
    flex: 0 0 140px;
    width: 140px;
  }

  .sign-videos-browse__picker-item--active {
    flex: 0 0 min(280px, 72vw);
    width: min(280px, 72vw);
  }
}
</style>
