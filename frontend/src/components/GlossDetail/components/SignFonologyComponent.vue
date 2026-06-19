<template>
  <div class="sign-phonology">
    <div class="text-subtitle2 text-weight-medium sign-phonology__title">
      {{ translate('signFonology') }}
    </div>
    <PhonologyTable
      :phonology-data="videoData"
      :is-editable="editMode"
      :compact="compact ?? false"
      @update:phonology-data="$emit('update:video-data', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { PhonologyData } from 'src/types/models';
import translate from 'src/utils/translate';
import PhonologyTable from 'src/components/Shared/PhonologyTable.vue';

defineProps<{
  videoData: PhonologyData;
  editMode: boolean;
  compact?: boolean;
}>();

defineEmits<{
  (e: 'update:video-data', value: PhonologyData): void;
}>();
</script>

<style scoped>
.sign-phonology {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 auto;
  height: 100%;
}

.sign-phonology__title {
  flex: 0 0 auto;
  margin-bottom: 8px;
}
</style>
