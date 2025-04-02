<template>
  <div class="sign-info">
    <q-card
      class="info-card"
      flat
    >
      <q-card-section>
        <div class="text-h6">
          {{ translate('word_detail.field.signInfo') }}
        </div>
        
        <div class="row q-col-gutter-md q-mt-sm">
          <!-- Display mode -->
          <template v-if="!isEditMode">
            <div class="col-12 col-md-6">
              <div
                v-if="sense.dominantHand"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.dominantHand') }}:
                </div>
                <div>{{ translate(sense.dominantHand) }}</div>
              </div>
              
              <div
                v-if="sense.facialExpression"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.facialExpression') }}:
                </div>
                <div>{{ sense.facialExpression }}</div>
              </div>
              
              <div
                v-if="sense.hasContact !== undefined"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.hasContact') }}:
                </div>
                <div>{{ sense.hasContact ? translate('common.yes') : translate('common.no') }}</div>
              </div>
            </div>
            
            <div class="col-12 col-md-6">
              <div
                v-if="sense.phonologicalTranscription"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.phonologicalTranscription') }}:
                </div>
                <div>{{ sense.phonologicalTranscription }}</div>
              </div>
              
              <div
                v-if="sense.movementType"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.movementType') }}:
                </div>
                <div>{{ sense.movementType }}</div>
              </div>
              
              <div
                v-if="sense.nonManualComponents"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.nonManualComponents') }}:
                </div>
                <div>{{ sense.nonManualComponents }}</div>
              </div>
            </div>
          </template>
          
          <!-- Edit mode -->
          <template v-else>
            <div class="col-12 col-md-6">
              <q-select
                v-model="localSense.dominantHand"
                :options="handOptions"
                :label="translate('word_detail.field.dominantHand')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateSense"
              />
              
              <q-input
                v-model="localSense.facialExpression"
                :label="translate('word_detail.field.facialExpression')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateSense"
              />
              
              <q-toggle
                v-model="localSense.hasContact"
                :label="translate('word_detail.field.hasContact')"
                class="q-mb-sm"
                @update:model-value="updateSense"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="localSense.phonologicalTranscription"
                :label="translate('word_detail.field.phonologicalTranscription')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateSense"
              />
              
              <q-input
                v-model="localSense.movementType"
                :label="translate('word_detail.field.movementType')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateSense"
              />
              
              <q-input
                v-model="localSense.nonManualComponents"
                :label="translate('word_detail.field.nonManualComponents')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateSense"
              />
            </div>
          </template>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Hand, Sense } from 'src/types/word'
import translate from 'src/utils/translate'

interface Props {
  sense: Sense
  isEditMode: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:sense': [updatedSense: Sense]
}>()

// Create a local copy of the sense data
const localSense = ref<Sense>({...props.sense})

// Update local sense when props change
watch(() => props.sense, (newSense) => {
  localSense.value = {...newSense}
}, { deep: true })

// Initial setup
onMounted(() => {
  localSense.value = {...props.sense}
})

// Update the parent component when local data changes
function updateSense() {
  emit('update:sense', {...localSense.value})
}
const handOptions = [{value: Hand.RIGHT, label: translate('word_detail.field.rightHand')}, {value: Hand.LEFT, label: translate('word_detail.field.leftHand')}, {value: Hand.BOTH, label: translate('word_detail.field.bothHands')}]
</script>

<style scoped>
.info-card {
  height: 100%;
}
</style> 