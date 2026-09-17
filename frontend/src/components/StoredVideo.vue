<template>
  <div class="stored-video">
    <iframe
      v-if="showDrivePreview"
      class="stored-video__media"
      :src="drivePreviewUrl"
      :title="title"
      allow="autoplay; encrypted-media"
      allowfullscreen
      @load="onPreviewLoad"
    />
    <video
      v-else
      ref="videoEl"
      class="stored-video__media"
      v-bind="$attrs"
      :src="playableSrc"
      @error="onError"
      @loadeddata="onLoadedData"
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
}>(), {
  title: 'Video',
})

const emit = defineEmits<{
  error: [event: Event]
  loadeddata: [event: Event]
}>()

const videoEl = ref<HTMLVideoElement | null>(null)
const forcePreview = ref(false)

const playableSrc = computed(() => getVideoUrl(props.src))
const drivePreviewUrl = computed(() => getGoogleDrivePreviewUrl(props.src))
const showDrivePreview = computed(() => forcePreview.value && Boolean(drivePreviewUrl.value))

watch(() => props.src, () => {
  forcePreview.value = false
})

function onError(event: Event) {
  if (drivePreviewUrl.value) {
    forcePreview.value = true
    emit('loadeddata', event)
    return
  }
  emit('error', event)
}

function onLoadedData(event: Event) {
  emit('loadeddata', event)
}

function onPreviewLoad(event: Event) {
  emit('loadeddata', event)
}

function getVideoElement(): HTMLVideoElement | null {
  return videoEl.value
}

defineExpose({ getVideoElement })
</script>

<style scoped>
.stored-video,
.stored-video__media {
  width: 100%;
  height: 100%;
}

.stored-video__media {
  border: 0;
  display: block;
  object-fit: contain;
  background: #000;
}
</style>
