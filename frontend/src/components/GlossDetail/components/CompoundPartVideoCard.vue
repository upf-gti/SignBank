<template>
  <q-card
    flat
    bordered
    class="compound-part-video"
  >
    <q-card-section class="q-pb-sm">
      <div class="row items-center q-gutter-xs">
        <q-avatar
          color="primary"
          text-color="white"
          size="28px"
        >
          {{ entry.position }}
        </q-avatar>
        <span class="text-subtitle2 text-weight-medium">{{ entry.label }}</span>
      </div>
    </q-card-section>

    <q-card-section
      v-if="entry.signVideo"
      class="q-pt-none"
    >
      <GlossVideoComponent
        :sign-video="entry.signVideo"
        :edit-mode="false"
        compact
      />
    </q-card-section>

    <q-card-section
      v-else
      class="q-pt-none"
    >
      <div class="compound-part-video__empty text-body2 text-grey-7">
        {{
          entry.isInlineMorpheme
            ? translate('inlineMorphemeNoVideo')
            : translate('noComponentVideo')
        }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { CompoundPartVideoEntry } from 'src/utils/compoundPhonology';
import GlossVideoComponent from './GlossVideoComponent.vue';
import translate from 'src/utils/translate';

defineProps<{
  entry: CompoundPartVideoEntry;
}>();
</script>

<style scoped>
.compound-part-video {
  border-radius: var(--sb-card-radius, 12px);
  overflow: hidden;
  height: 100%;
}

.compound-part-video__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 12px;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8px;
}
</style>
