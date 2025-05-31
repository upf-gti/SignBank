<template>
  <q-card-section class="row justify-between items-center">
    <q-select
      v-model="selectedSenseId"
      :options="senses.map((sense) => ({
        label: sense.senseTitle,
        value: sense.id,
      }))"
      :label="translate('sense')"
      outlined
      dense
      class="col-6"
    />
    <q-btn
      v-if="editMode"
      flat
      round
      icon="add"
      :label="translate('addSense')"
      @click="addSense = true"
    />
  </q-card-section>
  <q-dialog v-model="addSense">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          {{ translate('addSense') }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="newSense.senseTitle"
          :label="translate('senseTitle')"
          outlined
          dense
          class="q-mb-md"
        />
        <q-select
          v-model="newSense.lexicalCategory"
          :options="lexicalCategories"
          :label="translate('lexicalCategory')"
          outlined
          dense
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="translate('cancel')"
          color="primary"
          @click="cancelSense"
        />
        <q-btn
          flat
          :label="translate('save')"
          color="primary"
          @click="saveSense"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
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
  editMode: boolean,
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
