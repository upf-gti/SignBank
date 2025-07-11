<template>
  <SearchPhonologyFilters
    :phonology-data="phonologyData"
    :is-editable="true"
    @update:phonology-data="$emit('update:phonology-data', $event)"
  />
</template>

<script setup lang="ts">
// Create a type for filter inputs that allows empty values
type FilterInputs = {
  hands: string | null;
  configuration: string;
  configurationChanges: string;
  relationBetweenArticulators: string;
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

import SearchPhonologyFilters from './SearchPhonologyFilters.vue';

defineProps<{
  phonologyData: FilterInputs;
}>();

defineEmits<{
  (e: 'update:phonology-data', value: FilterInputs): void;
}>();

</script> 