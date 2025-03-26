<template>
  <div class="sign-info">
    <q-card class="info-card">
      <q-card-section>
        <div class="text-h6">{{ translate('word_detail.field.signInfo') }}</div>
        
        <div class="row q-col-gutter-md q-mt-sm">
          <!-- Display mode -->
          <template v-if="!isEditMode">
            <div class="col-12 col-md-6">
              <div v-if="sense.dominantHand" class="q-mb-sm">
                <div class="text-caption">{{ translate('word_detail.field.dominantHand') }}:</div>
                <div>{{ sense.dominantHand }}</div>
              </div>
              
              <div v-if="sense.facialExpression" class="q-mb-sm">
                <div class="text-caption">{{ translate('word_detail.field.facialExpression') }}:</div>
                <div>{{ sense.facialExpression }}</div>
              </div>
              
              <div v-if="sense.hasContact !== undefined" class="q-mb-sm">
                <div class="text-caption">{{ translate('word_detail.field.hasContact') }}:</div>
                <div>{{ sense.hasContact ? translate('common.yes') : translate('common.no') }}</div>
              </div>
            </div>
            
            <div class="col-12 col-md-6">
              <div v-if="sense.phonologicalTranscription" class="q-mb-sm">
                <div class="text-caption">{{ translate('word_detail.field.phonologicalTranscription') }}:</div>
                <div>{{ sense.phonologicalTranscription }}</div>
              </div>
              
              <div v-if="sense.movementType" class="q-mb-sm">
                <div class="text-caption">{{ translate('word_detail.field.movementType') }}:</div>
                <div>{{ sense.movementType }}</div>
              </div>
              
              <div v-if="sense.nonManualComponents" class="q-mb-sm">
                <div class="text-caption">{{ translate('word_detail.field.nonManualComponents') }}:</div>
                <div>{{ sense.nonManualComponents }}</div>
              </div>
            </div>
          </template>
          
          <!-- Edit mode -->
          <template v-else>
            <div class="col-12 col-md-6">
              <q-select
                v-model="sense.dominantHand"
                :options="handOptions"
                :label="translate('word_detail.field.dominantHand')"
                outlined
                dense
                class="q-mb-sm"
              />
              
              <q-input
                v-model="sense.facialExpression"
                :label="translate('word_detail.field.facialExpression')"
                outlined
                dense
                class="q-mb-sm"
              />
              
              <q-toggle
                v-model="sense.hasContact"
                :label="translate('word_detail.field.hasContact')"
                class="q-mb-sm"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="sense.phonologicalTranscription"
                :label="translate('word_detail.field.phonologicalTranscription')"
                outlined
                dense
                class="q-mb-sm"
              />
              
              <q-input
                v-model="sense.movementType"
                :label="translate('word_detail.field.movementType')"
                outlined
                dense
                class="q-mb-sm"
              />
              
              <q-input
                v-model="sense.nonManualComponents"
                :label="translate('word_detail.field.nonManualComponents')"
                outlined
                dense
                class="q-mb-sm"
              />
            </div>
          </template>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { Hand, Sense } from 'src/types/word'
import translate from 'src/utils/translate'

interface Props {
  sense: Sense
  isEditMode: boolean
}

const props = defineProps<Props>()

// Define options for dropdowns
const handOptions = [Hand.RIGHT, Hand.LEFT, Hand.BOTH]
</script>

<style scoped>
.info-card {
  height: 100%;
}
</style> 