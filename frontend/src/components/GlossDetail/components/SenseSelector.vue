<template>
  <q-card-section>
    <div class="row">
      <q-btn-toggle
        v-model="selectedSenseId"
        :options="senses.map((sense) => ({
          label: (sense.senseTitle || glossData.gloss) + ' (' + translate(sense.lexicalCategory) + ')',
          value: sense.id,
        }))"
      />
      <q-btn
        v-if="editMode && !addSense"
        icon="add"
        :label="translate('addSense')"
        @click="addSense = true"
      />
      <q-btn
        v-if="editMode"
        icon="edit"
        :label="translate('editSenses')"
        class="q-ml-sm"
        @click="openEditSenses"
      />

      <!-- Add Sense Dialog -->
      <q-dialog v-model="addSense">
        <q-card style="width: 500px">
          <q-card-section>
            <div class="text-h6">
              {{ translate('addSense') }}
            </div>
          </q-card-section>
          <q-form @submit.prevent.stop="saveSense">
            <q-card-section>
              <q-input
                v-model="newSense.senseTitle"
                hide-bottom-space
                :label="translate('senseTitle')"
                :placeholder="translate('addAditionalInformation')"
              />
              <q-select
                v-model="newSense.lexicalCategory"
                :label="translate('lexicalCategory')"
                emit-value
                hide-bottom-space
                :options="lexicalCategories"
                :rules="[val => !!val || translate('required')]"
              >
                <template #selected>
                  {{ translate(newSense.lexicalCategory) }}
                </template>
              </q-select>
            </q-card-section>
            <q-card-actions>
              <q-btn
                :label="translate('cancel')"
                flat
                type="button"
                @click="addSense = false"
              />
              <q-btn
                :label="translate('save')"
                flat
                type="submit"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>

      <!-- Edit Senses Dialog -->
      <q-dialog v-model="editSensesDialog">
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">{{ translate('editSenses') }}</div>
          </q-card-section>

          <q-card-section>
            <div v-for="(sense, index) in localSenses" :key="sense.id || index" class="row items-center q-mb-sm">
              <div class="col">
                {{ (sense.senseTitle || glossData.gloss) + ' (' + translate(sense.lexicalCategory) + ')' }}
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  dense
                  icon="arrow_upward"
                  :disable="index === 0"
                  @click="moveSense(index, 'up')"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="arrow_downward"
                  :disable="index === localSenses.length - 1"
                  @click="moveSense(index, 'down')"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  @click="editSense(sense)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  :disable="senses.length <= 1"
                  @click="confirmDelete(sense)"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="translate('cancel')" @click="cancelEditSenses" />
            <q-btn flat :label="translate('save')" @click="saveEditSenses" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Delete Confirmation Dialog -->
      <q-dialog v-model="deleteConfirmDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ translate('confirmDelete') }}</div>
          </q-card-section>

          <q-card-section>
            {{ translate('confirmDeleteSenseMessage') }}
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="translate('cancel')" v-close-popup />
            <q-btn flat color="negative" :label="translate('delete')" @click="handleDeleteConfirm" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Edit Individual Sense Dialog -->
      <q-dialog v-model="editSingleSenseDialog">
        <q-card style="width: 500px">
          <q-card-section>
            <div class="text-h6">{{ translate('editSense') }}</div>
          </q-card-section>
          <q-form @submit.prevent.stop="saveSingleSense">
            <q-card-section>
              <q-input
                v-model="editingSense.senseTitle"
                hide-bottom-space
                :label="translate('senseTitle')"
                :placeholder="translate('addAditionalInformation')"
              />
              <q-select
                v-model="editingSense.lexicalCategory"
                :label="translate('lexicalCategory')"
                emit-value
                hide-bottom-space
                :options="lexicalCategories"
                :rules="[val => !!val || translate('required')]"
              >
                <template #selected>
                  {{ translate(editingSense.lexicalCategory || '') }}
                </template>
              </q-select>
            </q-card-section>
            <q-card-actions>
              <q-btn
                :label="translate('cancel')"
                flat
                type="button"
                @click="editSingleSenseDialog = false"
              />
              <q-btn
                :label="translate('save')"
                flat
                type="submit"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import type { Sense, GlossData, Definition, SignVideo, Example, SenseTranslation } from 'src/types/models'
import translate from 'src/utils/translate'
import { ref, computed } from 'vue'

