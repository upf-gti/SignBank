<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('definitions') }}
    </div>
    <q-list>
      <q-item
        v-for="(definition, index) in sense.definitions"
        :key="definition.id || index"
        class="column q-mb-lg"
      >
        <!-- List of definitions -->
        <q-item-label class="row justify-between items-center">
          <q-btn
            v-if="editMode !== 'none'"
            flat
            round
            icon="delete"
            :label="translate('deleteDefinition')"
            class="float-right"
            @click="removeDefinition(index)"
          />
          <q-input
            v-if="editMode !== 'none'"
            v-model="definition.title"
            :label="translate('definitionTitle')"
            outlined
            dense
            class="col-12 q-mb-sm"
          />
          <div v-else>
            {{ definition.title }}
          </div>
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
          <div v-else>
            {{ definition.definition }}
          </div>
          <!-- Definition translations -->
          <q-item
            v-for="(translation, tIndex) in definition.definitionTranslations"
            :key="translation.id || tIndex"
            class="column"
          >
            <div class="row justify-between items-center q-mb-sm">
              <LanguageSelector 
                v-if="editMode !== 'none'"
                v-model="translation.language"
                class="col"
              />
              <div v-else>
                <q-chip size="sm">
                  {{ translation.language }}
                </q-chip>
              </div>
              <q-btn
                v-if="editMode !== 'none'"
                flat
                round
                icon="delete"
                :label="translate('deleteDefinitionTranslation')"
                class="q-mx-md"
                @click="removeTranslation(definition, tIndex)"
              />
            </div>
            <q-input
              v-if="editMode !== 'none'"
              v-model="translation.translation"
              :label="translate('translation')"
              outlined
              dense
              class="col-12"
            />
            <q-item-label
              v-else
              class="q-ml-lg"
            >
              {{ translation.translation }}
            </q-item-label>
          </q-item>
          <q-btn
            v-if="editMode !== 'none'"
            flat
            class="q-mt-sm"
            icon="add"
            :label="translate('addDefinitionTranslation')"
            @click="addTranslation(definition)"
          />
        </q-item-label>
      </q-item>
      <q-btn
        v-if="editMode !== 'none'"
        unelevated
        outline
        color="primary"
        :label="translate('addDefinition')"
        icon="add"
        @click="addDefinition"
      />
    </q-list>
    <!-- Translations of the sense -->
    <div class="column">
      <div class="text-h5 q-mt-md row justify-between items-center">
        {{ translate('glossTranslations') }}
        <q-btn
          v-if="editMode !== 'none'"
          flat
          round
          icon="add"
          :label="translate('addGlossTranslation')"
          @click="addSenseTranslation"
        />
      </div>
      <q-list class="row">
        <q-item
          v-for="(translation, index) in sense.senseTranslations"
          :key="translation.id || index"
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
                v-model="translation.language"
                class="col"
              />
              <div v-else>
                {{ translation.language }}
              </div>
              <q-btn
                v-if="editMode !== 'none'"
                flat
                round
                icon="delete"
                :label="translate('deleteGlossTranslation')"
                class="q-mx-md"
                @click="removeSenseTranslation(index)"
              />
            </div>
            <q-input
              v-if="editMode !== 'none'"
              v-model="translation.translation"
              :label="translate('translation')"
              outlined
              
              dense
              class="col-12 q-mt-sm"
            />
            <q-item-label
              v-else
              class="text-h6"
            >
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

const sense = defineModel<Sense>({ required: true })
const { editMode } = defineProps<{
  editMode: "strict" | "full" | "none";
}>();

const addDefinition = () => {
  sense.value.definitions.push({
    id: Date.now().toString(),
    title: '',
    definition: '',
    senseId: sense.value.id || '',
    definitionTranslations: [],
    videoDefinitionId: '',
    videoDefinition: {
      id: '',
      url: ''
    }
  })
}

const removeDefinition = (index: number) => {
  sense.value.definitions.splice(index, 1)
}

const addTranslation = (definition: Definition) => {
  definition.definitionTranslations.push({
    id: Date.now().toString(),
    language: 'CATALAN',
    translation: '',
    definitionId: definition.id || ''
  })
}

const removeTranslation = (definition: Definition, index: number) => {
  definition.definitionTranslations.splice(index, 1)
}

const addSenseTranslation = () => {
  sense.value.senseTranslations.push({
    id: Date.now().toString(),
    language: 'CATALAN',
    translation: '',
    senseId: sense.value.id || ''
  })
}

const removeSenseTranslation = (index: number) => {
  sense.value.senseTranslations.splice(index, 1)
}
</script>

<style scoped>
.q-item {
  min-height: 40px;
}
</style>
