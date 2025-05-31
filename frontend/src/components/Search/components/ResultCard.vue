<template>
  <q-card>
    <q-card-section horizontal>
      <template v-if="document.url">
        <q-card-section class="col-4">
          <video
            class="full-width"
            :src="getVideoUrl(document.url)"
            controls
            preload="none"
          />
        </q-card-section>
      </template>
      
      <q-card-section class="col">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">{{ document.gloss }}</div>
            <div class="text-subtitle2">{{ document.senseTitle }}</div>
            
            <q-chip
              v-if="document.lexicalCategory"
              dense
              color="primary"
              text-color="white"
              class="q-mt-sm"
            >
              {{ document.lexicalCategory }}
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
                <div class="text-caption text-grey">{{ t('hands') }}</div>
                <div class="q-mb-xs">{{ document.hands }}</div>
              </div>
              <div v-if="document.lexicalCategory">
                <div class="text-caption text-grey">{{ t('lexicalCategory') }}</div>
                <div class="q-mb-xs">{{ document.lexicalCategory }}</div>
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

const t = (key: string) => translate(key);

defineProps<{
  document: SearchResult;
  showDetails: boolean;
}>();

defineEmits<{
  (e: 'view-details', glossId: string): void;
}>();
</script> 