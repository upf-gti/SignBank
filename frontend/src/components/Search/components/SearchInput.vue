<template>
  <div class="row q-col-gutter-sm items-center">
    <div class="col">
      <q-input
        :model-value="modelValue"
        outlined
        dense
        clearable
        :placeholder="t('enterAWord')"
        :aria-label="t('search')"
        @update:model-value="(val) => $emit('update:model-value', String(val || ''))"
        @keyup.enter="$emit('search')"
      >
        <template #prepend>
          <q-icon
            name="search"
            color="grey-6"
          />
        </template>
      </q-input>
    </div>
    <div class="col-auto gt-xs">
      <q-btn
        color="primary"
        unelevated
        :label="t('search')"
        @click="$emit('search')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';

const t = (key: string) => translate(key);

defineProps<{
  modelValue: string;
}>();

defineEmits<{
  (e: 'update:model-value', value: string): void;
  (e: 'search'): void;
}>();
</script>
