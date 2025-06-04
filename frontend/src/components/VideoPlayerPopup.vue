<template>
  <q-dialog
    v-model="showDialog"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="column">
      <q-card-section class="row items-start q-pb-none no-wrap">
        <q-space />
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense
        />
      </q-card-section>

      <q-card-section class="col q-pa-md flex flex-center">
        <video
          ref="videoPlayer"
          controls
          autoplay
          loop
          class="video-player"
          :src="getVideoUrl(videoUrl)"
          @error="handleVideoError"
        />
        <div class="text-h6 q-mt-md">
          {{ title }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import translate from 'src/utils/translate';
import { getVideoUrl } from 'src/utils/videoUrl'

const $q = useQuasar();

const props = defineProps<{
  showDialog: boolean;
  videoUrl: string;
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'update:show-dialog', value: boolean): void;
}>();

const showDialog = ref(props.showDialog);
const videoPlayer = ref<HTMLVideoElement | null>(null);

watch(() => props.showDialog, (newValue) => {
  showDialog.value = newValue;
});

watch(showDialog, (newValue) => {
  emit('update:show-dialog', newValue);
  if (!newValue && videoPlayer.value) {
    videoPlayer.value.pause();
  }
});

const handleVideoError = () => {
  $q.notify({
    type: 'negative',
    message: translate('errors.failedToLoadVideo')
  });
};
</script>

<style scoped>
.video-player {
  max-width: 100%;
  max-height: calc(100vh - 150px);
  width: auto;
  height: auto;
}

.q-dialog__inner--maximized > div {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 