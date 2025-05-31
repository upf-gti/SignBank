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
        v-if="editMode !== 'none' && !addSense"
        icon="add"
        :label="translate('addSense')"
        @click="addSense = true"
      />
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
    </div>
  </q-card-section>
</template>
<script setup lang="ts">
import { Sense, GlossData } from 'src/types/models'
import translate from 'src/utils/translate'
import { ref } from 'vue'

const selectedSenseId = defineModel<string>()
const emit = defineEmits<{
  (e: 'addSense', sense: { senseTitle: string, lexicalCategory: string }): void
}>()

const { senses } = defineProps<{
  senses: Sense[],
  editMode: "strict" | "full" | "none",
  glossData: GlossData
}>()

const addSense = ref(false)
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

const cancelSense = () => {
  addSense.value = false
}
</script>
