<template>
  <SearchPhonologyFilters
    :phonology-data="phonologyData"
    :is-editable="true"
    @update:phonology-data="$emit('update:phonology-data', $event)"
  />
</template>

<script setup lang="ts">
import SearchPhonologyFilters from './SearchPhonologyFilters.vue';

type FilterInputs = {
  handedness: string | null;
  dominantConfiguration: string;
  configurationChanges: string;
  dominantRelationBetweenArticulators: string;
  location: string;
  movementRelatedOrientation: string;
  orientationRelatedToLocation: string;
  orientationChange: string;
  contactType: string;
  movementType: string;
  vocalization: string;
  nonManualComponent: string;
  inicialization: string;
  repeatedMovement: boolean | null;
  movementDirection: string;
};

defineProps<{
  phonologyData: FilterInputs;
}>();

defineEmits<{
  (e: 'update:phonology-data', value: FilterInputs): void;
}>();
</script>
