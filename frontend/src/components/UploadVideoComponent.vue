<template>
  <q-card-section>
    <div
      class="upload-area q-pa-md"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <q-file
        v-model="videoFile"
        label="Choose video file"
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
        or drag and drop your video here
      </div>

      <div
        v-if="uploadProgress > 0 && uploadProgress < 100"
        class="q-mt-md"
      >
        <q-linear-progress
          :value="uploadProgress / 100"
          color="primary"
        />
        <div class="text-center q-mt-sm">
          {{ Math.round(uploadProgress) }}%
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

import { ref, watch } from 'vue';
import axios from 'axios';
import api from 'src/services/api'

const videoFile = ref<File | null>(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const errorMessage = ref('');

const emit = defineEmits<{
    'upload-complete': [url: string],
    'update:modelValue': [value: boolean]
}>();

const showDialog = defineModel<boolean>('showDialog', { required: true })


watch(showDialog, (newVal: boolean) => {
    emit('update:modelValue', newVal);
    if (!newVal) {
        videoFile.value = null;
        uploadProgress.value = 0;
        errorMessage.value = '';
    }
});

const handleFileSelect = (file: File | null) => {
    if (file && !file.type.includes('video/')) {
        errorMessage.value = 'Please select a valid video file';
        videoFile.value = null;
        return;
    }
    errorMessage.value = '';
};

const handleDrop = (event: DragEvent) => {
    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles?.[0]) {
        const file = droppedFiles[0];
        if (file.type.includes('video/')) {
            videoFile.value = file;
            errorMessage.value = '';
        } else {
            errorMessage.value = 'Please drop a valid video file';
        }
    }
};

const uploadVideo = async () => {
    if (!videoFile.value) return;

    const formData = new FormData();
    formData.append('video', videoFile.value);

    try {
        isUploading.value = true;
        errorMessage.value = '';
        
        const response = await api.videos.upload(videoFile.value)
        emit('upload-complete', response.data.url);
        showDialog.value = false;
    } catch (error) {
        errorMessage.value = error instanceof Error 
            ? error.message 
            : 'Failed to upload video';
    } finally {
        isUploading.value = false;
    }
};

</script>