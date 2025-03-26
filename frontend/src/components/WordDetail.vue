<template>
  <div class="word-detail q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card class="word-header-card">
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

      <!-- Main content with new layout -->
      <div class="col-12 col-md-4">
        <!-- Videos on the left side -->
        <VideoPlayer 
          :videos="allVideos"
        />
      </div>

      <!-- Sense details on the right side -->
      <div class="col-12 col-md-8">
        <SenseDetails
          :senses="localWord.senses"
          :is-edit-mode="editMode !== 'none'"
          @update:senses="updateSenses"
        />
      </div>
      
      <!-- Sign information below the video -->
      <div class="col-12">
        <SignInfo 
          v-if="currentSense"
          :sense="currentSense" 
          :is-edit-mode="editMode !== 'none'"
        />
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
import VideoPlayer from './VideoPlayer.vue'
import SenseDetails from './SenseDetails.vue'
import SignInfo from './SignInfo.vue'

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

// Current sense for the sign information display
const currentSenseIndex = ref(0)
const currentSense = computed(() => {
  if (localWord.value.senses.length === 0) {
    return null
  }
  return localWord.value.senses[currentSenseIndex.value]
})

// All videos from all senses for the video player
const allVideos = computed(() => {
  const videos: VideoInfo[] = []
  for (const sense of localWord.value.senses) {
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

// Methods for manipulating data
function updateSenses(senses: Sense[]) {
  localWord.value.senses = senses
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

.word-header-card {
  height: 100%;
}
</style> 