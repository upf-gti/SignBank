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
        accept="video/mp4, video/ogg, video/webm"
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

      <div class="text-center q-mt-xs text-caption text-grey-6">
        {{ translate('maxFileSize') }}: 20MB
      </div>
      <div class="text-center q-mt-xs text-caption text-grey-6">
        {{ translate('allowedFileTypes') }}: .mp4, .ogg, .webm
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
import { validateVideoFile, formatFileSize } from 'src/utils/videoValidation';

const videoFile = ref<File | null>(null);
const isUploading = ref(false);
const errorMessage = ref('');

const emit = defineEmits<{
    'upload-complete': [url: string],
}>();

const { videoType = 'gloss', customLabel } = defineProps<{
    customLabel?: string
    videoType?: 'gloss' | 'example' | 'definition'
}>()


const handleFileSelect = (file: File | null) => {
    if (!file) {
        errorMessage.value = '';
        return;
    }

    const validation = validateVideoFile(file, translate);
    if (!validation.isValid) {
        errorMessage.value = validation.error || translate('pleaseSelectAValidVideoFile');
        videoFile.value = null;
        return;
    }

    videoFile.value = file;
    errorMessage.value = '';
    uploadVideo().catch((err) => {
        console.error(err)
    })
};

const handleDrop = (event: DragEvent) => {
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles?.[0]) {
        const file = droppedFiles[0];
        const validation = validateVideoFile(file, translate);
        
        if (validation.isValid) {
            videoFile.value = file;
            errorMessage.value = '';
        } else {
            errorMessage.value = validation.error || translate('pleaseDropAValidVideoFile');
            videoFile.value = null;
        }
    }
    
    if (videoFile.value) {
        uploadVideo().catch((err) => {
            console.error(err)
        })
    }
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