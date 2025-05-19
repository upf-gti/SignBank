<template>
  <div
    v-if="loading"
    class="q-pa-xl row col fit justify-center items-center"
  >
    <q-spinner
      size="3em"
      color="primary"
    />
    <span class="q-ml-sm">{{ translate('common.loading') }}</span>
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
const { loading } = defineProps<{
  loading: boolean;
}>();
</script>