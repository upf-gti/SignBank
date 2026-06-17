<template>
  <div
    v-if="loading"
    class="loading-container column justify-center items-center"
  >
    <q-spinner
      size="3em"
      color="primary"
    />
    <span class="q-mt-md text-grey-7">{{ translate('loading') }}</span>
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';

defineProps<{
  loading: boolean;
}>();
</script>

<style scoped>
.loading-container {
  min-height: 300px;
  width: 100%;
}
</style>
