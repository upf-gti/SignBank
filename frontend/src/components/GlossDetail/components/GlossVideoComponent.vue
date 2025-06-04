<template>
  <q-card-section class="column no-wrap fit">
    <video
      v-if="selectedVideoData?.url"
      class="col fit"
      loop
      autoplay
      :src="getVideoUrl(selectedVideoData.url)"
      :style="{
        objectFit: 'contain',
        maxHeight: '40dvh',
      }"
    />
    <div
      v-else-if="editMode"
      class="col fit row justify-center items-center"
    >
      <UploadVideoComponent
        video-type="gloss"
        :custom-label="translate('addGlossVideo')"
        @upload-complete="(url) => uploadVideo(url)"
      />
    </div>
    <div class="column col justify-start items-start">
      <div class="row justify-between items-center full-width">
        <span class="text-bold">
          {{ translate('videoAngles') }}
        </span>
        <q-btn
          v-if="editMode"
          flat
          round
          icon="add"
          :label="translate('addAngle')"
          @click="addAngle"
        />
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
      <div
        v-if="editMode && selectedVideoData"
        class="column justify-center no-wrap items-start full-width q-mt-md"
      >
        <q-btn
          v-if="signVideo.videos.length > 1"
          flat
          round
          icon="delete"
          :label="translate('deleteAngle')"
          @click="removeAngle"
        />
        <q-input
          v-model="selectedVideoData.angle"
          :label="translate('angle')"
          outlined
          dense
          class="col full-width"
        />
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SignVideo } from 'src/types/models';
import translate from 'src/utils/translate';
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';
import { getVideoUrl } from 'src/utils/videoUrl';

const { signVideo, editMode } = defineProps<{
  signVideo: SignVideo;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:signVideo', value: SignVideo): void
}>();

const selectedVideo = ref<string>(signVideo?.videos[0]?.id || '');
const selectedVideoData = computed(() => {
  return signVideo?.videos.find((video) => video.id === selectedVideo.value) || signVideo?.videos[0];
});

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
