<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md">
      {{ translate('definitions') }}
    </div>
    <q-list>
      <q-item
        v-for="definition in sense.definitions"
        :key="definition.id"
        class="column q-mb-lg"
      >
        <!-- List of definitions -->
        <q-item-label>
          {{ definition.title }}
        </q-item-label>
        <q-item-label>
          {{ definition.definition }}
          <!-- Definition translations -->
          <q-item
            v-for="translation in definition.definitionTranslations"
            :key="translation.id"
            class="column"
          >
            <div>
              <q-chip size="sm">
                {{ translation.language }}
              </q-chip>
            </div>
            <q-item-label class="q-ml-lg">
              {{ translation.translation }}
            </q-item-label>
          </q-item>
        </q-item-label>
      </q-item>
    </q-list>
    <!-- Translations of the sense -->
    <div class="column">
      <div class="text-h5 q-mt-md">
        {{ translate('translations') }}
      </div>
      <q-list class="row">
        <q-item
          v-for="translation in sense.senseTranslations"
          :key="translation.id"
          class="col"
          style="min-width: 300px"
        >
          <q-card
            bordered
            flat
            class="col-12 q-pa-md"
          >
            <div>
              {{ translation.language }}
            </div>
            <q-item-label class="text-h6">
              {{ translation.translation }}
            </q-item-label>
          </q-card>
        </q-item>
      </q-list>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense } from 'src/types/models';
import translate from 'src/utils/translate';
const { sense } = defineProps<{
  sense: Sense;
}>();
</script>

<style scoped>
.q-item {
  min-height: 40px;
}
</style>
