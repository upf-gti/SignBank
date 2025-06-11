<template>
  <q-card-section>
    <div
      class="upload-area q-pa-md"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <q-file
        v-model="videoFile"
        :label="customLabel || translate('chooseVideoFile')"
        filled
        accept="video/*"
        :loading="isUploading"
        :disable="isUploading"
        @update:model-value="handleFileSelect"
      >
        <template #prepend>
          <q-icon name="movie" />
        </template>
      </q-file>

      <div class="text-center q-mt-sm text-grey">
        {{ translate('orDragAndDropYourVideoHere') }}
      </div>

      <div
        v-if="isUploading"
        class="q-mt-md"
      >
        <q-linear-progress
          :value="1"
          color="primary"
        />
        <div class="text-center q-mt-sm">
          {{ translate('uploadingVideo') }}
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="text-negative q-mt-sm"
      >
        {{ errorMessage }}
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">

import { ref } from 'vue';
import api from 'src/services/api'    
import translate from 'src/utils/translate';

const videoFile = ref<File | null>(null);
const isUploading = ref(false);
const errorMessage = ref('');

const emit = defineEmits<{
    'upload-complete': [url: string],
}>();

const { videoType = 'gloss', customLabel } = defineProps<{
    customLabel?: string
    videoType?: 'gloss' | 'example'
}>()


const handleFileSelect = (file: File | null) => {
    if (file && !file.type.includes('video/')) {
        errorMessage.value = translate('pleaseSelectAValidVideoFile');
        videoFile.value = null;
        return;
    }
    errorMessage.value = '';
    uploadVideo();
};

const handleDrop = (event: DragEvent) => {
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles?.[0]) {
        const file = droppedFiles[0];
        if (file.type.includes('video/')) {
            videoFile.value = file;
            errorMessage.value = '';
        } else {
            errorMessage.value = translate('pleaseDropAValidVideoFile');
        }
    }
    uploadVideo();
};

const uploadVideo = async () => {
    if (!videoFile.value) return;

    const formData = new FormData();
    formData.append('video', videoFile.value);

    try {
        isUploading.value = true;
        errorMessage.value = '';
        
        const response = await api.videos.upload(videoFile.value, videoType)
        emit('upload-complete', response.data.url);
    } catch (error) {
        errorMessage.value = error instanceof Error 
            ? error.message 
            : translate('failedToUploadVideo');
    } finally {
        isUploading.value = false;
    }
};

</script>