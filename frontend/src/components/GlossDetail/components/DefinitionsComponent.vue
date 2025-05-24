<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('definitions') }}
    </div>
    <q-list>
      <q-item
        v-for="(definition, index) in sense.definitions"
        :key="definition.id"
        class="column q-mb-lg"
      >
        <!-- List of definitions -->
        <q-item-label class="row justify-between items-center">
          <q-input
            v-if="editMode !== 'none'"
            v-model="definition.title"
            :label="translate('title')"
            outlined
            dense
            class="col-12 q-mb-sm"
          />
          <div v-else>{{ definition.title }}</div>
          <q-btn v-if="editMode !== 'none'" flat round icon="delete" @click="removeDefinition(index)" />
        </q-item-label>
        <q-item-label>
          <q-input
            v-if="editMode !== 'none'"
            v-model="definition.definition"
            :label="translate('definition')"
            outlined
            
            dense
            class="col-12 q-mb-sm"
          />
          <div v-else>{{ definition.definition }}</div>
          <!-- Definition translations -->
          <q-item
            v-for="(translation, tIndex) in definition.definitionTranslations"
            :key="translation.id"
            class="column"
          >
            <div class="row justify-between items-center q-mb-sm">
              <LanguageSelector 
                v-if="editMode !== 'none'"
                v-model="translation.language" />
              <div v-else>
                <q-chip size="sm">
                  {{ translation.language }}
                </q-chip>
              </div>
              <q-btn v-if="editMode !== 'none'" flat round icon="delete" @click="removeTranslation(definition, tIndex)" />
            </div>
            <q-input
              v-if="editMode !== 'none'"
              v-model="translation.translation"
              :label="translate('translation')"
              outlined
              
              dense
              class="col-12"
            />
            <q-item-label v-else class="q-ml-lg">
              {{ translation.translation }}
            </q-item-label>
          </q-item>
          <q-btn
            v-if="editMode !== 'none'"
            flat
            class="q-mt-sm"
            icon="add"
            :label="translate('addTranslation')"
            @click="addTranslation(definition)"
          />
        </q-item-label>
      </q-item>
      <q-btn v-if="editMode !== 'none'" unelevated outline color="primary" :label="translate('addDefinition')" icon="add" @click="addDefinition" />
    </q-list>
    <!-- Translations of the sense -->
    <div class="column">
      <div class="text-h5 q-mt-md row justify-between items-center">
        {{ translate('translations') }}
        <q-btn v-if="editMode !== 'none'" flat round icon="add" @click="addSenseTranslation" />
      </div>
      <q-list class="row">
        <q-item
          v-for="(translation, index) in sense.senseTranslations"
          :key="translation.id"
          class="col"
          style="min-width: 300px"
        >
          <q-card
            bordered
            flat
            class="col-12 q-pa-md"
          >
            <div class="row justify-between items-center">
              <LanguageSelector 
                v-if="editMode !== 'none'"
                v-model="translation.language" />
              <div v-else>{{ translation.language }}</div>
              <q-btn v-if="editMode !== 'none'" flat round icon="delete" @click="removeSenseTranslation(index)" />
            </div>
            <q-input
              v-if="editMode !== 'none'"
              v-model="translation.translation"
              :label="translate('translation')"
              outlined
              
              dense
              class="col-12 q-mt-sm"
            />
            <q-item-label v-else class="text-h6">
              {{ translation.translation }}
            </q-item-label>
          </q-card>
        </q-item>
      </q-list>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense, Definition, Translation, SenseTranslation } from 'src/types/models';
import translate from 'src/utils/translate';
import LanguageSelector from './LanguageSelector.vue'

const { sense, editMode } = defineProps<{
  sense: Sense;
  editMode: "strict" | "full" | "none";
}>();

const addDefinition = () => {
  sense.definitions.push({
    id: Date.now().toString(),
    title: '',
    definition: '',
    senseId: sense.id || '',
    definitionTranslations: [],
    videoDefinitionId: '',
    videoDefinition: {
      id: '',
      url: ''
    }
  })
}

const removeDefinition = (index: number) => {
  sense.definitions.splice(index, 1)
}

const addTranslation = (definition: Definition) => {
  definition.definitionTranslations.push({
    id: Date.now().toString(),
    language: 'ca',
    translation: '',
    definitionId: definition.id
  })
}

const removeTranslation = (definition: Definition, index: number) => {
  definition.definitionTranslations.splice(index, 1)
}

const addSenseTranslation = () => {
  sense.senseTranslations.push({
    id: Date.now().toString(),
    language: 'ca',
    translation: '',
    senseId: sense.id || ''
  })
}

const removeSenseTranslation = (index: number) => {
  sense.senseTranslations.splice(index, 1)
}
</script>

<style scoped>
.q-item {
  min-height: 40px;
}
</style>
