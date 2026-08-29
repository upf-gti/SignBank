<template>
  <tr>
    <td class="text-caption text-grey-8 phonology-table-row__label">
      {{ label }}
    </td>

    <!-- Read-only -->
    <template v-if="!isEditable">
      <template v-if="displayMode === 'merged'">
        <td
          colspan="2"
          class="text-body2 text-center phonology-table-row__hand-cell phonology-table-row__hand-cell--merged"
        >
          {{ mergedDisplayLabel }}
        </td>
      </template>
      <template v-else-if="displayMode === 'split'">
        <td class="text-body2 text-center phonology-table-row__hand-cell">
          {{ dominantDisplayLabel }}
        </td>
        <td class="text-body2 text-center phonology-table-row__hand-cell">
          {{ nonDominantDisplayLabel }}
        </td>
      </template>
      <template v-else>
        <td
          colspan="1"
          class="text-body2 text-center phonology-table-row__hand-cell"
        >
          {{ dominantDisplayLabel }}
        </td>
      </template>
    </template>

    <!-- Editable -->
    <template v-else>
      <template v-if="editLayout === 'merged'">
        <td
          colspan="2"
          class="phonology-table-row__hand-cell phonology-table-row__hand-cell--merged"
        >
          <component
            :is="editControl"
            merged
            @update="onMergedUpdate"
            @filter="onFilter"
          />
        </td>
      </template>
      <template v-else-if="editLayout === 'split'">
        <td class="phonology-table-row__hand-cell">
          <component
            :is="editControl"
            hand="dominant"
            @update="emit('update:dominant', $event)"
            @filter="onFilter"
          />
        </td>
        <td class="phonology-table-row__hand-cell">
          <component
            :is="editControl"
            hand="nonDominant"
            @update="emit('update:non-dominant', $event)"
            @filter="onFilter"
          />
        </td>
      </template>
      <template v-else>
        <td class="phonology-table-row__hand-cell">
          <component
            :is="editControl"
            hand="dominant"
            merged
            @update="emit('update:dominant', $event)"
            @filter="onFilter"
          />
        </td>
      </template>
    </template>
  </tr>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
import { QSelect, QInput, QBtnToggle } from 'quasar';
import translate from 'src/utils/translate';
import { getOptionLabel, type PhonologySelectOption } from 'src/utils/phonologyOptions';

const props = withDefaults(defineProps<{
  label: string;
  rowType?: 'select' | 'text' | 'boolean';
  dominantValue?: string | null | undefined;
  nonDominantValue?: string | null | undefined;
  value?: unknown;
  multiHand: boolean;
  isEditable?: boolean;
  sharedAcrossHands?: boolean;
  options?: PhonologySelectOption[];
}>(), {
  rowType: 'select',
  sharedAcrossHands: false,
  options: () => [],
});

const emit = defineEmits<{
  (e: 'update:dominant', value: string | null): void;
  (e: 'update:non-dominant', value: string | null): void;
  (e: 'update:both', value: string | boolean | null): void;
  (e: 'filter', val: string, update: (callback: () => void) => void): void;
}>();

const displayMode = computed(() => {
  if (!props.multiHand) return 'single';
  if (props.sharedAcrossHands) return 'merged';
  return 'split';
});

const editLayout = computed(() => {
  if (!props.isEditable) return displayMode.value;
  if (!props.multiHand) return 'single';
  if (props.sharedAcrossHands) return 'merged';
  return 'split';
});

const dominantLabel = computed(() => getOptionLabel(props.options, props.dominantValue));
const nonDominantLabel = computed(() => getOptionLabel(props.options, props.nonDominantValue));

const dominantDisplayLabel = computed(() => formatReadLabel('dominant'));
const nonDominantDisplayLabel = computed(() => formatReadLabel('nonDominant'));
const mergedDisplayLabel = computed(() => {
  if (props.rowType === 'select') {
    if (dominantLabel.value) return dominantLabel.value;
    if (nonDominantLabel.value) return nonDominantLabel.value;
    return translate('notSet');
  }
  return formatReadLabel('shared');
});

function formatReadLabel(hand: 'dominant' | 'nonDominant' | 'shared'): string {
  if (props.rowType === 'boolean') {
    return props.value ? translate('yes') : translate('no');
  }
  if (props.rowType === 'text') {
    const text = String(props.value ?? '').trim();
    return text || translate('notSet');
  }
  if (hand === 'nonDominant') {
    return nonDominantLabel.value || translate('notSet');
  }
  return dominantLabel.value || translate('notSet');
}

function onFilter(val: string, update: (callback: () => void) => void) {
  emit('filter', val, update);
}

function onMergedUpdate(value: string | boolean | null) {
  emit('update:both', value);
}

function getSelectValue(hand: 'dominant' | 'nonDominant', merged = false) {
  if (merged) {
    return props.dominantValue ?? props.nonDominantValue ?? null;
  }
  return hand === 'dominant' ? props.dominantValue : props.nonDominantValue;
}

const editControl = defineComponent({
  name: 'PhonologyTableRowEditControl',
  props: {
    hand: { type: String, default: 'dominant' },
    merged: { type: Boolean, default: false },
  },
  emits: ['update', 'filter'],
  setup(controlProps, { emit: controlEmit }) {
    return () => {
      if (props.rowType === 'text') {
        return h(QInput, {
          modelValue: String(props.value ?? ''),
          clearable: true,
          dense: true,
          outlined: true,
          class: controlProps.merged ? 'phonology-table-row__merged-select' : undefined,
          'onUpdate:modelValue': (val: string | number | null) =>
            controlEmit('update', val != null ? String(val) : ''),
        });
      }

      if (props.rowType === 'boolean') {
        return h(QBtnToggle, {
          modelValue: Boolean(props.value),
          spread: true,
          noCaps: true,
          unelevated: true,
          toggleColor: 'primary',
          color: 'grey-3',
          textColor: 'grey-8',
          class: controlProps.merged ? 'phonology-table-row__merged-select' : undefined,
          options: [
            { label: translate('yes'), value: true },
            { label: translate('no'), value: false },
          ],
          'onUpdate:modelValue': (val: boolean) => controlEmit('update', val),
        });
      }

      const handKey = controlProps.hand === 'nonDominant' ? 'nonDominant' : 'dominant';
      return h(QSelect, {
        modelValue: getSelectValue(handKey, controlProps.merged),
        options: props.options,
        clearable: true,
        emitValue: true,
        mapOptions: true,
        optionsDense: true,
        dense: true,
        outlined: true,
        useInput: true,
        inputDebounce: 300,
        class: controlProps.merged ? 'phonology-table-row__merged-select' : undefined,
        onFilter: (val: string, update: (callback: () => void) => void) =>
          controlEmit('filter', val, update),
        'onUpdate:modelValue': (val: string | null) => controlEmit('update', val),
      });
    };
  },
});
</script>

<style scoped>
.phonology-table-row__label {
  vertical-align: top;
}

.phonology-table-row__hand-cell {
  vertical-align: top;
  text-align: center;
}

.phonology-table-row__hand-cell--merged {
  text-align: center;
}

.phonology-table-row__merged-select {
  max-width: 280px;
  margin: 0 auto;
}

</style>
