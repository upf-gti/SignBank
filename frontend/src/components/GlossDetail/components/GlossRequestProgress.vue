<template>
  <q-card
    flat
    bordered
    class="q-mb-md progress-card"
  >
    <q-card-section class="q-py-sm">
      <div class="text-subtitle2 text-weight-medium q-mb-sm">
        {{ translate('creationProgress') }}
      </div>
      <div class="row q-col-gutter-sm">
        <div
          v-for="item in items"
          :key="item.key"
          class="col-6 col-sm-3"
        >
          <div
            class="progress-item row items-center no-wrap"
            :class="{ done: item.done }"
          >
            <q-icon
              :name="item.done ? 'check_circle' : 'radio_button_unchecked'"
              :color="item.done ? 'positive' : 'grey-5'"
              size="20px"
              class="q-mr-xs"
            />
            <span class="text-caption">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GlossData } from 'src/types/models';
import translate from 'src/utils/translate';

const props = defineProps<{
  glossData: GlossData;
}>();

const items = computed(() => {
  const data = props.glossData;
  const hasGloss = Boolean(data.gloss?.trim());
  const hasDefinition = data.definitions?.some(d => d.definition?.trim());
  const hasTranslation = data.glossTranslations?.some(t => t.translation?.trim());
  const hasVideo = data.glossVideos?.some(v => v.videos?.some(vid => vid.url?.trim()));

  return [
    { key: 'gloss', label: translate('gloss'), done: hasGloss },
    { key: 'definition', label: translate('definition'), done: hasDefinition },
    { key: 'translation', label: translate('translation'), done: hasTranslation },
    { key: 'video', label: translate('video'), done: hasVideo },
  ];
});
</script>

<style scoped>
.progress-card {
  border-radius: var(--sb-card-radius, 12px);
  background: var(--sb-surface);
}

.progress-item {
  color: #666;
}

.progress-item.done {
  color: #333;
}
</style>
