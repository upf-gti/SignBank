<template>
  <q-card-section>
    <div class="row">
      <q-btn-toggle
        v-model="selectedSenseId"
        :options="senses.map((sense) => ({
          label: (sense.senseTitle || glossData.gloss) + ( sense.senseTitle ? '' : ' (' + translate(sense.lexicalCategory) + ')' ),
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
            <div class="text-h6">
              {{ translate('editSenses') }}
            </div>
          </q-card-section>

          <q-card-section>
            <div
              v-for="(sense, index) in localSenses"
              :key="sense.id || index"
              class="row items-center q-mb-sm"
            >
              <div class="col">
                {{ (sense.senseTitle || glossData.gloss) + ( sense.senseTitle ? '' : ' (' + translate(sense.lexicalCategory) + ')') }}
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
            <q-btn
              flat
              :label="translate('cancel')"
              @click="cancelEditSenses"
            />
            <q-btn
              flat
              :label="translate('save')"
              @click="saveEditSenses"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Delete Confirmation Dialog -->
      <q-dialog v-model="deleteConfirmDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              {{ translate('confirmDelete') }}
            </div>
          </q-card-section>

          <q-card-section>
            {{ translate('confirmDeleteSenseMessage') }}
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              v-close-popup
              flat
              :label="translate('cancel')"
            />
            <q-btn
              flat
              color="negative"
              :label="translate('delete')"
              @click="handleDeleteConfirm"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Edit Individual Sense Dialog -->
      <q-dialog v-model="editSingleSenseDialog">
        <q-card style="width: 500px">
          <q-card-section>
            <div class="text-h6">
              {{ translate('editSense') }}
            </div>
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
import type { Sense, GlossData } from 'src/types/models'
import translate from 'src/utils/translate'
import { LEXICAL_CATEGORIES } from 'src/utils/lexicalCategories'
import { ref, watch } from 'vue'
import { api } from 'src/services/api'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps<{
  senses: Sense[],
  editMode: boolean,
  glossData: GlossData
}>()

const selectedSenseId = defineModel<string>()
const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void
}>()

const addSense = ref(false)
const editSensesDialog = ref(false)
const editSingleSenseDialog = ref(false)
const loading = ref(false)

// Create a ref for local senses
const localSenses = ref<Sense[]>([])

// Watch for changes in props.senses to update local state
watch(() => props.senses, (newSenses) => {
  localSenses.value = [...newSenses]
}, { immediate: true })

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

const lexicalCategories = ref(LEXICAL_CATEGORIES)

const saveSense = async () => {
  try {
    loading.value = true
    const response = await api.senses.create(props.glossData.id || '', {
      senseTitle: newSense.value.senseTitle,
      lexicalCategory: newSense.value.lexicalCategory
    })

    // Close dialog and reset form
    addSense.value = false
    newSense.value = {
      senseTitle: '',
      lexicalCategory: ''
    }

    // Emit the updated gloss data to parent
    emit('update:glossData', response.data)

    $q.notify({
      message: translate('senseCreatedSuccessfully'),
      color: 'positive',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error creating sense:', error)
    $q.notify({
      message: translate('errors.failedToCreateSense'),
      color: 'negative',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const moveSense = async (index: number, direction: 'up' | 'down') => {
  try {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if ((direction === 'up' && index > 0) || 
        (direction === 'down' && index < localSenses.value.length - 1)) {
      
      loading.value = true
      const senseToMove = localSenses.value[index]
      const otherSense = localSenses.value[newIndex]
      
      if (!senseToMove || !senseToMove.id || !otherSense || !otherSense.id) return

      // Update priorities
      const tempPriority = senseToMove.priority
      senseToMove.priority = otherSense.priority
      otherSense.priority = tempPriority

      // Update both senses
      const [, response] = await Promise.all([
        api.senses.update(props.glossData.id || '', senseToMove.id, {
          senseTitle: senseToMove.senseTitle,
          lexicalCategory: senseToMove.lexicalCategory,
          priority: senseToMove.priority
        }),
        api.senses.update(props.glossData.id || '', otherSense.id, {
          senseTitle: otherSense.senseTitle,
          lexicalCategory: otherSense.lexicalCategory,
          priority: otherSense.priority
        })
      ])

      // Update the parent with the latest data
      emit('update:glossData', response.data)

      // Sort the local senses by priority
      localSenses.value.sort((a, b) => a.priority - b.priority)
    }
  } catch (error) {
    console.error('Error updating sense priority:', error)
    $q.notify({
      message: translate('errors.failedToUpdateSensePriority'),
      color: 'negative',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const editSense = (sense: Sense) => {
  editingSense.value = { ...sense }
  editSingleSenseDialog.value = true
}

const saveSingleSense = async () => {
  try {
    loading.value = true
    if (!editingSense.value.id) return

    const response = await api.senses.update(props.glossData.id || '', editingSense.value.id, {
      senseTitle: editingSense.value.senseTitle,
      lexicalCategory: editingSense.value.lexicalCategory
    })

    editSingleSenseDialog.value = false
    
    // Emit the updated gloss data to parent
    emit('update:glossData', response.data)

    $q.notify({
      message: translate('senseUpdatedSuccessfully'),
      color: 'positive',
      icon: 'check'
    })
  } catch (error) {
    console.error('Error updating sense:', error)
    $q.notify({
      message: translate('errors.failedToUpdateSense'),
      color: 'negative',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const saveEditSenses = () => {
  // Emit the updated gloss data to parent
  emit('update:glossData', props.glossData)
  editSensesDialog.value = false
}

const cancelEditSenses = () => {
  editSensesDialog.value = false
  // Reset local senses to match props
  localSenses.value = [...props.senses]
}

const deleteConfirmDialog = ref(false)
const senseToDelete = ref<Sense | null>(null)

const confirmDelete = (sense: Sense) => {
  senseToDelete.value = sense
  deleteConfirmDialog.value = true
}

const handleDeleteConfirm = async () => {
  if (senseToDelete.value && senseToDelete.value.id) {
    try {
      loading.value = true
      const response = await api.senses.delete(props.glossData.id || '', senseToDelete.value.id)

      deleteConfirmDialog.value = false
      editSensesDialog.value = false

      // Emit the updated gloss data to parent
      emit('update:glossData', response.data)

      $q.notify({
        message: translate('senseDeletedSuccessfully'),
        color: 'positive',
        icon: 'check'
      })
    } catch (error) {
      console.error('Error deleting sense:', error)
      $q.notify({
        message: translate('errors.failedToDeleteSense'),
        color: 'negative',
        icon: 'error'
      })
    } finally {
      loading.value = false
    }
  }
}



const openEditSenses = () => {
  editSensesDialog.value = true
}
</script>
