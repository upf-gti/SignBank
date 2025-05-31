<template>
  <q-card-section
    :style="{
      maxHeight: '30dvh',
      overflow: 'auto',
    }"
  >
    <span class="text-bold">
      {{ translate('signFonology') }}
    </span>
    <PhonologyFilters
      :model-value="videoData"
      :is-editable="editMode !== 'none'"
      @update:model-value="$emit('update:video-data', $event)"
    />
  </q-card-section>
</template>

<script setup lang="ts">
import { VideoData } from 'src/types/models';
import translate from 'src/utils/translate';
import PhonologyFilters from 'src/components/Shared/PhonologyFilters.vue';

const { videoData, editMode } = defineProps<{
  videoData: VideoData;
  editMode: "strict" | "full" | "none";
}>();

defineEmits<{
  (e: 'update:video-data', value: VideoData): void;
}>();
</script>
