<template>
  <q-card
    flat
    bordered
    class="result-card sb-card-interactive"
    role="button"
    tabindex="0"
    :aria-label="`${document.gloss}${document.description ? ': ' + document.description : ''}`"
    @click="emitViewDetails"
    @keydown.enter="emitViewDetails"
    @keydown.space.prevent="emitViewDetails"
  >
    <q-card-section
      v-if="document.url"
      class="video-section q-pb-none"
    >
      <div class="video-container bg-grey-2">
        <video
          ref="videoRef"
          class="video-player"
          :src="getVideoUrl(document.url)"
          preload="metadata"
          loop
          autoplay
          muted
          playsinline
          @error="handleVideoError"
          @loadeddata="handleVideoLoaded"
        >
          <source
            :src="getVideoUrl(document.url)"
            type="video/mp4"
          >
          {{ t('videoNotSupported') }}
        </video>
        <div
          v-if="isLoading"
          class="absolute-full flex flex-center bg-grey-2"
        >
          <q-spinner
            color="primary"
            size="2em"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section
      v-else
      class="video-section q-pb-none"
    >
      <div class="video-container bg-grey-2 flex flex-center">
        <q-icon
          name="videocam_off"
          size="2.5em"
          color="grey-5"
        />
      </div>
    </q-card-section>

    <q-card-section class="content-section">
      <div class="text-h6 text-truncate q-mb-xs gloss-title">
        {{ document.gloss }}
      </div>

      <div
        v-if="document.description"
        class="text-body2 text-grey-7 q-mb-sm description-text"
      >
        {{ document.description }}
      </div>

      <div
        v-if="lexicalCategories.length"
        class="lexical-categories row q-gutter-xs"
      >
        <q-chip
          v-for="category in lexicalCategories"
          :key="category"
          dense
          color="primary"
          text-color="white"
          size="sm"
        >
          {{ translate(category) }}
        </q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import { getVideoUrl } from 'src/utils/videoUrl';
import type { SearchResult } from 'src/services/search.service';
import { computed, ref } from 'vue';

const t = (key: string) => translate(key);
const isLoading = ref(true);
const videoRef = ref<HTMLVideoElement | null>(null);

const props = defineProps<{
  document: SearchResult;
  showDetails: boolean;
}>();

const emit = defineEmits<{
  (e: 'view-details', glossId: string): void;
}>();

const emitViewDetails = () => {
  emit('view-details', props.document.glossId);
};

const lexicalCategories = computed(() => {
  const { lexicalCategories: categories, lexicalCategory } = props.document;

  if (categories?.length) {
    return categories;
  }

  if (lexicalCategory) {
    return [lexicalCategory];
  }

  return [];
});

const handleVideoError = () => {
  isLoading.value = false;
};

const handleVideoLoaded = () => {
  isLoading.value = false;
  videoRef.value?.play().catch(() => {});
};
</script>

<style scoped>
.result-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--sb-card-radius);
  overflow: hidden;
}

.video-section {
  padding: 12px 12px 0;
}

.video-container {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.gloss-title {
  line-height: 1.3;
}

.description-text {
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lexical-categories {
  flex-wrap: wrap;
}

.lexical-categories :deep(.q-chip) {
  width: fit-content;
  max-width: 100%;
}

@media (max-width: 599px) {
  .video-container {
    height: 150px;
  }
}
</style>
