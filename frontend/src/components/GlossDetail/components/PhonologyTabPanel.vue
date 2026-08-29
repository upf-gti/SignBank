<template>
  <div class="phonology-tab-panel q-pa-md">
    <div
      v-if="hasMultipleVideos"
      class="phonology-tab-panel__selector q-mb-md"
    >
      <q-select
        v-model="selectedVideoId"
        :options="videoOptions"
        :label="translate('videos')"
        outlined
        dense
        emit-value
        map-options
        options-dense
        class="phonology-tab-panel__select"
      />
    </div>

    <SignFonologyComponent
      v-if="selectedVideo?.videoData"
      :video-data="selectedVideo.videoData"
      :edit-mode="false"
      natural-height
      hide-title
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { GlossData } from 'src/types/models';
import SignFonologyComponent from './SignFonologyComponent.vue';
import translate from 'src/utils/translate';
import { getPrimarySignVideo } from 'src/utils/glossTabVisibility';

const { glossData } = defineProps<{
  glossData: GlossData;
}>();

const sortedVideos = computed(() =>
  [...(glossData.glossVideos || [])].sort(
    (a, b) => (a.priority || 0) - (b.priority || 0),
  ),
);

const hasMultipleVideos = computed(() => sortedVideos.value.length > 1);

const selectedVideoId = ref<string | null>(null);

const videoOptions = computed(() =>
  sortedVideos.value
    .filter((video) => video.id)
    .map((video) => ({
      label: video.title || translate('videos'),
      value: video.id as string,
    })),
);

const selectedVideo = computed(() =>
  sortedVideos.value.find((video) => video.id === selectedVideoId.value) ?? null,
);

watch(
  sortedVideos,
  (videos) => {
    const primary = getPrimarySignVideo(glossData);
    const nextId = primary?.id ?? videos[0]?.id ?? null;

    if (!videos.some((video) => video.id === selectedVideoId.value)) {
      selectedVideoId.value = nextId;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.phonology-tab-panel__select {
  max-width: 360px;
}
</style>
