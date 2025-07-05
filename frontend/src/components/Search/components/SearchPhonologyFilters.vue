<template>
  <div class="phonology-filters overflow-x-hidden">
    <div class="column q-col-gutter-md">
      <!-- Hands -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('hands') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.hands"
            class="text-body2"
          >{{ getHandLabel(localData.hands) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-btn-toggle
          v-else
          v-model="localData.hands"
          :options="[
            { label: translate('activeHand'), value: 'RIGHT' },
            { label: translate('both'), value: 'BOTH' }
          ]"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-3"
          text-color="grey-8"
          class="full-width"
          clearable
          @update:model-value="updateField('hands', $event)"
        />
      </div>

      <!-- Configuration -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('configuration') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.configuration"
            class="text-body2"
          >{{ getConfigurationLabel(localData.configuration) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.configuration"
          :options="filteredOptions.configuration"
          :label="translate('configuration')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.handConfigurationOptions, 'configuration')"
          @update:model-value="updateField('configuration', $event)"
        />
      </div>

      <!-- Configuration Changes -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('configurationChanges') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.configurationChanges"
            class="text-body2"
          >{{ getConfigurationChangesLabel(localData.configurationChanges) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.configurationChanges"
          :options="filteredOptions.configurationChanges"
          :label="translate('configurationChanges')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.configurationChangeOptions, 'configurationChanges')"
          @update:model-value="updateField('configurationChanges', $event)"
        >
          <template #option="{ opt }">
            <q-item v-close-popup>
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
                <q-item-label
                  v-if="opt.description"
                  caption
                >
                  {{ opt.description }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <!-- Relation Between Articulators -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('relationBetweenArticulators') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.relationBetweenArticulators"
            class="text-body2"
          >{{ getRelationBetweenArticulatorsLabel(localData.relationBetweenArticulators) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.relationBetweenArticulators"
          :options="filteredOptions.relationBetweenArticulators"
          :label="translate('relationBetweenArticulators')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.relationBetweenArticulatorsOptions, 'relationBetweenArticulators')"
          @update:model-value="updateField('relationBetweenArticulators', $event)"
        />
      </div>

      <!-- Location -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('location') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.location"
            class="text-body2"
          >{{ getLocationLabel(localData.location) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.location"
          :options="filteredOptions.location"
          :label="translate('location')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.locationOptions, 'location')"
          @update:model-value="updateField('location', $event)"
        />
      </div>

      <!-- Movement Related Orientation -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('movementRelatedOrientation') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.movementRelatedOrientation"
            class="text-body2"
          >{{ getMovementRelatedOrientationLabel(localData.movementRelatedOrientation) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.movementRelatedOrientation"
          :options="filteredOptions.movementRelatedOrientation"
          :label="translate('movementRelatedOrientation')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.movementRelatedOrientationOptions, 'movementRelatedOrientation')"
          @update:model-value="updateField('movementRelatedOrientation', $event)"
        />
      </div>

      <!-- Orientation Related To Location -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('orientationRelatedToLocation') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.orientationRelatedToLocation"
            class="text-body2"
          >{{ getOrientationRelatedToLocationLabel(localData.orientationRelatedToLocation) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.orientationRelatedToLocation"
          :options="filteredOptions.orientationRelatedToLocation"
          :label="translate('orientationRelatedToLocation')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.orientationRelatedToLocationOptions, 'orientationRelatedToLocation')"
          @update:model-value="updateField('orientationRelatedToLocation', $event)"
        />
      </div>

      <!-- Orientation Change -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('orientationChange') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.orientationChange"
            class="text-body2"
          >{{ getOrientationChangeLabel(localData.orientationChange) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.orientationChange"
          :options="filteredOptions.orientationChange"
          :label="translate('orientationChange')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.orientationChangeOptions, 'orientationChange')"
          @update:model-value="updateField('orientationChange', $event)"
        />
      </div>

      <!-- Contact Type -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('contactType') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.contactType"
            class="text-body2"
          >{{ getContactTypeLabel(localData.contactType) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.contactType"
          :options="filteredOptions.contactType"
          :label="translate('contactType')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.contactTypeOptions, 'contactType')"
          @update:model-value="updateField('contactType', $event)"
        />
      </div>

      <!-- Movement Type -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('movementType') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.movementType"
            class="text-body2"
          >{{ getMovementTypeLabel(localData.movementType) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.movementType"
          :options="filteredOptions.movementType"
          :label="translate('movementType')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.movementTypeOptions, 'movementType')"
          @update:model-value="updateField('movementType', $event)"
        />
      </div>

      <!-- Movement Direction -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('movementDirection') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.movementDirection"
            class="text-body2"
          >{{ getMovementDirectionLabel(localData.movementDirection) }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-select
          v-else
          v-model="localData.movementDirection"
          :options="filteredOptions.movementDirection"
          :label="translate('movementDirection')"
          clearable
          emit-value
          map-options
          options-dense
          use-input
          input-debounce="300"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.movementDirectionOptions, 'movementDirection')"
          @update:model-value="updateField('movementDirection', $event)"
        />
      </div>

      <!-- Vocalization -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('vocalization') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.vocalization"
            class="text-body2"
          >{{ localData.vocalization }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-input
          v-else
          v-model="localData.vocalization"
          :label="translate('vocalization')"
          clearable
          @update:model-value="updateField('vocalization', $event)"
        />
      </div>

      <!-- Non Manual Component -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('nonManualComponent') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.nonManualComponent"
            class="text-body2"
          >{{ localData.nonManualComponent }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-input
          v-else
          v-model="localData.nonManualComponent"
          :label="translate('nonManualComponent')"
          clearable
          @update:model-value="updateField('nonManualComponent', $event)"
        />
      </div>

      <!-- Inicialization -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('inicialization') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.inicialization"
            class="text-body2"
          >{{ localData.inicialization }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-input
          v-else
          v-model="localData.inicialization"
          :label="translate('inicialization')"
          clearable
          @update:model-value="updateField('inicialization', $event)"
        />
      </div>

      <!-- Repeated Movement -->
      <div class="col-12">
        <q-item-label
          v-if="!isEditable"
          caption
        >
          {{ translate('repeatedMovement') }}
        </q-item-label>
        <div
          v-if="!isEditable"
          class="q-py-sm"
        >
          <span
            v-if="localData.repeatedMovement === true"
            class="text-body2"
          >{{ translate('yes') }}</span>
          <span
            v-else-if="localData.repeatedMovement === false"
            class="text-body2"
          >{{ translate('no') }}</span>
          <span
            v-else
            class="text-grey-5"
          >{{ translate('notSet') }}</span>
        </div>
        <q-btn-toggle
          v-else
          v-model="localData.repeatedMovement"
          :options="[
            { label: translate('yes'), value: true },
            { label: translate('no'), value: false }
          ]"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-3"
          text-color="grey-8"
          class="full-width"
          clearable
          @update:model-value="updateBooleanField('repeatedMovement', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import translate from 'src/utils/translate';
import { usePhonologyOptions } from '../../../utils/phonologyOptions';

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

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

const props = defineProps<{
  phonologyData: FilterInputs;
  isEditable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:phonologyData', value: FilterInputs): void;
}>();

const phonologyOptions = usePhonologyOptions();
const localData = ref<FilterInputs>({ ...props.phonologyData });

// Initialize filtered options with the original options
const filteredOptions = ref({
  hands: phonologyOptions.handOptions,
  configuration: phonologyOptions.handConfigurationOptions,
  configurationChanges: phonologyOptions.configurationChangeOptions,
  relationBetweenArticulators: phonologyOptions.relationBetweenArticulatorsOptions,
  location: phonologyOptions.locationOptions,
  movementRelatedOrientation: phonologyOptions.movementRelatedOrientationOptions,
  orientationRelatedToLocation: phonologyOptions.orientationRelatedToLocationOptions,
  orientationChange: phonologyOptions.orientationChangeOptions,
  contactType: phonologyOptions.contactTypeOptions,
  movementType: phonologyOptions.movementTypeOptions,
  movementDirection: phonologyOptions.movementDirectionOptions,
});

// Keep local data in sync with prop changes
watch(() => props.phonologyData, (newValue) => {
  localData.value = { ...newValue };
}, { deep: true });

// Custom filter function that searches both in value and label
function filterFn(
  val: string, 
  update: (callback: () => void) => void,
  options: SelectOption[],
  key: keyof typeof filteredOptions.value
) {
  if (val === '') {
    update(() => {
      filteredOptions.value[key] = options;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredOptions.value[key] = options.filter(opt => {
      const haystack = opt.label.toLowerCase();
      const haystackValue = opt.value.toLowerCase();
      return haystack.includes(needle) || haystackValue.includes(needle);
    });
  });
}

const updateField = (field: keyof FilterInputs, value: string | string[] | number | null | boolean) => {
  localData.value = {
    ...localData.value,
    [field]: value !== null ? String(value) : ''
  };
  emit('update:phonologyData', localData.value);
};

const getHandLabel = (hands: string) => {
  switch (hands) {
    case 'RIGHT':
      return translate('right');
    case 'LEFT':
      return translate('left');
    case 'BOTH':
      return translate('both');
    default:
      return '';
  }
};

const getConfigurationLabel = (configuration: string) => {
  const option = phonologyOptions.handConfigurationOptions.find(o => o.value === configuration);
  return option ? option.label : '';
};

const getConfigurationChangesLabel = (configurationChanges: string) => {
  const option = phonologyOptions.configurationChangeOptions.find(o => o.value === configurationChanges);
  return option ? option.label : '';
};

const getRelationBetweenArticulatorsLabel = (relationBetweenArticulators: string) => {
  const option = phonologyOptions.relationBetweenArticulatorsOptions.find(o => o.value === relationBetweenArticulators);
  return option ? option.label : '';
};

const getLocationLabel = (location: string) => {
  const option = phonologyOptions.locationOptions.find(o => o.value === location);
  return option ? option.label : '';
};

const getMovementRelatedOrientationLabel = (movementRelatedOrientation: string) => {
  const option = phonologyOptions.movementRelatedOrientationOptions.find(o => o.value === movementRelatedOrientation);
  return option ? option.label : '';
};

const getOrientationRelatedToLocationLabel = (orientationRelatedToLocation: string) => {
  const option = phonologyOptions.orientationRelatedToLocationOptions.find(o => o.value === orientationRelatedToLocation);
  return option ? option.label : '';
};

const getOrientationChangeLabel = (orientationChange: string) => {
  const option = phonologyOptions.orientationChangeOptions.find(o => o.value === orientationChange);
  return option ? option.label : '';
};

const getContactTypeLabel = (contactType: string) => {
  const option = phonologyOptions.contactTypeOptions.find(o => o.value === contactType);
  return option ? option.label : '';
};

const getMovementTypeLabel = (movementType: string) => {
  const option = phonologyOptions.movementTypeOptions.find(o => o.value === movementType);
  return option ? option.label : '';
};

const getMovementDirectionLabel = (movementDirection: string) => {
  const option = phonologyOptions.movementDirectionOptions.find(o => o.value === movementDirection);
  return option ? option.label : '';
};

const updateBooleanField = (field: keyof FilterInputs, value: boolean) => {
  localData.value = {
    ...localData.value,
    [field]: value
  };
  emit('update:phonologyData', localData.value);
};
</script>

<style scoped>
.phonology-filters {
  width: 100%;
  max-height: 100%;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}
</style> 