<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md">
      {{ translate('definitions') }}
    </div>
    <q-list class="column">
      <q-item
        v-for="example in sense.examples"
        :key="example.id"
        class="column q-mb-lg"
      >
        <q-item-section class="row justify-between no-wrap items-start">
          <q-item-label class="q-pb-md text-h6 text-weight-bold">
            {{ example.example }}
          </q-item-label>
        </q-item-section>
        <q-item-section>
          <q-list separator>
            <q-item
              v-for="translation in example.exampleTranslations"
              :key="translation.id"
            >
              <q-item-section>
                <q-item-label>
                  {{ translation.language }}
                </q-item-label>
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ translation.translation }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-item-section>
        <q-item-section>
          <q-btn
            outline
            :label="translate('seeExampleVideo')"
            icon="play_arrow"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense } from 'src/types/models';
import translate from 'src/utils/translate';
const { sense } = defineProps<{
  sense: Sense;
}>();
</script>

