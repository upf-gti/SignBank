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
      :phonology-data="videoData"
      :is-editable="editMode"
      @update:phonology-data="$emit('update:video-data', $event)"
    />
  </q-card-section>
</template>

<script setup lang="ts">
import { PhonologyData } from 'src/types/models';
import translate from 'src/utils/translate';
import PhonologyFilters from 'src/components/Shared/PhonologyFilters.vue';

const { videoData, editMode } = defineProps<{
  videoData: PhonologyData;
  editMode: boolean;
}>();

defineEmits<{
  (e: 'update:video-data', value: PhonologyData): void;
}>();
</script>
