<template>
  <div class="empty-state column items-center justify-center text-center q-pa-xl">
    <q-icon
      :name="icon"
      size="64px"
      color="grey-5"
      class="q-mb-md"
    />
    <p class="text-h6 text-grey-7 q-mb-xs">
      {{ title }}
    </p>
    <p
      v-if="subtitle"
      class="text-body2 text-grey-6 q-mb-md"
      style="max-width: 360px;"
    >
      {{ subtitle }}
    </p>
    <q-btn
      v-if="actionLabel"
      color="primary"
      :icon="actionIcon"
      :label="actionLabel"
      unelevated
      @click="$emit('action')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: string;
}>();

defineEmits<{
  (e: 'action'): void;
}>();
</script>

<style scoped>
.empty-state {
  min-height: 200px;
}
</style>
