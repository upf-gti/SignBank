<template>
  <q-card flat>
    <q-card-section horizontal>
      <template v-if="document.url">
        <q-card-section class="col-4">
          <video
            class="full-width"
            :src="getVideoUrl(document.url)"
            preload="metadata"
            loop
            :autoplay="true"
            @error="handleVideoError"
            @loadeddata="handleVideoLoaded"
          >
            <source :src="getVideoUrl(document.url)" type="video/mp4">
            {{ t('videoNotSupported') }}
          </video>
          <div v-if="isLoading" class="absolute-center">
            <q-spinner color="primary" size="2em" />
          </div>
        </q-card-section>
      </template>
      
      <q-card-section class="col">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">
              {{ document.gloss }}
            </div>
            <div class="text-subtitle2">
              {{ document.senseTitle }}
            </div>
            
            <q-chip
              v-if="document.lexicalCategory"
              dense
              color="primary"
              text-color="white"
              class="q-mt-sm"
            >
              {{ translate(document.lexicalCategory) }}
            </q-chip>
          </div>
          <q-btn
            color="primary"
            :label="t('viewDetails')"
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