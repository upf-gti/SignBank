<template>
  <q-dialog
    :model-value="modelValue"
    maximized
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="column">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ translate('compoundPhonology') }}
        </div>
        <q-space />
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
        />
      </q-card-section>

      <q-card-section class="text-body2 text-grey-8 q-pt-sm">
        {{ chainLabel }}
      </q-card-section>

      <q-card-section
        v-if="depthWarning"
        class="q-pt-none"
      >
        <q-banner
          dense
          rounded
          class="bg-warning text-dark"
        >
          {{ depthWarning }}
        </q-banner>
      </q-card-section>

      <q-card-section
        v-if="!phonologyColumns.length"
        class="col"
      >
        <div class="text-grey-7">
          {{ translate('noCompoundPhonology') }}
        </div>
      </q-card-section>

      <q-card-section
        v-else
        class="col q-pt-none"
      >
        <CompoundPhonologyTable :columns="phonologyColumns" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GlossData } from 'src/types/models';
import translate from 'src/utils/translate';
import {
  buildCompoundChainLabel,
  flattenCompoundPhonologyColumns,
} from 'src/utils/compoundPhonology';
import CompoundPhonologyTable from './CompoundPhonologyTable.vue';

const props = defineProps<{
  modelValue: boolean;
  glossData: GlossData;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const phonologyResult = computed(() => {
  const warnings: string[] = [];
  const columns = flattenCompoundPhonologyColumns(props.glossData, 0, warnings);
  return { columns, warnings };
});

const phonologyColumns = computed(() => phonologyResult.value.columns);

const chainLabel = computed(() => buildCompoundChainLabel(props.glossData));

const depthWarning = computed(() =>
  phonologyResult.value.warnings.length ? phonologyResult.value.warnings.join(' ') : null,
);
</script>
