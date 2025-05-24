<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('examples') }}
    </div>
    <q-list class="column">
      <q-item
        v-for="(example, index) in sense.examples"
        :key="example.id"
        class="column q-mb-lg"
      >
        <q-item-section class="row justify-between no-wrap items-start">
          <q-input
            v-if="editMode !== 'none'"
            v-model="example.example"
            :label="translate('example')"
            outlined
            
            dense
            class="col-12 q-mb-sm"
          />
          <q-item-label v-else class="q-pb-md text-h6 text-weight-bold">
            {{ example.example }}
          </q-item-label>
          <q-btn v-if="editMode !== 'none'" flat round icon="delete" @click="removeExample(index)" />
        </q-item-section>
        <q-item-section>
          <q-list separator>
            <q-item
              v-for="(translation, tIndex) in example.exampleTranslations"
              :key="translation.id"
            >
              <q-item-section>
                <LanguageSelector v-if="editMode !== 'none'" v-model="translation.language" />
                <q-item-label v-else>
                  {{ translation.language }}
                </q-item-label>
              </q-item-section>
              <q-item-section>
                <q-input
                  v-if="editMode !== 'none'"
                  v-model="translation.translation"
                  :label="translate('translation')"
                  outlined
                  
                  dense
                />
                <q-item-label v-else>
                  {{ translation.translation }}
                </q-item-label>
              </q-item-section>
              <q-item-section side v-if="editMode !== 'none'">
                <q-btn flat round icon="delete" @click="removeTranslation(example, tIndex)" />
              </q-item-section>
            </q-item>
            <q-item v-if="editMode !== 'none'">
              <q-item-section>
                <q-btn
                  flat
                  icon="add"
                  :label="translate('addExampleTranslation')"
                  @click="addTranslation(example)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-item-section>
        <q-item-section>
          <q-input
            v-if="editMode !== 'none'"
            v-model="example.exampleVideoURL"
            :label="translate('exampleVideoURL')"
            outlined
            dense
            class="col-12 q-mb-sm"
          />
          <q-btn
            v-else
            outline
            :label="translate('seeExampleVideo')"
            icon="play_arrow"
            :disable="!example.exampleVideoURL"
            @click="openVideo(example.exampleVideoURL)"
          />
        </q-item-section>
      </q-item>
      <q-btn v-if="editMode !== 'none'" unelevated outline color="primary" :label="translate('addExample')" icon="add" @click="addExample" />
    </q-list>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense, Example, ExampleTranslation } from 'src/types/models';
import translate from 'src/utils/translate';
import LanguageSelector from './LanguageSelector.vue';

const { sense, editMode } = defineProps<{
  sense: Sense;
  editMode: "strict" | "full" | "none";
}>();

const addExample = () => {
  sense.examples.push({
    id: Date.now().toString(),
    example: '',
    exampleVideoURL: '',
    senseId: sense.id || '',
    exampleTranslations: []
  })
}

const removeExample = (index: number) => {
  sense.examples.splice(index, 1)
}

const addTranslation = (example: Example) => {
  example.exampleTranslations.push({
    id: Date.now().toString(),
    language: 'ca',
    translation: '',
    exampleId: example.id
  })
}

const removeTranslation = (example: Example, index: number) => {
  example.exampleTranslations.splice(index, 1)
}

const openVideo = (url: string) => {
  window.open(url, '_blank')
}
</script>

