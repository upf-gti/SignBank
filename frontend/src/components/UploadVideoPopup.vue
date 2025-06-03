<template>
  <q-dialog
    v-model="showDialog"
    persistent
  >
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ translate('uploadVideo') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-file
          v-model="selectedFile"
          :label="translate('selectVideo')"
          accept="video/*"
          outlined
          dense
          @update:model-value="handleFileSelect"
        />
      </q-card-section>

      <q-card-section v-if="loading">
        <q-linear-progress
          indeterminate
          color="primary"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="translate('cancel')"
          color="primary"
          @click="closeDialog"
        />
        <q-btn
          flat
          :label="translate('upload')"
          color="primary"
          :loading="loading"
          :disable="!selectedFile"
          @click="uploadVideo"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { api } from 'src/services/api';
import translate from 'src/utils/translate';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const props = defineProps<{
  showDialog: boolean;
  videoType?: 'gloss' | 'example';
}>();

const emit = defineEmits<{
  (e: 'update:show-dialog', value: boolean): void;
  (e: 'upload-complete', url: string): void;
}>();

const selectedFile = ref<File | null>(null);
const loading = ref(false);

const showDialog = ref(props.showDialog);

watch(() => props.showDialog, (newValue) => {
  showDialog.value = newValue;
});

watch(showDialog, (newValue) => {
  emit('update:show-dialog', newValue);
  if (!newValue) {
    selectedFile.value = null;
  }
});

const handleFileSelect = (file: File | null) => {
  selectedFile.value = file;
};

const closeDialog = () => {
  showDialog.value = false;
};

const uploadVideo = async () => {
  if (!selectedFile.value) return;

  try {
    loading.value = true;
    const response = await api.videos.upload(selectedFile.value, props.videoType);
    
    if (response.data?.url) {
      emit('upload-complete', response.data.url);
      closeDialog();
      $q.notify({
        type: 'positive',
        message: translate('videoUploadedSuccessfully')
      });
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToUploadVideo')
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.upload-dialog {
    min-width: 400px;
}

.upload-area {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    transition: border-color 0.3s;
}

.upload-area:hover {
    border-color: #1976d2;
}
</style>