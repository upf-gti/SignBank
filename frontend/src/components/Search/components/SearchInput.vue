<template>
  <q-card-section>
    <div class="text-h6">
      {{ t('search') }}
    </div>
    <q-input
      :model-value="modelValue"
      :placeholder="t('searchPlaceholder')"
      outlined
      dense
      clearable
      class="q-pa-md"
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
  </q-card-section>
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