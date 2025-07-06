<template>
  <div>
    <q-tabs
      v-model="selectedContent"
      class="text-primary"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
      @update:model-value="handleTabChange"
    >
      <q-tab
        name="definitions"
        :label="translate('definitions')"
      />
      <q-tab
        name="videos"
        :label="translate('videos')"
      />
      <q-tab
        name="examples"
        :label="translate('examples')"
      />
      <q-tab
        name="related"
        :label="translate('relatedGlosses')"
      />
    </q-tabs>

    <q-tab-panels
      v-model="selectedContent"
      animated
    >
      <q-tab-panel name="definitions">
        <DefinitionsComponent
          v-model:sense="sense"
          :edit-mode="editMode"
          :allow-edit="editMode"
          @update:gloss-data="updateGlossData"
        />
      </q-tab-panel>

      <q-tab-panel name="videos">
        <VideosComponent
          v-model="localGlossData"
          :edit-mode="editMode"
          @update:gloss-data="updateGlossData"
        />
      </q-tab-panel>

      <q-tab-panel name="examples">
        <ExamplesComponent
          :sense="sense"
          :edit-mode="editMode"
          @update:gloss-data="updateGlossData"
        />
      </q-tab-panel>

      <q-tab-panel name="related">
        <RelatedGlosses
          :related-glosses="localGlossData.relationsAsSource || []"
          :minimal-pairs="localGlossData.minimalPairsAsSource || []"
          :edit-mode="editMode"
          :gloss-id="localGlossData.id || ''"
          @update:gloss-data="updateGlossData"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import { ref, watch } from 'vue';
import { Sense } from 'src/types/models';
import type { GlossData } from 'src/types/models';
import ExamplesComponent from './ExamplesComponent.vue';
import VideosComponent from './VideosComponent.vue';
import RelatedGlosses from './RelatedGlosses.vue';
import DefinitionsComponent from './DefinitionsComponent/DefinitionsComponent.vue';

const selectedContent = ref<string>('definitions')
const sense = defineModel<Sense>({ required: true })
const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void
}>();

const { glossData, editMode } = defineProps<{
  glossData: GlossData;
  editMode: boolean;
}>();

watch(() => glossData, (newGlossData) => {
  localGlossData.value = newGlossData;
}, { deep: true });

const localGlossData = ref<GlossData>(glossData);

const updateGlossData = (glossData: GlossData) => {
  emit('update:glossData', glossData);
}

const handleTabChange = () => {
  setTimeout(() => {
    
  }, 100);
}
</script>