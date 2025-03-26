<template>
  <div class="sense-details">
    <q-card class="sense-card">
      <q-card-section>
        <div class="sense-navigation" v-if="senses.length > 1">
          <div class="text-h6">{{ translate('word_detail.field.senses') }}</div>
          <div class="sense-tabs">
            <q-tabs
              v-model="currentSenseIndex"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="left"
            >
              <q-tab 
                v-for="(sense, index) in senses" 
                :key="index" 
                :name="index" 
                :label="`${translate('word_detail.sense')} ${index + 1}`" 
              />
            </q-tabs>
          </div>
        </div>
        <div v-else class="text-h6">{{ translate('word_detail.field.definitions') }}</div>
        
        <!-- Display descriptions in view mode -->
        <div v-if="!isEditMode && currentSense">
          <div v-for="(desc, dIndex) in currentSense.descriptions" :key="'desc-' + dIndex" class="q-mt-md">
            <div class="text-weight-bold">{{ desc.text }}</div>
            
            <!-- Examples -->
            <div v-if="desc.examples && desc.examples.length" class="q-mt-sm">
              <div class="text-caption text-italic">{{ translate('word_detail.field.examples') }}:</div>
              <ul class="q-mb-sm q-ml-sm">
                <li v-for="(example, eIndex) in desc.examples" :key="'example-' + eIndex">
                  {{ example }}
                </li>
              </ul>
            </div>
            
            <!-- Translations -->
            <div v-if="desc.translations && desc.translations.length" class="q-mt-sm">
              <div class="text-caption text-italic">{{ translate('word_detail.field.translations') }}:</div>
              <div class="q-mb-sm">
                <div v-for="(trans, tIndex) in desc.translations" :key="'trans-' + tIndex">
                  <span class="text-caption text-weight-bold">{{ trans.language }}:</span> {{ trans.text }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Edit mode -->
        <div v-else-if="currentSense">
          <div v-for="(desc, dIndex) in currentSense.descriptions" :key="'desc-edit-' + dIndex" class="q-mt-md">
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
            
            <div class="q-mt-md text-right">
              <q-btn flat color="negative" icon="delete" :label="translate('word_detail.action.removeDescription')" @click="removeDescription(dIndex)" />
            </div>
          </div>
          
          <div class="q-mt-md">
            <q-btn flat color="primary" icon="add" :label="translate('word_detail.action.addDescription')" @click="addDescription()" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { Sense, Description, SenseTranslation, Language } from 'src/types/word'
import translate from 'src/utils/translate'

// The Quasar notification system
const $q = useQuasar()

interface Props {
  senses: Sense[]
  isEditMode: boolean
}

const props = defineProps<Props>()

// Emit events for modifications
const emit = defineEmits<{
  (e: 'update:senses', senses: Sense[]): void
}>()

// Define options for dropdowns
const languageOptions = [Language.CATALAN, Language.SPANISH, Language.ENGLISH, Language.OTHER]

// Current sense index
const currentSenseIndex = ref(0)

// Reset index when senses change
watch(() => props.senses, () => {
  if (currentSenseIndex.value >= props.senses.length) {
    currentSenseIndex.value = 0
  }
}, { immediate: true })

// Current sense computed property
const currentSense = computed(() => {
  if (props.senses.length === 0) {
    return null
  }
  return props.senses[currentSenseIndex.value]
})

// Helper methods
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

// Methods for manipulating data in edit mode
function addDescription() {
  if (currentSense.value) {
    currentSense.value.descriptions.push(createEmptyDescription())
    emit('update:senses', [...props.senses])
  }
}

function removeDescription(descIndex: number) {
  if (currentSense.value && currentSense.value.descriptions.length > 1) {
    currentSense.value.descriptions.splice(descIndex, 1)
    emit('update:senses', [...props.senses])
  } else {
    $q.notify({
      color: 'warning',
      message: translate('word_detail.error.needOneDescription')
    })
  }
}

function addExample(descIndex: number) {
  if (currentSense.value && currentSense.value.descriptions[descIndex]) {
    currentSense.value.descriptions[descIndex].examples.push('')
    emit('update:senses', [...props.senses])
  }
}

function removeExample(descIndex: number, exampleIndex: number) {
  if (currentSense.value && currentSense.value.descriptions[descIndex]) {
    currentSense.value.descriptions[descIndex].examples.splice(exampleIndex, 1)
    emit('update:senses', [...props.senses])
  }
}

function addTranslation(descIndex: number) {
  if (currentSense.value && currentSense.value.descriptions[descIndex]) {
    currentSense.value.descriptions[descIndex].translations.push(createEmptyTranslation())
    emit('update:senses', [...props.senses])
  }
}

function removeTranslation(descIndex: number, translationIndex: number) {
  if (currentSense.value && currentSense.value.descriptions[descIndex]) {
    currentSense.value.descriptions[descIndex].translations.splice(translationIndex, 1)
    emit('update:senses', [...props.senses])
  }
}
</script>

<style scoped>
.sense-card {
  height: 100%;
}

.sense-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sense-tabs {
  flex-grow: 1;
  margin-left: 1rem;
}
</style> 