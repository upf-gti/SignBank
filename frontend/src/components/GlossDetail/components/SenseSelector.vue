<template>
  <q-card-section>
    <q-btn-toggle
      v-model="selectedSenseId"
      :options="senses.map((sense) => ({
        label: sense.senseTitle,
        value: sense.id,
      }))"
    />
  </q-card-section>
</template>
<script setup lang="ts">
import { Sense } from 'src/types/models'

const selectedSenseId = defineModel<string>()

const { senses } = defineProps<{
  senses: Sense[]
}>()


</script>
