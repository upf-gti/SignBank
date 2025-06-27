<template>
  <div class="row q-col-gutter-sm">
    <div class="col">
      <q-input
        :model-value="modelValue"
        outlined
        dense
        clearable
        :placeholder="t('search')"
        @update:model-value="(val) => $emit('update:model-value', String(val || ''))"
        @keyup.enter="$emit('search')"
      >
        <template #append>
          <q-icon
            name="search"
            class="cursor-pointer"
            @click="$emit('search')"
          />
        </template>
      </q-input>
    </div>
    <div class="col-auto">
      <q-btn
        color="primary"
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