<template>
  <div class="sense-details full-height">
    <q-card
      class="sense-card full-height"
      flat
    >
      <q-card-section class="column full-height">
        <div
          v-if="senses.length > 1"
          class="sense-navigation"
        >
          <div
            class="text-h6"
          >
            {{ translate('word_detail.field.senses') }}
          </div>
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
                :label="`${word} ${index + 1}`" 
              />
            </q-tabs>
          </div>
        </div>
        <div
          v-else
          class="text-h6 q-mb-md"
        >
          {{ translate('word_detail.field.definitions') }}
        </div>
        
        <!-- Add New Sense Button (only in edit mode) -->
        <div
          v-if="isEditMode"
          class="text-right q-mb-md overflow-auto"
        >
          <q-btn
            flat
            color="primary"
            icon="add"
            :label="translate('word_detail.action.addSense')"
            @click="addSense"
          />
        </div>
        
        <!-- Display definitions in view mode -->
        <div
          v-if="!isEditMode && currentSense"
          class="col overflow-auto q-pr-md"
        >
          <div
            v-for="(desc, dIndex) in currentSense.definitions"
            :key="'desc-' + dIndex"
            class="q-mt-md"
          >
            <div class="text-weight-bold">
              {{ desc.definition }}
            </div>
            
            <!-- Examples -->
            <div
              v-if="desc.examples && desc.examples.length"
              class="q-mt-sm"
            >
              <div class="text-caption text-italic">
                {{ translate('word_detail.field.examples') }}:
              </div>
              <ul class="q-mb-sm q-ml-sm">
                <li
                  v-for="(example, eIndex) in desc.examples"
                  :key="'example-' + eIndex"
                >
                  {{ example }}
                </li>
              </ul>
            </div>
            
            <!-- Translations -->
            <div
              v-if="desc.translations && desc.translations.length"
              class="q-mt-sm"
            >
              <div class="text-caption text-italic">
                {{ translate('word_detail.field.translations') }}:
              </div>
              <div class="q-mb-sm">
                <div
                  v-for="(trans, tIndex) in desc.translations"
                  :key="'trans-' + tIndex"
                >
                  <span class="text-caption text-weight-bold">{{ translate('language.' + trans.language) }}:</span> {{ trans.translation }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Edit mode -->
        <div
          v-else-if="currentSense"
          class="col overflow-auto"
        >
          <div
            v-for="(def, dIndex) in currentSense.definitions"
            :key="'def-edit-' + dIndex"
            class="q-mt-md"
          >
            <q-input
              v-model="def.definition"
              :label="translate('word_detail.field.definitionText')"
              outlined
              type="textarea"
              autogrow
              class="q-mb-sm"
              :rules="[val => !!val.trim() || translate('word_detail.error.emptyDefinition')]"
              @update:model-value="emitUpdate"
            />
            
            <!-- Examples -->
            <div class="q-mb-md">
              <div class="text-subtitle2">
                {{ translate('word_detail.field.examples') }}
              </div>
              <div
                v-for="(example, eIndex) in def.examples"
                :key="'example-' + eIndex"
                class="q-mb-xs"
              >
                <div class="row items-center">
                  <div class="col">
                    <q-input
                      v-model="def.examples[eIndex]"
                      :label="translate('word_detail.field.example')"
                      outlined
                      dense
                      :rules="[val => !!val.trim() || translate('word_detail.error.emptyExample')]"
                      @update:model-value="emitUpdate"
                    />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="removeExample(dIndex, eIndex)"
                    />
                  </div>
                </div>
              </div>
              <q-btn
                flat
                color="primary"
                icon="add"
                :label="translate('word_detail.action.addExample')"
                @click="addExample(dIndex)"
              />
            </div>
            
            <!-- Translations -->
            <div class="q-mb-md">
              <div class="text-subtitle2">
                {{ translate('word_detail.field.translations') }}
              </div>
              <div
                v-for="(trans, tIndex) in def.translations"
                :key="'trans-' + tIndex"
                class="q-mb-xs"
              >
                <div class="row items-center q-col-gutter-sm">
                  <div class="col">
                    <q-input
                      v-model="trans.translation"
                      :label="translate('word_detail.field.translation')"
                      outlined
                      dense
                      :rules="[val => !!val.trim() || translate('word_detail.error.emptyTranslation')]"
                      @update:model-value="emitUpdate"
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
                      :rules="[val => !!val || translate('word_detail.error.noLanguage')]"
                      @update:model-value="emitUpdate"
                    />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="removeTranslation(dIndex, tIndex)"
                    />
                  </div>
                </div>
              </div>
              <q-btn
                flat
                color="primary"
                icon="add"
                :label="translate('word_detail.action.addTranslation')"
                @click="addTranslation(dIndex)"
              />
            </div>
            
            <div class="q-mt-md text-right">
              <q-btn
                flat
                color="negative"
                icon="delete"
                :label="translate('word_detail.action.removeDefinition')"
                @click="removeDefinition(dIndex)"
              />
            </div>
          </div>
          
          <div class="q-mt-md">
            <q-btn
              flat
              color="primary"
              icon="add"
              :label="translate('word_detail.action.addDefinition')"
              @click="addDefinition()"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { debounce } from 'quasar'
import type { Sense, Definition } from 'src/types/database';
import { Language } from 'src/types/database'
import translate from 'src/utils/translate'

// The Quasar notification system
const $q = useQuasar()

interface Props {
  word: string
  senses: Sense[]
  isEditMode: boolean
}

const {word , senses = [], isEditMode = false} = defineProps<Props>()

// Emit events for modifications
const emit = defineEmits<{
  (e: 'update:senses', senses: Sense[]): void
  (e: 'update:current-sense-index', index: number): void
}>()

// Define options for dropdowns
const languageOptions = [Language.CATALAN, Language.SPANISH, Language.ENGLISH, Language.OTHER]

// Current sense index
const currentSenseIndex = ref(0)

// Watch for current sense index changes and emit the event
watch(currentSenseIndex, (newIndex) => {
  emit('update:current-sense-index', newIndex)
})

// Reset index when senses change
watch(() => senses, () => {
  if (currentSenseIndex.value >= senses.length) {
    currentSenseIndex.value = 0
  }
}, { immediate: true })

// Current sense computed property
const currentSense = computed(() => {
  if (senses.length === 0) {
    return null
  }
  return senses[currentSenseIndex.value]
})

// Create a debounced emit function for smoother updates
const emitUpdate = debounce(() => {
  emit('update:senses', [...senses])
}, 300) // 300ms debounce time

// Helper methods
function createEmptySense(): Sense {
  return {
    priority: senses.length + 1,
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

// Methods for manipulating data in edit mode
function addSense() {
  const newSenses = [...senses];
  
  // Create a new sense with required fields
  const newSense = createEmptySense();
  
  // Add a default definition to ensure it meets requirements
  if (!newSense.definitions || newSense.definitions.length === 0) {
    newSense.definitions = [createEmptyDefinition()];
  }
  
  newSenses.push(newSense);
  emit('update:senses', newSenses);
  
  // Switch to the newly added sense
  currentSenseIndex.value = newSenses.length - 1;
}

function addDefinition() {
  debugger
  if (currentSense.value) {
    currentSense.value.definitions.push(createEmptyDefinition())
    emit('update:senses', [...senses])
  }
}

function removeDefinition(defIndex: number) {
  if (currentSense.value && currentSense.value.definitions.length > 1) {
    currentSense.value.definitions.splice(defIndex, 1)
    emit('update:senses', [...senses])
  } else {
    $q.notify({
      color: 'warning',
      message: translate('word_detail.error.needOneDefinition')
    })
  }
}

function addExample(defIndex: number) {
  if (currentSense.value && currentSense.value.definitions[defIndex]) {
    // Add a placeholder example instead of empty string
    currentSense.value.definitions[defIndex].examples.push('Example')
    emit('update:senses', [...senses])
  }
}

function removeExample(defIndex: number, exampleIndex: number) {
  if (currentSense.value && currentSense.value.definitions[defIndex]) {
    currentSense.value.definitions[defIndex].examples.splice(exampleIndex, 1)
    emit('update:senses', [...senses])
  }
}

function addTranslation(defIndex: number) {
  if (currentSense.value && currentSense.value.definitions[defIndex]) {
    // Add a translation with default values
    currentSense.value.definitions[defIndex].translations.push({
      translation: 'Translation',
      language: Language.CATALAN
    })
    emit('update:senses', [...senses])
  }
}

function removeTranslation(defIndex: number, translationIndex: number) {
  if (currentSense.value && currentSense.value.definitions[defIndex]) {
    currentSense.value.definitions[defIndex].translations.splice(translationIndex, 1)
    emit('update:senses', [...senses])
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