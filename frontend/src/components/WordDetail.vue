<template>
  <div class="word-detail q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Basic Word Information -->
      <div class="col-12 col-md-6">
        <q-card class="word-card">
          <q-card-section>
            <div class="text-h5">
              <q-input 
                v-if="editMode === 'full'" 
                v-model="localWord.word" 
                :label="translate('word_detail.field.word')" 
                outlined 
                dense
              />
              <div v-else class="text-h4 q-mb-md">{{ localWord.word }}</div>
            </div>
            
            <q-input 
              v-if="editMode !== 'none'" 
              v-model="localWord.description" 
              :label="translate('word_detail.field.description')" 
              outlined
              type="textarea" 
              autogrow
            />
            <div v-else class="text-body1 q-mb-md">{{ localWord.description }}</div>

            <div v-if="localWord.dialect" class="text-caption q-mt-sm">
              {{ translate('word_detail.field.dialect') }}: {{ localWord.dialect.name }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Videos -->
      <div class="col-12 col-md-6">
        <q-card v-if="hasVideos" class="video-card">
          <q-card-section>
            <div class="text-h6">{{ translate('word_detail.field.videos') }}</div>
            <div v-for="(sense, sIndex) in localWord.senses" :key="'sense-' + sIndex">
              <div v-for="(video, vIndex) in sense.videos" :key="'video-' + vIndex">
                <q-video 
                  :src="video.url"
                  class="q-mb-md"
                />
                <div class="text-caption">{{ translate('word_detail.field.angle') }}: {{ video.angle || translate('word_detail.notSpecified') }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Senses -->
      <div class="col-12">
        <q-card class="sense-card">
          <q-card-section>
            <div class="text-h6">{{ translate('word_detail.field.senses') }}</div>
            
            <!-- Editable senses in edit mode -->
            <div v-if="editMode !== 'none'">
              <div v-for="(sense, index) in localWord.senses" :key="'edit-sense-' + index" class="q-mb-lg">
                <q-separator v-if="index > 0" class="q-my-md" />
                
                <div class="row q-col-gutter-sm">
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
                </div>
                
                <!-- Descriptions -->
                <div class="q-my-md">
                  <div class="text-subtitle2">{{ translate('word_detail.field.descriptions') }}</div>
                  <div v-for="(desc, dIndex) in sense.descriptions" :key="'desc-' + dIndex" class="q-pl-md q-mb-md">
                    <q-input
                      v-model="desc.text"
                      :label="translate('word_detail.field.descriptionText')"
                      outlined
                      type="textarea"
                      autogrow
                      class="q-mb-sm"
                    />
                    
                    <!-- Examples -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2">{{ translate('word_detail.field.examples') }}</div>
                      <div v-for="(example, eIndex) in desc.examples" :key="'example-' + eIndex" class="q-mb-xs">
                        <div class="row items-center">
                          <div class="col">
                            <q-input
                              v-model="desc.examples[eIndex]"
                              :label="translate('word_detail.field.example')"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-auto">
                            <q-btn flat round color="negative" icon="delete" @click="removeExample(dIndex, eIndex)" />
                          </div>
                        </div>
                      </div>
                      <q-btn flat color="primary" icon="add" :label="translate('word_detail.action.addExample')" @click="addExample(dIndex)" />
                    </div>
                    
                    <!-- Translations -->
                    <div class="q-mb-md">
                      <div class="text-subtitle2">{{ translate('word_detail.field.translations') }}</div>
                      <div v-for="(trans, tIndex) in desc.translations" :key="'trans-' + tIndex" class="q-mb-xs">
                        <div class="row items-center q-col-gutter-sm">
                          <div class="col">
                            <q-input
                              v-model="trans.text"
                              :label="translate('word_detail.field.translation')"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-auto">
                            <q-select
                              v-model="trans.language"
                              :options="languageOptions"
                              :label="translate('word_detail.field.language')"
                              outlined
                              dense
                              class="q-ml-sm"
                            />
                          </div>
                          <div class="col-auto">
                            <q-btn flat round color="negative" icon="delete" @click="removeTranslation(dIndex, tIndex)" />
                          </div>
                        </div>
                      </div>
                      <q-btn flat color="primary" icon="add" :label="translate('word_detail.action.addTranslation')" @click="addTranslation(dIndex)" />
                    </div>
                  </div>
                  <q-btn flat color="primary" icon="add" :label="translate('word_detail.action.addDescription')" @click="addDescription(index)" />
                </div>
                
                <div class="q-mt-md text-right">
                  <q-btn outline color="negative" :label="translate('word_detail.action.removeSense')" @click="removeSense(index)" />
                </div>
              </div>
              
              <div class="q-mt-lg">
                <q-btn unelevated color="primary" :label="translate('word_detail.action.addSense')" @click="addSense" />
              </div>
            </div>
            
            <!-- Display-only senses in view mode -->
            <div v-else>
              <div v-for="(sense, index) in localWord.senses" :key="'view-sense-' + index" class="q-mb-lg">
                <q-separator v-if="index > 0" class="q-my-md" />
                
                <div class="row q-col-gutter-md">
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
                </div>
                
                <!-- Descriptions -->
                <div v-for="(desc, dIndex) in sense.descriptions" :key="'desc-view-' + dIndex" class="q-mt-md q-pl-md">
                  <div class="text-weight-bold">{{ desc.text }}</div>
                  
                  <!-- Examples -->
                  <div v-if="desc.examples && desc.examples.length" class="q-mt-sm">
                    <div class="text-caption text-italic">{{ translate('word_detail.field.examples') }}:</div>
                    <ul class="q-mb-sm q-ml-sm">
                      <li v-for="(example, eIndex) in desc.examples" :key="'example-view-' + eIndex">
                        {{ example }}
                      </li>
                    </ul>
                  </div>
                  
                  <!-- Translations -->
                  <div v-if="desc.translations && desc.translations.length" class="q-mt-sm">
                    <div class="text-caption text-italic">{{ translate('word_detail.field.translations') }}:</div>
                    <div class="q-mb-sm">
                      <div v-for="(trans, tIndex) in desc.translations" :key="'trans-view-' + tIndex">
                        <span class="text-caption text-weight-bold">{{ trans.language }}:</span> {{ trans.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- Actions for edit mode -->
      <div v-if="editMode !== 'none'" class="col-12 q-mt-md text-right">
        <q-btn flat :label="translate('common.cancel')" color="grey" class="q-mr-sm" @click="cancel" />
        <q-btn unelevated :label="translate('common.save')" color="primary" @click="save" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { WordStatus, Language, Hand, Words, Sense, Description, SenseTranslation, VideoInfo } from 'src/types/word'
import translate from 'src/utils/translate'

// The Quasar notification system
const $q = useQuasar()

// Props
interface Props {
  word?: Words | null
  editMode: 'none' | 'strict' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  word: null,
  editMode: 'none'
})

// Emits
const emit = defineEmits<{
  (e: 'save', word: Words): void
  (e: 'cancel'): void
}>()

// Define options for dropdowns
const handOptions = [Hand.RIGHT, Hand.LEFT, Hand.BOTH]
const languageOptions = [Language.CATALAN, Language.SPANISH, Language.ENGLISH, Language.OTHER]

// Local state for word editing
const localWord = ref<Words>({
  id: '',
  word: '',
  description: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  creatorId: '',
  isNative: true,
  status: WordStatus.PUBLISHED,
  currentVersion: 1,
  isCreatedFromRequest: false,
  isCreatedFromEdit: false,
  senses: []
})

// Initialize local word from props
watch(() => props.word, (newWord) => {
  if (newWord) {
    // Deep clone the word to avoid modifying the original
    localWord.value = JSON.parse(JSON.stringify(newWord))
  } else if (props.editMode === 'full') {
    // Initialize with empty senses if it's a new word
    localWord.value.senses = [createEmptySense()]
  }
}, { immediate: true })

// Helper computed properties
const hasVideos = computed(() => {
  return localWord.value.senses.some(sense => 
    sense.videos && sense.videos.length > 0
  )
})

// Helper methods for editing
function createEmptySense(): Sense {
  return {
    priority: 0,
    descriptions: [createEmptyDescription()],
    videos: []
  }
}

function createEmptyDescription(): Description {
  return {
    text: '',
    examples: [],
    translations: []
  }
}

function createEmptyTranslation(): SenseTranslation {
  return {
    text: '',
    language: Language.CATALAN
  }
}

function createEmptyVideo(): VideoInfo {
  return {
    url: '',
    angle: 'Front',
    priority: 0
  }
}

// Methods for manipulating data in edit mode
function addSense() {
  localWord.value.senses.push(createEmptySense())
}

function removeSense(index: number) {
  if (localWord.value.senses.length > 1) {
    localWord.value.senses.splice(index, 1)
  } else {
    $q.notify({
      color: 'warning',
      message: translate('word_detail.error.needOneSense')
    })
  }
}

function addDescription(senseIndex: number) {
  const sense = localWord.value.senses[senseIndex]
  if (sense) {
    sense.descriptions.push(createEmptyDescription())
  }
}

function removeDescription(senseIndex: number, descIndex: number) {
  const sense = localWord.value.senses[senseIndex]
  if (sense && sense.descriptions.length > 1) {
    sense.descriptions.splice(descIndex, 1)
  } else {
    $q.notify({
      color: 'warning',
      message: translate('word_detail.error.needOneDescription')
    })
  }
}

function addExample(descIndex: number) {
  const sense = localWord.value.senses[0]
  if (sense && sense.descriptions[descIndex]) {
    sense.descriptions[descIndex].examples.push('')
  }
}

function removeExample(descIndex: number, exampleIndex: number) {
  const sense = localWord.value.senses[0]
  if (sense && sense.descriptions[descIndex]) {
    sense.descriptions[descIndex].examples.splice(exampleIndex, 1)
  }
}

function addTranslation(descIndex: number) {
  const sense = localWord.value.senses[0]
  if (sense && sense.descriptions[descIndex]) {
    sense.descriptions[descIndex].translations.push(createEmptyTranslation())
  }
}

function removeTranslation(descIndex: number, translationIndex: number) {
  const sense = localWord.value.senses[0]
  if (sense && sense.descriptions[descIndex]) {
    sense.descriptions[descIndex].translations.splice(translationIndex, 1)
  }
}

function addVideo(senseIndex: number) {
  const sense = localWord.value.senses[senseIndex]
  if (sense) {
    sense.videos = sense.videos || []
    sense.videos.push(createEmptyVideo())
  }
}

function removeVideo(senseIndex: number, videoIndex: number) {
  const sense = localWord.value.senses[senseIndex]
  if (sense && sense.videos) {
    sense.videos.splice(videoIndex, 1)
  }
}

// Save and cancel handlers
function save() {
  // Basic validation
  if (!localWord.value.word.trim()) {
    $q.notify({
      color: 'negative',
      message: translate('word_detail.error.emptyWord')
    })
    return
  }
  
  if (!localWord.value.description.trim()) {
    $q.notify({
      color: 'negative',
      message: translate('word_detail.error.emptyDescription')
    })
    return
  }
  
  // Emit the save event with the edited word
  emit('save', localWord.value)
}

function cancel() {
  emit('cancel')
}
</script>

<style scoped>
.word-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.video-card, .word-card, .sense-card {
  height: 100%;
}
</style> 