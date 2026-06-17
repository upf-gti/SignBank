<template>
  <div class="sign-phonology q-mt-sm">
    <div class="text-subtitle2 text-weight-medium q-mb-sm">
      {{ translate('signFonology') }}
    </div>
    <PhonologyFilters
      :phonology-data="videoData"
      :is-editable="editMode"
      :compact="compact"
      @update:phonology-data="$emit('update:video-data', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { PhonologyData } from 'src/types/models';
import translate from 'src/utils/translate';
import PhonologyFilters from 'src/components/Shared/PhonologyFilters.vue';

defineProps<{
  videoData: PhonologyData;
  editMode: boolean;
  compact?: boolean;
}>();

defineEmits<{
  (e: 'update:video-data', value: PhonologyData): void;
}>();
</script>
