<template>
  <q-card-section class="column no-wrap fit">
    <video
      class="col fit"
      loop
      autoplay
      :src="selectedVideoData?.url || ''"
      :style="{
        objectFit: 'contain',
        maxHeight: '40dvh',
      }"
    />
    <div class="column col q-pt-md justify-start items-start">
      <span class="text-bold">
        {{ translate('videoAngles') }}
      </span>
      <div class="row justify-center items-center q-pt-md">
        <q-btn-toggle
          v-model="selectedVideo"
          dense
          :options="signVideo?.videos.map((video) => ({
            label: video.angle,
            value: video.id,
          }))"
        />
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SignVideo } from 'src/types/models';
import translate from 'src/utils/translate';

const { signVideo } = defineProps<{
  signVideo: SignVideo;
}>();

const selectedVideo = ref<string>(signVideo?.videos[0]?.id || '');
const selectedVideoData = computed(() => {
  return signVideo?.videos.find((video) => video.id === selectedVideo.value) || signVideo?.videos[0];
});
</script>
