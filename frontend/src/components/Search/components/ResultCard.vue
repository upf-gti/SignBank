<template>
  <q-card flat class="result-card" @click="$emit('view-details', document.glossId)">
    <!-- Video Section -->
    <q-card-section v-if="document.url" class="video-section">
      <div class="video-container">
        <video
          class="video-player"
          :src="getVideoUrl(document.url)"
          preload="metadata"
          loop
          :autoplay="true"
          muted
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
          class="absolute-center"
        >
          <q-spinner
            color="primary"
            size="1.5em"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Content Section -->
    <q-card-section class="content-section">
      <!-- Gloss -->
      <div class="text-h6 text-truncate q-mb-sm">
        {{ document.gloss }}
      </div>
      
      <!-- Definition -->
      <div v-if="document.description" class="text-body2 text-grey-7 q-mb-sm description-text">
        {{ document.description }}
      </div>
      
      <!-- Sense Title -->
      <div class="text-subtitle2 text-truncate q-mb-sm">
        {{ document.senseTitle }}
      </div>
      
      <!-- Lexical Category -->
      <q-chip
        v-if="document.lexicalCategory"
        dense
        color="primary"
        text-color="white"
        class="q-mb-md"
      >
        {{ translate(document.lexicalCategory) }}
      </q-chip>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import { getVideoUrl } from 'src/utils/videoUrl';
import type { SearchResult } from 'src/services/search.service';
import { ref } from 'vue';

const t = (key: string) => translate(key);
const isLoading = ref(true);

const handleVideoError = (error: Event) => {
  console.error('Video loading error:', error);
  isLoading.value = false;
};

const handleVideoLoaded = () => {
  isLoading.value = false;
};

defineProps<{
  document: SearchResult;
  showDetails: boolean;
}>();

defineEmits<{
  (e: 'view-details', glossId: string): void;
}>();
</script>

<style scoped>
.result-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.video-section {
  padding-bottom: 8px;
}

.video-container {
  position: relative;
  width: 100%;
  height: 200px; /* Fixed height for consistent sizing */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
}

.video-player {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* This will center and maintain aspect ratio */
  width: auto;
  height: auto;
  border-radius: 6px;
}

.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 8px;
}

.description-text {
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .result-card {
    margin-bottom: 8px;
  }
  
  .video-container {
    height: 150px; /* Slightly smaller on mobile */
  }
}
</style> 