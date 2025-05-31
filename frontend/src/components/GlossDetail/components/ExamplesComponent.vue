<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('examples') }}
    </div>
    <q-list
      class="column"
      separator
    >
      <q-item
        v-for="(example, index) in sense.examples"
        :key="example.id"
        class="column q-mb-lg"
      >
        <div class="row justify-between no-wrap items-start full-width no-wrap">
          <q-input
            v-if="editMode"
            v-model="example.example"
            :label="translate('example')"
            outlined            
            dense
            class="col q-mb-sm"
          />
          <q-item-label
            v-else
            class="q-pb-md text-h6 text-weight-bold"
          >
            {{ example.example }}
          </q-item-label>
          <q-btn
            v-if="editMode"
            outline
            icon="delete"
            :label="translate('deleteExample')"
            class="q-mx-sm"
            color="negative"
            @click="removeExample(index)"
          />
        </div>
        <div class="row justify-between no-wrap items-start full-width">
          <div class="col">
            <div
              v-for="(translation, tIndex) in example.exampleTranslations"
              :key="translation.id"
              class="row justify-between no-wrap items-center q-mb-sm"
            >
              <div class="col">
                <LanguageSelector
                  v-if="editMode"
                  v-model="translation.language"
                  class="q-mb-sm"
                />
                <div v-else>
                  <q-chip size="sm">
                    {{ translation.language }}
                  </q-chip>
                </div>
                <q-input
                  v-if="editMode"
                  v-model="translation.translation"
                  :label="translate('translation')"
                  outlined
                  dense
                />
                <div v-else>
                  {{ translation.translation }}
                </div>
              </div>
              <q-btn
                v-if="editMode"
                flat
                round
                icon="delete"
                :label="translate('deleteExampleTranslation')"
                class="q-mx-sm"
                @click="removeTranslation(example, tIndex)"
              />
            </div>
            <q-btn
              v-if="editMode"
              flat
              :label="translate('addExampleTranslation')"
              icon="add"
              @click="addTranslation(example)"
            />
          </div>
        </div>
        <q-item-section>
          <UploadVideoComponent
            v-if="editMode"
            v-model:show-dialog="showUploadDialog"
            @upload-complete="uploadVideo"
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
      <q-btn
        v-if="editMode"
        outline
        color="primary"
        :label="translate('addExample')"
        icon="add"
        @click="addExample"
      />
    </q-list>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense, Example, ExampleTranslation } from 'src/types/models';
import translate from 'src/utils/translate';
import LanguageSelector from './LanguageSelector.vue';
import UploadVideoComponent from 'src/components/UploadVideoPopup.vue'

const sense = defineModel<Sense>({ required: true })
const { editMode } = defineProps<{
  editMode: boolean;
}>();

const addExample = () => {
  sense.value.examples.push({
    id: Date.now().toString(),
    example: '',
    exampleVideoURL: '',
    senseId: sense.value.id || '',
    exampleTranslations: []
  })
}

const removeExample = (index: number) => {
  sense.value.examples.splice(index, 1)
}

const addTranslation = (example: Example) => {
  example.exampleTranslations.push({
    id: Date.now().toString(),
    language: 'CATALAN',
    translation: '',
    exampleId: example.id || ''
  })
}

const removeTranslation = (example: Example, index: number) => {
  example.exampleTranslations.splice(index, 1)
  sense.value.examples.splice(index, 1)
}

const openVideo = (url: string) => {
  window.open(url, '_blank')
}
</script>

