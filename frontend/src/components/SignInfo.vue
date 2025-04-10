<template>
  <div class="sign-info">
    <q-card
      v-if="video"
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
                v-if="video.dominantHand"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.dominantHand') }}:
                </div>
                <div>{{ translate(video.dominantHand) }}</div>
              </div>
              
              <div
                v-if="video.facialExpression"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.facialExpression') }}:
                </div>
                <div>{{ video.facialExpression }}</div>
              </div>
              
              <div
                v-if="video.hasContact !== undefined"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.hasContact') }}:
                </div>
                <div>{{ video.hasContact ? translate('common.yes') : translate('common.no') }}</div>
              </div>
            </div>
            
            <div class="col-12 col-md-6">
              <div
                v-if="video.phonologicalTranscription"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.phonologicalTranscription') }}:
                </div>
                <div>{{ video.phonologicalTranscription }}</div>
              </div>
              
              <div
                v-if="video.movementType"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.movementType') }}:
                </div>
                <div>{{ video.movementType }}</div>
              </div>
              
              <div
                v-if="video.nonManualComponents"
                class="q-mb-sm"
              >
                <div class="text-caption">
                  {{ translate('word_detail.field.nonManualComponents') }}:
                </div>
                <div>{{ video.nonManualComponents }}</div>
              </div>
            </div>
          </template>
          
          <!-- Edit mode -->
          <template v-else>
            <div class="col-12 col-md-6">
              <q-select
                v-model="localVideo.dominantHand"
                :options="handOptions"
                :label="translate('word_detail.field.dominantHand')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateVideo"
              />
              
              <q-input
                v-model="localVideo.facialExpression"
                :label="translate('word_detail.field.facialExpression')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateVideo"
              />
              
              <q-toggle
                v-model="localVideo.hasContact"
                :label="translate('word_detail.field.hasContact')"
                class="q-mb-sm"
                @update:model-value="updateVideo"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="localVideo.phonologicalTranscription"
                :label="translate('word_detail.field.phonologicalTranscription')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateVideo"
              />
              
              <q-input
                v-model="localVideo.movementType"
                :label="translate('word_detail.field.movementType')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateVideo"
              />
              
              <q-input
                v-model="localVideo.nonManualComponents"
                :label="translate('word_detail.field.nonManualComponents')"
                outlined
                dense
                class="q-mb-sm"
                @update:model-value="updateVideo"
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
import { Hand, Video } from 'src/types/word'
import translate from 'src/utils/translate'

interface Props {
  video: Video
  isEditMode: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:video': [updatedVideo: Video]
}>()

// Create a local copy of the sense data
const localVideo = ref<Video>({...props.video})

// Update local sense when props change
watch(() => props.video, (newVideo) => {
  localVideo.value = {...newVideo}
}, { deep: true })

// Initial setup
onMounted(() => {
  localVideo.value = {...props.video}
})

// Update the parent component when local data changes
function updateVideo() {
  emit('update:video', {...localVideo.value})
}
const handOptions = [{value: Hand.RIGHT, label: translate('word_detail.field.rightHand')}, {value: Hand.LEFT, label: translate('word_detail.field.leftHand')}, {value: Hand.BOTH, label: translate('word_detail.field.bothHands')}]
</script>

<style scoped>
.info-card {
  height: 100%;
}
</style> 