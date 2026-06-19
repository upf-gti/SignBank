<template>
  <tr>
    <td class="text-caption text-grey-8 phonology-table-shared-row__label">
      {{ label }}
    </td>
    <td
      :colspan="multiHand ? 2 : 1"
      class="phonology-table-shared-row__value phonology-table-shared-row__value--centered"
    >
      <template v-if="!isEditable">
        <span
          v-if="displayValue"
          class="text-body2"
        >{{ displayValue }}</span>
        <span
          v-else
          class="text-grey-5"
        >{{ translate('notSet') }}</span>
      </template>
      <template v-else>
        <q-select
          v-if="rowType === 'select'"
          :model-value="stringValue"
          :options="options"
          clearable
          emit-value
          map-options
          options-dense
          dense
          outlined
          use-input
          input-debounce="300"
          class="phonology-table-shared-row__control"
          @filter="onFilter"
          @update:model-value="emit('update', $event)"
        />
        <q-input
          v-else-if="rowType === 'text'"
          :model-value="stringValue"
          clearable
          dense
          outlined
          class="phonology-table-shared-row__control"
          @update:model-value="emit('update', $event != null ? String($event) : '')"
        />
        <q-btn-toggle
          v-else
          :model-value="boolValue"
          :options="[
            { label: translate('yes'), value: true },
            { label: translate('no'), value: false },
          ]"
          spread
          no-caps
          unelevated
          toggle-color="primary"
          color="grey-3"
          text-color="grey-8"
          class="phonology-table-shared-row__control"
          @update:model-value="emit('update', $event)"
        />
      </template>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import translate from 'src/utils/translate';
import { getOptionLabel, type PhonologySelectOption } from 'src/utils/phonologyOptions';

const props = defineProps<{
  label: string;
  value: unknown;
  multiHand: boolean;
  isEditable?: boolean;
  rowType: 'select' | 'text' | 'boolean';
  options?: PhonologySelectOption[];
}>();

const emit = defineEmits<{
  (e: 'update', value: string | boolean | null): void;
  (e: 'filter', val: string, update: (callback: () => void) => void): void;
}>();

const stringValue = computed(() => (props.value == null ? '' : String(props.value)));
const boolValue = computed(() => Boolean(props.value));

const displayValue = computed(() => {
  if (props.rowType === 'boolean') {
    return props.value ? translate('yes') : translate('no');
  }
  if (props.rowType === 'select' && props.options) {
    return getOptionLabel(props.options, stringValue.value);
  }
  return stringValue.value;
});

function onFilter(val: string, update: (callback: () => void) => void) {
  emit('filter', val, update);
}
</script>

<style scoped>
.phonology-table-shared-row__label {
  vertical-align: top;
}

.phonology-table-shared-row__value {
  vertical-align: top;
}

.phonology-table-shared-row__value--centered {
  text-align: center;
}

.phonology-table-shared-row__control {
  max-width: 360px;
  margin: 0 auto;
}
</style>
