<template>
  <q-card-section class="column no-wrap fit">
    <video
      v-if="selectedVideoData?.url"
      class="col fit"
      loop
      autoplay
      :src="selectedVideoData.url"
      :style="{
        objectFit: 'contain',
        maxHeight: '40dvh',
      }"
    />
    <div v-else-if="editMode !== 'none'" class="col fit row justify-center items-center">
      <q-btn flat icon="upload" :label="translate('uploadVideo')" @click="showUploadDialog = true" />
      <UploadVideoComponent v-model:show-dialog="showUploadDialog" @upload-complete="uploadVideo" />
    </div>
    <div class="column col q-pt-md justify-start items-start">
      <div class="row justify-between items-center full-width">
        <span class="text-bold">
          {{ translate('videoAngles') }}
        </span>
        <q-btn v-if="editMode !== 'none'" flat round icon="add" @click="addAngle" />
      </div>
      <div class="row justify-center items-center q-pt-md">
        <q-btn-toggle
          v-model="selectedVideo"
          dense
          :options="signVideo?.videos.map((video) => ({
            label: video.angle,
            value: video.id,
          })) || []"
        />
      </div>
      <div v-if="editMode !== 'none' && selectedVideoData" class="row justify-between no-wrap items-center full-width q-mt-md">
        <q-input
          v-model="selectedVideoData.angle"
          :label="translate('angle')"
          outlined
          dense
          class="col"
        />
        <q-btn flat round icon="delete" @click="removeAngle" />
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SignVideo } from 'src/types/models';
import translate from 'src/utils/translate';
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';

const { signVideo, editMode } = defineProps<{
  signVideo: SignVideo;
  editMode: "strict" | "full" | "none";
}>();

const emit = defineEmits<{
  (e: 'update:signVideo', value: SignVideo): void
}>();

const selectedVideo = ref<string>(signVideo?.videos[0]?.id || '');
const selectedVideoData = computed(() => {
  return signVideo?.videos.find((video) => video.id === selectedVideo.value) || signVideo?.videos[0];
});

const showUploadDialog = ref(false)

const uploadVideo = (url: string) => {
  
  const newSignVideo = {
    ...signVideo,
  }
  const videoToUpdate = newSignVideo.videos.find(video => video.id === selectedVideo.value)
  if (videoToUpdate) {
    videoToUpdate.url = url
  }
  emit('update:signVideo', newSignVideo)
}

const addAngle = () => {
  if (!signVideo?.videos) return;
  const newVideo = {
    id: Date.now().toString(),
    angle: translate('newAngle'),
    url: '',
    priority: signVideo.videos.length + 1,
  }
  signVideo.videos.push(newVideo)
  selectedVideo.value = newVideo.id
}

const removeAngle = () => {
  if (!signVideo?.videos) return;
  const index = signVideo.videos.findIndex(video => video.id === selectedVideo.value)
  if (index > -1) {
    signVideo.videos.splice(index, 1)
    selectedVideo.value = signVideo.videos[0]?.id || ''
  }
}
</script>
