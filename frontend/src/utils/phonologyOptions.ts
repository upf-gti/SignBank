import { computed } from 'vue';
import { usePhonologyCatalogStore } from 'src/stores/phonology-catalog.store';
import type { PhonologySelectOption } from 'src/types/phonology-catalog';

export type { PhonologySelectOption };

export function usePhonologyOptions() {
  const catalog = usePhonologyCatalogStore();
  void catalog.ensureLoaded();

  return {
    handednessOptions: computed(() => catalog.optionsFor('HANDEDNESS')),
    handOptions: computed(() => catalog.optionsFor('HANDEDNESS')),
    handConfigurationOptions: computed(() => catalog.optionsFor('HAND_CONFIGURATION')),
    configurationChangeOptions: computed(() => catalog.optionsFor('CONFIGURATION_CHANGE')),
    relationBetweenArticulatorsOptions: computed(() =>
      catalog.optionsFor('RELATION_BETWEEN_ARTICULATORS'),
    ),
    locationOptions: computed(() => catalog.optionsFor('LOCATION')),
    movementRelatedOrientationOptions: computed(() =>
      catalog.optionsFor('MOVEMENT_RELATED_ORIENTATION'),
    ),
    orientationRelatedToLocationOptions: computed(() =>
      catalog.optionsFor('ORIENTATION_RELATED_TO_LOCATION'),
    ),
    orientationChangeOptions: computed(() => catalog.optionsFor('ORIENTATION_CHANGE')),
    contactTypeOptions: computed(() => catalog.optionsFor('CONTACT_TYPE')),
    movementTypeOptions: computed(() => catalog.optionsFor('MOVEMENT_TYPE')),
    movementDirectionOptions: computed(() => catalog.optionsFor('MOVEMENT_DIRECTION')),
  };
}

export function getOptionLabel(options: PhonologySelectOption[], value: string | null | undefined): string {
  if (!value) return '';
  const option = options.find((item) => item.value === value);
  return option ? option.label : value;
}
