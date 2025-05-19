<template>
  <q-card-section class="row justify-between items-center">
    <div class="column">
      <div class="text-h6">
        {{ glossData.gloss }}
      </div>
      <div class="text-subtitle2">
        {{ translate('last_updated') }}: {{ glossData.updatedAt }}
      </div>
    </div>
    <div class="row">
      <q-btn icon="edit" />
      <q-btn icon="more_vert" />
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { GlossData } from 'src/types/models'
import translate from 'src/utils/translate'

const { glossData } = defineProps<{
  glossData: GlossData
}>()
</script>