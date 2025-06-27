<template>
  <q-card flat class="result-card">
    <!-- Desktop Layout (Horizontal) -->
    <q-card-section horizontal class="desktop-layout">
      <template v-if="document.url">
        <q-card-section class="col-5 col-sm-4">
          <div class="relative-position">
            <video
              class="full-width"
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
      </template>
      
      <q-card-section class="col no-wrap">
        <div class="row items-start justify-between">
          <div class="col">
            <div class="text-h6 text-truncate">
              {{ document.gloss }}
            </div>
            <div class="text-subtitle2 text-truncate">
              {{ document.senseTitle }}
            </div>
            
            <q-chip
              v-if="document.lexicalCategory"
              dense
              color="primary"
              text-color="white"
              class="q-mt-sm"
              size="sm"
            >
              {{ translate(document.lexicalCategory) }}
            </q-chip>
          </div>
          <q-btn
            color="primary"
            :label="t('viewDetails')"
            size="sm"
            dense
            @click="$emit('view-details', document.glossId)"
          />
        </div>

        <q-expansion-item
          v-if="showDetails"
          :label="t('configurationDetails')"
          dense
          class="q-mt-md"
        >
          <q-card>
            <q-card-section>
              <div v-if="document.hands">
                <div class="text-caption text-grey">
                  {{ t('hands') }}
                </div>
                <div class="q-mb-xs">
                  {{ document.hands }}
                </div>
              </div>
              <div v-if="document.lexicalCategory">
                <div class="text-caption text-grey">
                  {{ t('lexicalCategory') }}
                </div>
                <div class="q-mb-xs">
                  {{ document.lexicalCategory }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-card-section>
    </q-card-section>

    <!-- Mobile Layout (Vertical) -->
    <div class="mobile-layout">
      <!-- Video Section -->
      <q-card-section v-if="document.url" class="video-section">
        <div class="relative-position">
          <video
            class="full-width"
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
        <div class="text-h6 text-truncate q-mb-sm">
          {{ document.gloss }}
        </div>
        <div class="text-subtitle2 text-truncate q-mb-sm">
          {{ document.senseTitle }}
        </div>
        
        <q-chip
          v-if="document.lexicalCategory"
          dense
          color="primary"
          text-color="white"
          class="q-mb-md"
          size="sm"
        >
          {{ translate(document.lexicalCategory) }}
        </q-chip>

        <q-expansion-item
          v-if="showDetails"
          :label="t('configurationDetails')"
          dense
          class="q-mb-md"
        >
          <q-card>
            <q-card-section>
              <div v-if="document.hands">
                <div class="text-caption text-grey">
                  {{ t('hands') }}
                </div>
                <div class="q-mb-xs">
                  {{ document.hands }}
                </div>
              </div>
              <div v-if="document.lexicalCategory">
                <div class="text-caption text-grey">
                  {{ t('lexicalCategory') }}
                </div>
                <div class="q-mb-xs">
                  {{ document.lexicalCategory }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <!-- Details Button at Bottom -->
        <div class="text-center">
          <q-btn
            color="primary"
            :label="t('viewDetails')"
            size="sm"
            @click="$emit('view-details', document.glossId)"
          />
        </div>
      </q-card-section>
    </div>
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
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Desktop Layout (Horizontal) - Default */
.desktop-layout {
  display: flex;
}

.mobile-layout {
  display: none;
}

/* Mobile Layout (Vertical) - When card width < 500px */
@media (max-width: 500px) {
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: block;
  }
  
  .video-section {
    padding-bottom: 8px;
  }
  
  .content-section {
    padding-top: 8px;
  }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .result-card {
    margin-bottom: 8px;
  }
}
</style> 