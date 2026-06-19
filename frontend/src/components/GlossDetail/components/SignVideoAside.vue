<template>
  <div class="sign-video-panel">
    <q-card
      v-if="primarySignVideo"
      flat
      bordered
      class="sign-video-aside"
    >
      <GlossVideoComponent
        :sign-video="primarySignVideo"
        :edit-mode="false"
      />
    </q-card>

    <q-btn
      v-if="showDetailsButton"
      flat
      no-caps
      color="primary"
      class="q-mt-sm full-width"
      :label="detailsButtonLabel"
      icon="videocam"
      @click="emit('showAllVideos')"
    />

    <div
      v-if="hasGlossTranslations"
      class="sign-video-panel__translations"
    >
      <GlossTranslationsComponent
        :gloss-data="glossData"
        :edit-mode="false"
        hide-section-title
        compact
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { GlossData } from 'src/types/models'
import GlossVideoComponent from './GlossVideoComponent.vue'
import GlossTranslationsComponent from './GlossTranslationsComponent.vue'
import translate from 'src/utils/translate'

const { glossData } = defineProps<{
  glossData: GlossData
}>()

const emit = defineEmits<{
  (e: 'showAllVideos'): void
}>()

const primarySignVideo = computed(() => {
  const videos = glossData.glossVideos || []
  if (!videos.length) return null
  return [...videos].sort((a, b) => a.priority - b.priority)[0] ?? null
})

const hasMultipleSignVideos = computed(() => (glossData.glossVideos?.length ?? 0) > 1)

const hasGlossTranslations = computed(() =>
  (glossData.glossTranslations?.length ?? 0) > 0
)

const showDetailsButton = computed(() =>
  Boolean(primarySignVideo.value) && (glossData.glossVideos?.length ?? 0) > 0
)

const detailsButtonLabel = computed(() =>
  hasMultipleSignVideos.value
    ? translate('seeOtherVideos')
    : translate('signFonology')
)
</script>

<style scoped>
.sign-video-aside {
  flex: 0 0 auto;
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
  max-width: 100%;
}

.sign-video-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
}

.sign-video-panel__translations {
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
