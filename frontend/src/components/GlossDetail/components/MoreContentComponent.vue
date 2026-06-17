<template>
  <div>
    <!-- Draft creation: guided stepper -->
    <q-stepper
      v-if="isDraft"
      v-model="step"
      color="primary"
      animated
      flat
      bordered
      class="creation-stepper"
    >
      <q-step
        :name="1"
        :title="translate('stepCore')"
        icon="description"
        :done="step > 1"
      >
        <DefinitionsComponent
          :gloss-data="localGlossData"
          :edit-mode="editMode"
          :allow-edit="editMode"
          :inline-edit="true"
          @update:gloss-data="updateGlossData"
        />

        <q-stepper-navigation class="row justify-end q-mt-md">
          <q-btn
            color="primary"
            unelevated
            :label="translate('next')"
            icon-right="arrow_forward"
            @click="step = 2"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        :title="translate('stepVideo')"
        icon="videocam"
        :done="step > 2"
      >
        <VideosComponent
          v-model="localGlossData"
          :edit-mode="editMode"
          :inline-edit="true"
          @update:gloss-data="updateGlossData"
        />

        <q-stepper-navigation class="row justify-between q-mt-md">
          <q-btn
            flat
            color="primary"
            :label="translate('back')"
            icon="arrow_back"
            @click="step = 1"
          />
          <q-btn
            color="primary"
            unelevated
            :label="translate('next')"
            icon-right="arrow_forward"
            @click="step = 3"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="3"
        :title="translate('stepOptional')"
        icon="more_horiz"
        optional
      >
        <q-expansion-item
          expand-separator
          icon="format_quote"
          :label="translate('examples')"
          header-class="text-subtitle1"
          default-opened
        >
          <ExamplesComponent
            :gloss-data="localGlossData"
            :edit-mode="editMode"
            :inline-edit="true"
            @update:gloss-data="updateGlossData"
          />
        </q-expansion-item>

        <q-expansion-item
          expand-separator
          icon="link"
          :label="translate('relatedGlosses')"
          header-class="text-subtitle1"
        >
          <RelatedGlosses
            :related-glosses="localGlossData.relationsAsSource || []"
            :minimal-pairs="localGlossData.minimalPairsAsSource || []"
            :edit-mode="editMode"
            :gloss-id="localGlossData.id || ''"
            @update:gloss-data="updateGlossData"
          />
        </q-expansion-item>

        <q-stepper-navigation class="row justify-start q-mt-md">
          <q-btn
            flat
            color="primary"
            :label="translate('back')"
            icon="arrow_back"
            @click="step = 2"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <!-- Published / read-only: tabbed layout -->
    <template v-else>
      <q-tabs
        v-model="selectedContent"
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
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
            :gloss-data="localGlossData"
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
            :gloss-data="localGlossData"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import { ref, watch } from 'vue';
import type { GlossData } from 'src/types/models';
import ExamplesComponent from './ExamplesComponent/ExamplesComponent.vue';
import VideosComponent from './VideosComponent.vue';
import RelatedGlosses from './RelatedGlosses.vue';
import DefinitionsComponent from './DefinitionsComponent/DefinitionsComponent.vue';

const selectedContent = ref<string>('definitions')
const step = ref(1)

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void
}>();

const { glossData, editMode, isDraft = false } = defineProps<{
  glossData: GlossData;
  editMode: boolean;
  isDraft?: boolean;
}>();

const localGlossData = ref<GlossData>(glossData);

watch(() => glossData, (newGlossData) => {
  localGlossData.value = newGlossData;
}, { deep: true });

const updateGlossData = (updated: GlossData) => {
  localGlossData.value = updated;
  emit('update:glossData', updated);
}
</script>

<style scoped>
.creation-stepper {
  border-radius: var(--sb-card-radius, 12px);
  background: white;
}
</style>