const selectedSenseId = defineModel<string>()
const emit = defineEmits<{
  (e: 'addSense', sense: { senseTitle: string, lexicalCategory: string }): void
  (e: 'updateSenses', senses: Sense[]): void
  (e: 'updateSense', sense: Sense): void
  (e: 'deleteSense', senseId: string): void
}>()

const { senses, editMode, glossData } = defineProps<{
  senses: Sense[],
  editMode: boolean,
  glossData: GlossData
}>()

const addSense = ref(false)
const editSensesDialog = ref(false)
const editSingleSenseDialog = ref(false)
const localSenses = ref<Sense[]>([])

// Create a properly typed editingSense object with all required fields
const editingSense = ref<Sense>({
  id: '',
  senseTitle: '',
  lexicalCategory: '',
  priority: 0,
  glossDataId: '',
  definitions: [],
  signVideos: [],
  examples: [],
  senseTranslations: []
})

const newSense = ref({
  senseTitle: '',
  lexicalCategory: ''
})

const lexicalCategories = ref([
  { label: translate('noun'), value: 'noun' },
  { label: translate('verb'), value: 'verb' },
  { label: translate('adjective'), value: 'adjective' },
  { label: translate('adverb'), value: 'adverb' },
  { label: translate('preposition'), value: 'preposition' },
  { label: translate('conjunction'), value: 'conjunction' },
  { label: translate('interjection'), value: 'interjection' }
])

const saveSense = () => {
  addSense.value = false
  emit('addSense', newSense.value)
  newSense.value = {
    senseTitle: '',
    lexicalCategory: ''
  }
}

// Helper function to safely deep clone objects
const safeDeepClone = <T>(obj: T): T => {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (e) {
    console.error('Failed to clone object:', e)
    return obj
  }
}

// Helper function to update priorities based on current order
const updatePriorities = () => {
  localSenses.value.forEach((sense, index) => {
    sense.priority = index
  })
}

const openEditSenses = () => {
  localSenses.value = safeDeepClone(senses)
  updatePriorities() // Ensure initial priorities match the order
  editSensesDialog.value = true
}

const moveSense = (index: number, direction: 'up' | 'down') => {
  if (direction === 'up' && index > 0) {
    const temp = safeDeepClone(localSenses.value[index])
    localSenses.value[index] = safeDeepClone(localSenses.value[index - 1])
    localSenses.value[index - 1] = temp
    updatePriorities() // Update priorities after reordering
  } else if (direction === 'down' && index < localSenses.value.length - 1) {
    const temp = safeDeepClone(localSenses.value[index])
    localSenses.value[index] = safeDeepClone(localSenses.value[index + 1])
    localSenses.value[index + 1] = temp
    updatePriorities() // Update priorities after reordering
  }
}

const editSense = (sense: Sense) => {
  editingSense.value = safeDeepClone(sense)
  editSingleSenseDialog.value = true
}

const saveSingleSense = () => {
  const index = localSenses.value.findIndex(s => s.id === editingSense.value.id)
  if (index !== -1) {
    const updatedSense = safeDeepClone(editingSense.value)
    localSenses.value[index] = updatedSense
    emit('updateSense', updatedSense)
  }
  editSingleSenseDialog.value = false
}

const saveEditSenses = () => {
  // Make sure priorities are up to date before saving
  updatePriorities()
  // Create a new array to ensure reactivity
  const updatedSenses = safeDeepClone(localSenses.value)
  emit('updateSenses', updatedSenses)
  editSensesDialog.value = false
}

const cancelEditSenses = () => {
  editSensesDialog.value = false
  localSenses.value = safeDeepClone(senses)
}

const deleteConfirmDialog = ref(false)
const senseToDelete = ref<Sense | null>(null)

const confirmDelete = (sense: Sense) => {
  senseToDelete.value = sense
  deleteConfirmDialog.value = true
}

const handleDeleteConfirm = () => {
  if (senseToDelete.value) {
    emit('deleteSense', senseToDelete.value.id || '')
    deleteConfirmDialog.value = false
    editSensesDialog.value = false
  }
}

const deleteSense = (sense: Sense) => {
  if (senses.length <= 1) {
    return // Don't allow deleting the last sense
  }
  emit('deleteSense', sense.id || '')
  editSensesDialog.value = false
}
</script>
