<template>
  <q-card-section class="row justify-between items-center">
    <q-card
      class="col-12 col-md-8"
      flat
    >
      <q-card-section class="row justify-start items-center">
        <q-chip
          outline
          color="primary"
        >
          {{ translate(selectedSense?.lexicalCategory) }}
        </q-chip>
        <span class="text-h6">
          {{ selectedSense?.senseTitle }}
        </span>
      </q-card-section>
      <q-card-section class="column">
        <GlossVideoComponent
          v-if="selectedSense?.signVideos?.[0]"
          :sign-video="selectedSense.signVideos[0]"
          :edit-mode="false"
        />
      </q-card-section>
    </q-card>
    <q-card
      class="col-12 col-md-4 full-height"
      flat
    >
      <div class="full-height">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            Quick Info
          </div>
          
          <div class="q-mb-md">
            <div class="text-weight-bold">
              Category: Animal
            </div>
          </div>

          <div class="q-mb-md">
            <div class="text-weight-bold">
              Related Glosses:
            </div>
            <div class="q-gutter-sm">
              <div
                v-for="gloss in ['gat', 'gos']"
                :key="gloss"
                class="row justify-between items-center q-pl-md"
              >
                <div class="q-gutter-sm">
                  {{ gloss }}
                </div>
                <q-btn
                  unelevated
                  :label="translate('view')"
                />
              </div>
            </div>
          </div>

          <div class="q-mb-md">
            <div class="text-weight-bold">
              Minimal Pairs:
            </div>
            <div class="q-gutter-sm">
              <div
                v-for="pair in ['parell1', 'parell2']"
                :key="pair"
                class="row justify-between items-center q-pl-md"
              >
                <div class="q-gutter-sm">
                  {{ pair }}
                </div>
                <q-btn
                  unelevated
                  :label="translate('view')"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </div>
    </q-card>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense } from 'src/types/models'
import GlossVideoComponent from './GlossVideoComponent.vue'
import translate from 'src/utils/translate';
import { useRouter } from 'vue-router'

const router = useRouter()

const { selectedSense } = defineProps<{
  selectedSense: Sense
}>()

const navigateToGloss = (gloss: string) => {
  router.push(`/gloss/${gloss}`)
}
</script>

<style scoped>
.full-height {
  height: 100%;
}
</style>
