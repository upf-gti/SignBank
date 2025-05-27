<template>
  <q-card-section >
    <div class="row">
    <q-btn-toggle
      v-model="selectedSenseId"
      :options="senses.map((sense) => ({
        label: sense.senseTitle,
        value: sense.id,
      }))"
    />
    <q-btn v-if="editMode !== 'none' && !addSense" icon="add" :label="translate('addSense')" @click="addSense = true" />
    <q-dialog v-model="addSense">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">
            {{ translate('addSense') }}
          </div>
        </q-card-section>
        <q-form @submit.prevent.stop="saveSense">
        <q-card-section>
          <q-input v-model="newSense.senseTitle" hide-bottom-space :label="translate('senseTitle')" :rules="[val => !!val || translate('required')]" />
          <q-select :label="translate('lexicalCategory')" hide-bottom-space v-model="newSense.lexicalCategory" :options="lexicalCategories" :rules="[val => !!val || translate('required')]" :display-value="translate(newSense.lexicalCategory)" />
        </q-card-section>
        <q-card-actions>
          <q-btn :label="translate('cancel')" @click="addSense = false" flat type="button" />
          <q-btn :label="translate('save')" flat type="submit" />
        </q-card-actions>
      </q-form>
      </q-card>
    </q-dialog>
    </div>
  </q-card-section>
</template>
<script setup lang="ts">
import { Sense } from 'src/types/models'
import translate from 'src/utils/translate'
import { ref } from 'vue'

const selectedSenseId = defineModel<string>()
const emit = defineEmits<{
  (e: 'addSense', sense: { senseTitle: string, lexicalCategory: string }): void
}>()

const { senses } = defineProps<{
  senses: Sense[],
  editMode: "strict" | "full" | "none"
}>()

const addSense = ref(false)
const newSense = ref({
  senseTitle: '',
  lexicalCategory: ''
})
const lexicalCategories = ref([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'interjection'
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
