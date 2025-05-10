<template>
  <div class="word-detail q-pa-md column">
    <q-form
      class="column q-col-gutter-md col"
      @submit.prevent.stop="save"
    >
      <div>
        <q-card
          class="word-header-card"
          flat
        >
          <q-card-section class="row no-wrap justify-between">
            <div class="row col">
              <div class="text-h5">
                <q-input 
                  v-if="editMode === 'full'" 
                  v-model="localWord.word" 
                  :label="translate('word_detail.field.word')" 
                  outlined 
                  hide-bottom-space
                  :rules="[(val) => !!val || translate('word_detail.error.emptyWord')]"
                  @update:model-value="emitUpdate"
                />
                <div
                  v-else
                  class="text-h4 q-mb-md q-ml-md"
                >
                  {{ localWord.word }}
                </div>
              </div>              
            </div>
            <!-- Actions for edit mode -->
            <div
              v-if="editMode !== 'none'"
              class="q-mt-md text-right"
            >
              <slot name="buttons">
                <q-btn
                  flat
                  :label="translate('common.cancel')"
                  color="grey"
                  class="q-mr-sm"
                  @click="cancel"
                />
                <q-btn
                  unelevated
                  :label="translate('common.save')"
                  color="primary"
                  type="submit"
                />
              </slot>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="row col overflow-auto">
        <!-- Main content with new layout -->
        <div class="col-12 col-md-4">
          <!-- Videos on the left side -->
          <VideoPlayer 
            :videos="allVideos"
            :edit-mode="editMode"
            @update:videos="updateVideos"
          />
        </div>

        <!-- Sense details on the right side -->
        <div class="col-12 col-md-8 full-height overflow-auto">
          <SenseDetails
            :senses="localWord.senses"
            :word="localWord.word"
            :is-edit-mode="editMode !== 'none'"
            @update:senses="updateSenses"
            @update:current-sense-index="updateCurrentSenseIndex"
          />
        </div>
      </div>     
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { debounce } from 'quasar'
import type { Sense, Definition, Video, Word } from 'src/types/database';
import translate from 'src/utils/translate'
import VideoPlayer from './VideoPlayer.vue'
import SenseDetails from './SenseDetails.vue'

// The Quasar notification system
const $q = useQuasar()

// Props
interface Props {
  word?: Word | null
  editMode: 'none' | 'strict' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  word: () => ({        
    word: '',
    isNative: true,
    senses: [],
    relatedWords: [],
    dialectId: ''
  }),
  editMode: 'none'
})

// Emits
const emit = defineEmits<{
  (e: 'save', word: Word): void
  (e: 'cancel'): void
  (e: 'update:word', word: Word): void
}>()

// Local state for word editing
const localWord = ref<Word>({} as Word)

// Current sense for the sign information display
const currentSenseIndex = ref(0)


// All videos from all senses for the video player
const allVideos = computed(() => {
  const videos: Video[] = []
  for (const sense of localWord.value.senses || []) {
    if (sense.videos && sense.videos.length) {
      videos.push(...sense.videos)
    }
  }
  return videos
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

// Helper methods for editing
function createEmptySense(): Sense {
  return {
    priority: 0,
    definitions: [createEmptyDefinition()],
    videos: []
  }
}

function createEmptyDefinition(): Definition {
  return {
    definition: '',
    examples: [],
    translations: []
  }
}

// Methods for manipulating data
function updateSenses(senses: Sense[]) {
  localWord.value.senses = senses
  emitUpdate()
}

function updateVideos(videos: Video[]) {
  localWord.value.senses.forEach(sense => {
    sense.videos = videos
  })
  emitUpdate()
}

function updateCurrentSenseIndex(index: number) {
  currentSenseIndex.value = index
}

// Helper function to emit updates (debounced)
const emitUpdate = debounce(() => {
  emit('update:word', localWord.value)
}, 300) // 300ms debounce time

// Save and cancel handlers
function save() {
  // Check if word is not empty
  if (!localWord.value.word.trim()) {
    $q.notify({
      color: 'negative',
      message: translate('word_detail.error.emptyWord')
    })
    return
  }
  
  // Check if senses array is not empty
  if (!localWord.value.senses || localWord.value.senses.length === 0) {
    $q.notify({
      color: 'negative',
      message: translate('word_detail.error.noSenses')
    })
    return
  }
  
  // Check each sense for valid definitions
  for (let i = 0; i < localWord.value.senses.length; i++) {
    const sense = localWord.value.senses[i] as Sense;
    
    // Check if definitions array exists and is not empty
    if (!sense.definitions || sense.definitions.length === 0) {
      $q.notify({
        color: 'negative',
        message: `${translate('word_detail.error.noDefinitions')} (${translate('word_detail.sense')} ${i + 1})`
      })
      return
    }
    
    // Check if at least one definition has non-empty text
    const hasValidDefinition = sense.definitions.some(desc => desc.definition && desc.definition.trim().length > 0)
    if (!hasValidDefinition) {
      $q.notify({
        color: 'negative',
        message: `${translate('word_detail.error.emptyDefinition')} (${translate('word_detail.sense')} ${i + 1})`
      })
      return
    }
  }
  
  // Emit the save event with the edited word
  emit('save', localWord.value as Word)
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

.word-header-card {
  height: 100%;
}
</style> 