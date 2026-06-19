<template>
  <div class="phonology-table">
    <div class="phonology-table__handedness q-mb-md">
      <div class="text-caption text-grey-7 q-mb-xs">
        {{ translate('handedness') }}
      </div>
      <div
        v-if="!isEditable"
        class="text-body2"
      >
        <span v-if="localData.handedness">
          {{ getHandednessLabel(localData.handedness) }}
          <q-tooltip v-if="getHandednessDescription(localData.handedness)">
            {{ getHandednessDescription(localData.handedness) }}
          </q-tooltip>
        </span>
        <span v-else>{{ translate('notSet') }}</span>
      </div>
      <q-btn-toggle
        v-else
        v-model="localData.handedness"
        :options="phonologyOptions.handednessOptions"
        spread
        no-caps
        unelevated
        toggle-color="primary"
        color="grey-3"
        text-color="grey-8"
        class="full-width"
        @update:model-value="emitUpdate"
      />
    </div>

    <div class="phonology-table__scroll">
      <q-markup-table
        flat
        bordered
        dense
        wrap-cells
        class="phonology-table__grid"
      >
        <colgroup>
          <col class="phonology-table__col-label">
          <col
            v-if="multiHand"
            class="phonology-table__col-hand"
          >
          <col
            v-if="multiHand"
            class="phonology-table__col-hand"
          >
          <col
            v-if="!multiHand"
            class="phonology-table__col-value"
          >
        </colgroup>
        <thead>
          <tr>
            <th class="text-left phonology-table__label-header" />
            <th class="text-center phonology-table__hand-header">
              {{ translate('mainHand') }}
            </th>
            <th
              v-if="multiHand"
              class="text-center phonology-table__hand-header"
            >
              {{ translate('nonDominantHand') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Per-hand: configuration -->
          <PhonologyTableRow
            :label="translate('configuration')"
            :dominant-value="localData.dominantConfiguration ?? null"
            :non-dominant-value="localData.nonDominantConfiguration ?? null"
            :multi-hand="multiHand"
            :is-editable="!!isEditable"
            :options="filteredOptions.configuration"
            @update:dominant="updateField('dominantConfiguration', $event)"
            @update:non-dominant="updateField('nonDominantConfiguration', $event)"
            @update:both="updateBoth('dominantConfiguration', 'nonDominantConfiguration', $event)"
            @filter="(val, update) => filterFn(val, update, phonologyOptions.handConfigurationOptions, 'configuration')"
          />

          <!-- Per-hand: relation between articulators -->
          <PhonologyTableRow
            v-if="!compact || !isEditable"
            :label="translate('relationBetweenArticulators')"
            :dominant-value="localData.dominantRelationBetweenArticulators ?? null"
            :non-dominant-value="localData.nonDominantRelationBetweenArticulators ?? null"
            :multi-hand="multiHand"
            :is-editable="!!isEditable"
            :options="filteredOptions.relationBetweenArticulators"
            @update:dominant="updateField('dominantRelationBetweenArticulators', $event)"
            @update:non-dominant="updateField('nonDominantRelationBetweenArticulators', $event)"
            @update:both="updateBoth('dominantRelationBetweenArticulators', 'nonDominantRelationBetweenArticulators', $event)"
            @filter="(val, update) => filterFn(val, update, phonologyOptions.relationBetweenArticulatorsOptions, 'relationBetweenArticulators')"
          />

          <!-- Shared rows -->
          <template
            v-for="row in visibleSharedRows"
            :key="row.field"
          >
            <PhonologyTableRow
              v-if="multiHand && isEditable"
              :label="row.label"
              :row-type="row.type"
              shared-across-hands
              :dominant-value="row.type === 'select' ? asStringValue(localData[row.field]) : null"
              :non-dominant-value="row.type === 'select' ? asStringValue(localData[row.field]) : null"
              :value="row.type !== 'select' ? localData[row.field] : undefined"
              :multi-hand="multiHand"
              :is-editable="true"
              :options="row.optionsKey ? filteredOptions[row.optionsKey] : []"
              @update:both="updateSharedRow(row.field, $event)"
              @update:dominant="updateSharedRow(row.field, $event)"
              @update:non-dominant="updateSharedRow(row.field, $event)"
              @filter="(val, update) => row.optionsKey && row.allOptions && filterFn(val, update, row.allOptions, row.optionsKey)"
            />
            <PhonologyTableSharedRow
              v-else
              :label="row.label"
              :value="localData[row.field]"
              :multi-hand="multiHand"
              :is-editable="!!isEditable"
              :row-type="row.type"
              :options="row.optionsKey ? filteredOptions[row.optionsKey] : []"
              @update="updateSharedRow(row.field, $event)"
              @filter="(val, update) => row.optionsKey && row.allOptions && filterFn(val, update, row.allOptions, row.optionsKey)"
            />
          </template>
        </tbody>
      </q-markup-table>
    </div>

    <!-- Compact mode: advanced fields in expansion -->
    <q-expansion-item
      v-if="compact && isEditable"
      expand-separator
      icon="tune"
      :label="translate('advancedPhonology')"
      header-class="text-subtitle2 q-mt-md"
    >
      <div class="q-pt-sm">
        <PhonologyTableRow
          :label="translate('relationBetweenArticulators')"
          :dominant-value="localData.dominantRelationBetweenArticulators ?? null"
          :non-dominant-value="localData.nonDominantRelationBetweenArticulators ?? null"
          :multi-hand="multiHand"
          :is-editable="true"
          :options="filteredOptions.relationBetweenArticulators"
          @update:dominant="updateField('dominantRelationBetweenArticulators', $event)"
          @update:non-dominant="updateField('nonDominantRelationBetweenArticulators', $event)"
          @update:both="updateBoth('dominantRelationBetweenArticulators', 'nonDominantRelationBetweenArticulators', $event)"
          @filter="(val, update) => filterFn(val, update, phonologyOptions.relationBetweenArticulatorsOptions, 'relationBetweenArticulators')"
        />
        <PhonologyTableRow
          v-for="row in advancedSharedRows"
          :key="row.field"
          :label="row.label"
          :row-type="row.type"
          shared-across-hands
          :dominant-value="row.type === 'select' ? asStringValue(localData[row.field]) : null"
          :non-dominant-value="row.type === 'select' ? asStringValue(localData[row.field]) : null"
          :value="row.type !== 'select' ? localData[row.field] : undefined"
          :multi-hand="multiHand"
          :is-editable="true"
          :options="row.optionsKey ? filteredOptions[row.optionsKey] : []"
          @update:both="updateSharedRow(row.field, $event)"
          @update:dominant="updateSharedRow(row.field, $event)"
          @update:non-dominant="updateSharedRow(row.field, $event)"
          @filter="(val, update) => row.optionsKey && row.allOptions && filterFn(val, update, row.allOptions, row.optionsKey)"
        />
      </div>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import translate from 'src/utils/translate';
import { usePhonologyOptions, getOptionLabel } from 'src/utils/phonologyOptions';
import { isMultiHand } from 'src/utils/phonologyHelpers';
import type { PhonologyData } from 'src/types/models';
import PhonologyTableRow from './PhonologyTableRow.vue';
import PhonologyTableSharedRow from './PhonologyTableSharedRow.vue';

const props = defineProps<{
  phonologyData: PhonologyData;
  isEditable?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:phonologyData', value: PhonologyData): void;
}>();

const phonologyOptions = usePhonologyOptions();
const localData = ref<PhonologyData>({ ...props.phonologyData });

const multiHand = computed(() => isMultiHand(localData.value.handedness));

type SharedRowDef = {
  field: keyof PhonologyData;
  label: string;
  type: 'select' | 'text' | 'boolean';
  optionsKey?: keyof typeof filteredOptions.value;
  allOptions?: { value: string; label: string }[];
  compactOnly?: boolean;
  advanced?: boolean;
};

const sharedRowDefs: SharedRowDef[] = [
  { field: 'configurationChanges', label: translate('configurationChanges'), type: 'select', optionsKey: 'configurationChanges', allOptions: phonologyOptions.configurationChangeOptions, advanced: true },
  { field: 'location', label: translate('location'), type: 'select', optionsKey: 'location', allOptions: phonologyOptions.locationOptions },
  { field: 'movementRelatedOrientation', label: translate('movementRelatedOrientation'), type: 'select', optionsKey: 'movementRelatedOrientation', allOptions: phonologyOptions.movementRelatedOrientationOptions, advanced: true },
  { field: 'orientationRelatedToLocation', label: translate('orientationRelatedToLocation'), type: 'select', optionsKey: 'orientationRelatedToLocation', allOptions: phonologyOptions.orientationRelatedToLocationOptions, advanced: true },
  { field: 'orientationChange', label: translate('orientationChange'), type: 'select', optionsKey: 'orientationChange', allOptions: phonologyOptions.orientationChangeOptions, advanced: true },
  { field: 'contactType', label: translate('contactType'), type: 'select', optionsKey: 'contactType', allOptions: phonologyOptions.contactTypeOptions, advanced: true },
  { field: 'movementType', label: translate('movementType'), type: 'select', optionsKey: 'movementType', allOptions: phonologyOptions.movementTypeOptions },
  { field: 'movementDirection', label: translate('movementDirection'), type: 'select', optionsKey: 'movementDirection', allOptions: phonologyOptions.movementDirectionOptions, advanced: true },
  { field: 'vocalization', label: translate('vocalization'), type: 'text', advanced: true },
  { field: 'nonManualComponent', label: translate('nonManualComponent'), type: 'text', advanced: true },
  { field: 'inicialization', label: translate('inicialization'), type: 'text', advanced: true },
  { field: 'repeatedMovement', label: translate('repeatedMovement'), type: 'boolean', advanced: true },
];

const visibleSharedRows = computed(() => {
  if (props.compact && props.isEditable) {
    return sharedRowDefs.filter(r => !r.advanced && r.field !== 'configurationChanges');
  }
  return sharedRowDefs.filter(r => !r.advanced || !props.compact);
});

const advancedSharedRows = computed(() =>
  sharedRowDefs.filter(r => r.advanced),
);

const filteredOptions = ref({
  configuration: phonologyOptions.handConfigurationOptions,
  relationBetweenArticulators: phonologyOptions.relationBetweenArticulatorsOptions,
  configurationChanges: phonologyOptions.configurationChangeOptions,
  location: phonologyOptions.locationOptions,
  movementRelatedOrientation: phonologyOptions.movementRelatedOrientationOptions,
  orientationRelatedToLocation: phonologyOptions.orientationRelatedToLocationOptions,
  orientationChange: phonologyOptions.orientationChangeOptions,
  contactType: phonologyOptions.contactTypeOptions,
  movementType: phonologyOptions.movementTypeOptions,
  movementDirection: phonologyOptions.movementDirectionOptions,
});

watch(() => props.phonologyData, (newValue) => {
  localData.value = { ...newValue };
}, { deep: true });

function filterFn(
  val: string,
  update: (callback: () => void) => void,
  options: { value: string; label: string }[],
  key: keyof typeof filteredOptions.value,
) {
  if (val === '') {
    update(() => {
      filteredOptions.value[key] = options;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredOptions.value[key] = options.filter(opt =>
      opt.label.toLowerCase().includes(needle) || opt.value.toLowerCase().includes(needle),
    );
  });
}

function getHandednessLabel(handedness: string) {
  return getOptionLabel(phonologyOptions.handednessOptions, handedness);
}

function getHandednessDescription(handedness: string) {
  const option = phonologyOptions.handednessOptions.find(o => o.value === handedness);
  return option?.description ?? '';
}

function updateField(field: keyof PhonologyData, value: string | boolean | null) {
  localData.value = {
    ...localData.value,
    [field]: value === null || value === '' ? null : value,
  };
  emitUpdate();
}

function updateBoth(
  dominantField: keyof PhonologyData,
  nonDominantField: keyof PhonologyData,
  value: string | null,
) {
  localData.value = {
    ...localData.value,
    [dominantField]: value,
    [nonDominantField]: value,
  };
  emitUpdate();
}

function updateSharedRow(field: keyof PhonologyData, value: string | boolean | null) {
  updateField(field, value);
}

function asStringValue(value: unknown): string | null {
  if (value == null || value === '') return null;
  return String(value);
}

function emitUpdate() {
  emit('update:phonologyData', { ...localData.value });
}
</script>

<style scoped>
.phonology-table {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 auto;
}

.phonology-table__handedness {
  flex: 0 0 auto;
}

.phonology-table__scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.phonology-table__scroll :deep(.q-markup-table) {
  overflow: visible;
}

.phonology-table__grid {
  width: 100%;
  table-layout: fixed;
}

.phonology-table__grid :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
  font-weight: 600;
  font-size: 0.8rem;
  padding-top: 10px;
  padding-bottom: 10px;
}

.phonology-table__grid :deep(.phonology-table__col-label) {
  width: 34%;
}

.phonology-table__grid :deep(.phonology-table__col-hand) {
  width: 33%;
}

.phonology-table__grid :deep(.phonology-table__col-value) {
  width: 66%;
}

@media (max-width: 1023px) {
  .phonology-table__grid :deep(td),
  .phonology-table__grid :deep(th) {
    white-space: normal;
    word-break: break-word;
    vertical-align: top;
  }

  .phonology-table__grid :deep(.text-body2) {
    font-size: 0.9rem;
    line-height: 1.35;
  }
}
</style>
