<template>
  <div class="fullscreen flex flex-center q-pa-md not-found-page">
    <div class="text-center">
      <q-icon
        name="search_off"
        size="80px"
        color="grey-5"
        class="q-mb-md"
      />
      <div class="text-h2 text-weight-bold text-primary q-mb-sm">
        404
      </div>
      <div class="text-h6 text-grey-7 q-mb-xs">
        {{ translate('pageNotFound') }}
      </div>
      <p class="text-body2 text-grey-6 q-mb-lg">
        {{ translate('pageNotFoundDescription') }}
      </p>
      <q-btn
        color="primary"
        unelevated
        icon="home"
        to="/"
        :label="translate('goHome')"
        no-caps
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
</script>

<style scoped>
.not-found-page {
  background: var(--sb-bg);
}
</style>
