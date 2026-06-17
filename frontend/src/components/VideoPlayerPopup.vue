<template>
  <q-dialog
    v-model="showDialog"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="video-player-dialog">
      <q-card-section class="video-player-dialog__header row items-center no-wrap q-pa-md">
        <div class="text-subtitle1 text-weight-medium col ellipsis">
          {{ title }}
        </div>
        <q-btn
          v-close-popup
          icon="close"
          flat
          round
          dense
          class="col-auto q-ml-sm"
          :aria-label="translate('cancel')"
        />
      </q-card-section>

      <q-card-section class="video-player-dialog__body q-pa-md">
        <div class="video-player-dialog__frame">
          <video
            ref="videoPlayer"
            controls
            autoplay
            loop
            playsinline
            class="video-player-dialog__video"
            :src="getVideoUrl(videoUrl)"
            muted
            @error="handleVideoError"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
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

watch(() => props.showDialog, async (newValue) => {
  showDialog.value = newValue;

  if (newValue) {
    await nextTick();
    if (videoPlayer.value) {
      videoPlayer.value.currentTime = 0;
      void videoPlayer.value.play().catch(() => undefined);
    }
  }
});

watch(showDialog, (newValue) => {
  emit('update:show-dialog', newValue);

  if (!newValue && videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
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
.video-player-dialog {
  width: min(92vw, 720px);
  max-width: 92vw;
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
}

.video-player-dialog__header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.video-player-dialog__body {
  background: #f7f7f7;
}

.video-player-dialog__frame {
  border-radius: calc(var(--sb-card-radius, 12px) - 2px);
  overflow: hidden;
  background: #000;
  line-height: 0;
}

.video-player-dialog__video {
  display: block;
  width: 100%;
  max-height: min(70vh, 480px);
  object-fit: contain;
  vertical-align: middle;
}
</style>
