<template>
  <div class="compound-phonology-table">
    <div class="compound-phonology-table__scroll">
      <q-markup-table
        flat
        bordered
        dense
        wrap-cells
        class="compound-phonology-table__grid"
      >
        <thead>
          <tr>
            <th class="text-left compound-phonology-table__label-header" />
            <th
              v-for="(group, groupIndex) in columnGroups"
              :key="group.key"
              :colspan="group.slots.length"
              class="text-center compound-phonology-table__component-header"
              :class="{ 'compound-phonology-table__group-separator': groupIndex > 0 }"
            >
              {{ group.label }}
            </th>
          </tr>
          <tr>
            <th class="text-left compound-phonology-table__label-header" />
            <th
              v-for="slot in flatSlots"
              :key="slot.key"
              class="text-center compound-phonology-table__hand-header"
              :class="{ 'compound-phonology-table__group-separator': slot.separatorBefore }"
            >
              {{ slot.handLabel }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-weight-medium">
              {{ translate('handedness') }}
            </td>
            <td
              v-for="slot in flatSlots"
              :key="`handedness-${slot.key}`"
              class="text-center"
              :class="{ 'compound-phonology-table__group-separator': slot.separatorBefore }"
            >
              {{ formatHandedness(slot.phonology.handedness) }}
            </td>
          </tr>
          <tr
            v-for="row in phonologyRows"
            :key="row.id"
          >
            <td class="text-weight-medium">
              {{ row.label }}
            </td>
            <td
              v-for="slot in flatSlots"
              :key="`${row.id}-${slot.key}`"
              class="text-center"
              :class="{ 'compound-phonology-table__group-separator': slot.separatorBefore }"
            >
              {{ row.getValue(slot) }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import translate from 'src/utils/translate';
import { usePhonologyOptions, getOptionLabel } from 'src/utils/phonologyOptions';
import { isMultiHand } from 'src/utils/phonologyHelpers';
import type { CompoundPhonologyColumn } from 'src/utils/compoundPhonology';
import type { PhonologyData } from 'src/types/models';

const props = defineProps<{
  columns: CompoundPhonologyColumn[];
}>();

const phonologyOptions = usePhonologyOptions();

interface HandSlot {
  key: string;
  groupKey: string;
  handLabel: string;
  phonology: PhonologyData;
  hand: 'dominant' | 'nonDominant' | 'single';
  separatorBefore: boolean;
}

interface ColumnGroup {
  key: string;
  label: string;
  slots: HandSlot[];
}

const columnGroups = computed<ColumnGroup[]>(() =>
  props.columns.map((column, columnIndex) => {
    const multi = isMultiHand(column.phonology.handedness);
    const slots: HandSlot[] = multi
      ? [
          {
            key: `${column.key}-main`,
            groupKey: column.key,
            handLabel: translate('mainHand'),
            phonology: column.phonology,
            hand: 'dominant',
            separatorBefore: columnIndex > 0,
          },
          {
            key: `${column.key}-non`,
            groupKey: column.key,
            handLabel: translate('nonDominantHand'),
            phonology: column.phonology,
            hand: 'nonDominant',
            separatorBefore: false,
          },
        ]
      : [{
          key: `${column.key}-single`,
          groupKey: column.key,
          handLabel: translate('mainHand'),
          phonology: column.phonology,
          hand: 'single',
          separatorBefore: columnIndex > 0,
        }];

    return {
      key: column.key,
      label: column.label,
      slots,
    };
  }),
);

const flatSlots = computed(() => columnGroups.value.flatMap((g) => g.slots));

type RowGetter = (slot: HandSlot) => string;

const phonologyRows = computed<{ id: string; label: string; getValue: RowGetter }[]>(() => [
  {
    id: 'configuration',
    label: translate('configuration'),
    getValue: (slot) => formatPerHandEnum(
      slot,
      'dominantConfiguration',
      'nonDominantConfiguration',
      phonologyOptions.handConfigurationOptions,
    ),
  },
  {
    id: 'relation',
    label: translate('relationBetweenArticulators'),
    getValue: (slot) => formatPerHandEnum(
      slot,
      'dominantRelationBetweenArticulators',
      'nonDominantRelationBetweenArticulators',
      phonologyOptions.relationBetweenArticulatorsOptions,
    ),
  },
  {
    id: 'location',
    label: translate('location'),
    getValue: (slot) => formatSharedEnum(slot.phonology.location, phonologyOptions.locationOptions),
  },
  {
    id: 'configurationChanges',
    label: translate('configurationChanges'),
    getValue: (slot) => formatSharedEnum(slot.phonology.configurationChanges, phonologyOptions.configurationChangeOptions),
  },
  {
    id: 'movementRelatedOrientation',
    label: translate('movementRelatedOrientation'),
    getValue: (slot) => formatSharedEnum(slot.phonology.movementRelatedOrientation, phonologyOptions.movementRelatedOrientationOptions),
  },
  {
    id: 'orientationRelatedToLocation',
    label: translate('orientationRelatedToLocation'),
    getValue: (slot) => formatSharedEnum(slot.phonology.orientationRelatedToLocation, phonologyOptions.orientationRelatedToLocationOptions),
  },
  {
    id: 'orientationChange',
    label: translate('orientationChange'),
    getValue: (slot) => formatSharedEnum(slot.phonology.orientationChange, phonologyOptions.orientationChangeOptions),
  },
  {
    id: 'contactType',
    label: translate('contactType'),
    getValue: (slot) => formatSharedEnum(slot.phonology.contactType, phonologyOptions.contactTypeOptions),
  },
  {
    id: 'movementType',
    label: translate('movementType'),
    getValue: (slot) => formatSharedEnum(slot.phonology.movementType, phonologyOptions.movementTypeOptions),
  },
  {
    id: 'movementDirection',
    label: translate('movementDirection'),
    getValue: (slot) => formatSharedEnum(slot.phonology.movementDirection, phonologyOptions.movementDirectionOptions),
  },
]);

function formatHandedness(handedness: string | undefined) {
  if (!handedness) return translate('notSet');
  return getOptionLabel(phonologyOptions.handednessOptions, handedness);
}

function formatSharedEnum(
  value: string | null | undefined,
  options: { value: string; label: string }[],
) {
  if (!value) return translate('notSet');
  return getOptionLabel(options, value);
}

function formatPerHandEnum(
  slot: HandSlot,
  dominantField: keyof PhonologyData,
  nonDominantField: keyof PhonologyData,
  options: { value: string; label: string }[],
) {
  const value = slot.hand === 'nonDominant'
    ? slot.phonology[nonDominantField]
    : slot.phonology[dominantField];

  if (value == null || value === '') return translate('notSet');
  return getOptionLabel(options, String(value));
}
</script>

<style scoped>
.compound-phonology-table {
  width: 100%;
}

.compound-phonology-table__scroll {
  overflow-x: auto;
  overflow-y: auto;
  max-height: min(70vh, 640px);
  -webkit-overflow-scrolling: touch;
}

.compound-phonology-table__grid {
  min-width: 100%;
  table-layout: auto;
}

.compound-phonology-table__grid :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
  font-weight: 600;
  font-size: 0.8rem;
  white-space: nowrap;
}

.compound-phonology-table__component-header {
  border-bottom: none;
}

.compound-phonology-table__label-header {
  min-width: 140px;
}

.compound-phonology-table__hand-header {
  min-width: 100px;
}

.compound-phonology-table__group-separator {
  border-left: 3px solid rgba(0, 0, 0, 0.14);
}
</style>
