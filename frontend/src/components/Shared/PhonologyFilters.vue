<template>
  <div class="phonology-filters q-pa-md">
    <div class="column q-col-gutter-md">
      <div class="col">
        <q-item-label caption>
          {{ translate('hands') }}
        </q-item-label>
        <q-btn-toggle
          v-model="localData.hands"
          :options="[
            { label: translate('right'), value: 'RIGHT' },
            { label: translate('left'), value: 'LEFT' },
            { label: translate('both'), value: 'BOTH' }
          ]"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-3"
          text-color="grey-8"
          class="full-width"
          @update:model-value="updateField('hands', $event)"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
          <template v-slot:option="{ opt }">
            <q-item v-close-popup>
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
                <q-item-label caption v-if="opt.description">{{ opt.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
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
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="localData.vocalization"
          :label="translate('vocalization')"
          clearable
          outlined
          dense
          @update:model-value="updateField('vocalization', $event)"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="localData.nonManualComponent"
          :label="translate('nonManualComponent')"
          clearable
          outlined
          dense
          @update:model-value="updateField('nonManualComponent', $event)"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="localData.inicialization"
          :label="translate('inicialization')"
          clearable
          outlined
          dense
          @update:model-value="updateField('inicialization', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import translate from 'src/utils/translate';
import { usePhonologyOptions } from '../../utils/phonologyOptions';
import type { PhonologyData } from 'src/types/models';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

const props = defineProps<{
  phonologyData: PhonologyData;
  isEditable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:phonologyData', value: PhonologyData): void;
}>();

const phonologyOptions = usePhonologyOptions();
const localData = ref<PhonologyData>({ ...props.phonologyData });

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

const updateField = (field: keyof PhonologyData, value: string | string[] | number | null) => {
  localData.value = {
    ...localData.value,
    [field]: value !== null ? String(value) : ''
  };
  emit('update:phonologyData', localData.value);
};
</script>

<style scoped>
.phonology-filters {
  width: 100%;
  max-height: 100%;
  overflow-y: auto;
}
</style> 