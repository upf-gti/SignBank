<template>
  <div
    class="stored-video"
    :class="{
      'stored-video--drive': showDrivePreview,
      'stored-video--cover': fit === 'cover',
      'stored-video--contain': fit === 'contain',
      'stored-video--passive': drivePassive,
    }"
    :style="containerStyle"
  >
    <iframe
      v-if="showDrivePreview"
      class="stored-video__media stored-video__iframe"
      :src="drivePreviewUrl"
      :title="title"
      allow="autoplay; encrypted-media; fullscreen"
      allowfullscreen
      loading="lazy"
      @load="onPreviewLoad"
    />
    <video
      v-else
      ref="videoEl"
      class="stored-video__media stored-video__video"
      v-bind="$attrs"
      :src="playableSrc"
      @error="onError"
      @loadeddata="onLoadedData"
      @loadedmetadata="onLoadedMetadata"
      @canplay="onCanPlay"
    >
      <slot />
    </video>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getGoogleDrivePreviewUrl, getVideoUrl } from 'src/utils/videoUrl'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  src: string
  title?: string
  /** contain = max width or height without crop; cover = fill and crop */
  fit?: 'contain' | 'cover'
  /**
   * When true, Drive iframe ignores pointer events so parent cards stay clickable.
   */
  drivePassive?: boolean
  /** When true, size this box to the media's intrinsic aspect ratio. */
  adaptAspectRatio?: boolean
}>(), {
  title: 'Video',
  fit: 'contain',
  drivePassive: false,
  adaptAspectRatio: false,
})

const emit = defineEmits<{
  error: [event: Event]
  loadeddata: [event: Event]
  'aspect-ratio': [ratio: number | null]
}>()

const videoEl = ref<HTMLVideoElement | null>(null)
const forcePreview = ref(false)
const aspectRatio = ref<number | null>(null)

const playableSrc = computed(() => getVideoUrl(props.src))
const drivePreviewUrl = computed(() => getGoogleDrivePreviewUrl(props.src))
const showDrivePreview = computed(() => forcePreview.value && Boolean(drivePreviewUrl.value))

const containerStyle = computed(() => {
  if (!props.adaptAspectRatio || !aspectRatio.value) {
    return undefined
  }
  return { aspectRatio: String(aspectRatio.value) }
})

watch(() => props.src, () => {
  forcePreview.value = false
  aspectRatio.value = null
  emit('aspect-ratio', null)
})

function setAspectRatio(ratio: number | null) {
  aspectRatio.value = ratio
  emit('aspect-ratio', ratio)
}

async function tryAutoplay() {
  const video = videoEl.value
  if (!video) return
  try {
    video.muted = true
    await video.play()
  } catch {
    // Autoplay may still be blocked until a user gesture.
  }
}

function syncAspectFromVideo() {
  const video = videoEl.value
  if (video?.videoWidth && video.videoHeight) {
    setAspectRatio(video.videoWidth / video.videoHeight)
  }
}

function onError(event: Event) {
  if (drivePreviewUrl.value) {
    forcePreview.value = true
    // Typical LSC signing frame is near-square / mild portrait.
    setAspectRatio(3 / 4)
    emit('loadeddata', event)
    return
  }
  emit('error', event)
}

function onLoadedMetadata() {
  syncAspectFromVideo()
}

function onLoadedData(event: Event) {
  syncAspectFromVideo()
  emit('loadeddata', event)
  void tryAutoplay()
}

function onCanPlay() {
  void tryAutoplay()
}

function onPreviewLoad(event: Event) {
  if (!aspectRatio.value) {
    setAspectRatio(3 / 4)
  }
  emit('loadeddata', event)
}

function getVideoElement(): HTMLVideoElement | null {
  return videoEl.value
}

defineExpose({ getVideoElement, isDrivePreview: showDrivePreview })
</script>

<style scoped>
.stored-video {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

.stored-video__media {
  border: 0;
  display: block;
  background: #000;
}

.stored-video--contain .stored-video__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.stored-video--cover .stored-video__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/*
 * Drive preview fills the box. Mild scale only crops Drive chrome
 * (top bar), not the signing area — keep contain behaviour.
 */
.stored-video--drive .stored-video__iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  transform: scale(1.12);
  transform-origin: center center;
}

.stored-video--drive.stored-video--passive .stored-video__iframe {
  pointer-events: none;
}
</style>
