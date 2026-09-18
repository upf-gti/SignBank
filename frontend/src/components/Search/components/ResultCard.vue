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
        <StoredVideo
          class="video-player"
          :src="document.url"
          fit="cover"
          drive-passive
          preload="auto"
          loop
          autoplay
          muted
          playsinline
          @error="handleVideoError"
          @loadeddata="handleVideoLoaded"
        />
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
import StoredVideo from 'src/components/StoredVideo.vue';
import type { SearchResult } from 'src/services/search.service';
import { computed, ref } from 'vue';

const isLoading = ref(true);

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
  aspect-ratio: 4 / 5;
  min-height: 220px;
  max-height: 300px;
  height: auto;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.video-player {
  width: 100%;
  height: 100%;
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
    min-height: 180px;
    max-height: 240px;
  }
}
</style>
