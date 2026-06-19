<template>
  <div>
    <q-stepper
      v-if="editMode"
      v-model="step"
      color="primary"
      animated
      flat
      bordered
      class="creation-stepper"
    >
      <q-step
        name="core"
        :title="translate('stepCore')"
        icon="description"
        :done="step !== 'core'"
      >
        <DefinitionsComponent
          ref="definitionsRef"
          :gloss-data="localGlossData"
          :edit-mode="editMode"
          :allow-edit="editMode"
          :inline-edit="true"
          :hide-gloss-translations="Boolean(localGlossData.isCompound)"
          @update:gloss-data="updateGlossData"
        />

        <q-stepper-navigation class="row justify-end q-mt-md">
          <q-btn
            color="primary"
            unelevated
            :label="translate('next')"
            icon-right="arrow_forward"
            :loading="stepLoading"
            @click="goToStep('video')"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        name="video"
        :title="translate('stepVideo')"
        icon="videocam"
        :done="step === 'compound' || step === 'optional'"
      >
        <VideosComponent
          ref="videosRef"
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
            :disable="stepLoading"
            @click="step = 'core'"
          />
          <q-btn
            color="primary"
            unelevated
            :label="translate('next')"
            icon-right="arrow_forward"
            :loading="stepLoading"
            @click="goToStep('compound')"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        name="compound"
        :title="translate('stepCompound')"
        icon="call_merge"
        :done="step === 'optional'"
      >
        <CompoundEditorComponent
          ref="compoundRef"
          :gloss-data="localGlossData"
          @update:gloss-data="updateGlossData"
        />

        <q-stepper-navigation class="row justify-between q-mt-md">
          <q-btn
            flat
            color="primary"
            :label="translate('back')"
            icon="arrow_back"
            :disable="stepLoading"
            @click="step = 'video'"
          />
          <q-btn
            color="primary"
            unelevated
            :label="translate('next')"
            icon-right="arrow_forward"
            :loading="stepLoading"
            @click="goToStep('optional')"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        name="optional"
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
            ref="examplesRef"
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

        <q-stepper-navigation class="row justify-between q-mt-md">
          <q-btn
            flat
            color="primary"
            :label="translate('back')"
            icon="arrow_back"
            :disable="stepLoading || submitting"
            @click="step = 'compound'"
          />
          <q-btn
            color="primary"
            unelevated
            :icon="isDraft ? 'send' : 'check'"
            :label="isDraft ? translate('sendRequest') : translate('save')"
            :loading="stepLoading || submitting"
            @click="handleFinish"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import { ref, watch } from 'vue';
import type { GlossData } from 'src/types/models';
import { useQuasar } from 'quasar';
import ExamplesComponent from './ExamplesComponent/ExamplesComponent.vue';
import VideosComponent from './VideosComponent.vue';
import RelatedGlosses from './RelatedGlosses.vue';
import DefinitionsComponent from './DefinitionsComponent/DefinitionsComponent.vue';
import CompoundEditorComponent from './CompoundEditorComponent.vue';

type EditorStep = 'core' | 'video' | 'compound' | 'optional';

const $q = useQuasar();
const step = ref<EditorStep>('core');
const stepLoading = ref(false);

const definitionsRef = ref<InstanceType<typeof DefinitionsComponent> | null>(null);
const videosRef = ref<InstanceType<typeof VideosComponent> | null>(null);
const compoundRef = ref<InstanceType<typeof CompoundEditorComponent> | null>(null);
const examplesRef = ref<InstanceType<typeof ExamplesComponent> | null>(null);

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void
  (e: 'submitRequest'): void
  (e: 'finishEdit'): void
}>();

const { glossData, editMode, isDraft = false, submitting = false } = defineProps<{
  glossData: GlossData;
  editMode: boolean;
  isDraft?: boolean;
  submitting?: boolean;
}>();

const localGlossData = ref<GlossData>(glossData);

watch(() => glossData, (newGlossData) => {
  localGlossData.value = newGlossData;
}, { deep: true });

watch(() => editMode, (isEditing) => {
  if (isEditing) {
    step.value = 'core';
  }
});

const updateGlossData = (updated: GlossData) => {
  localGlossData.value = updated;
  emit('update:glossData', updated);
};

function showValidationErrors(errors: string[]) {
  $q.dialog({
    title: translate('validationErrors'),
    message: `
      <ul style="list-style-type: disc; margin: 0; padding-left: 20px;">
        ${errors.map(error => `<li>${error}</li>`).join('')}
      </ul>
    `,
    html: true,
    style: 'min-width: 300px',
    ok: {
      label: translate('ok'),
      flat: true,
      color: 'primary',
    },
  });
}

async function goToStep(targetStep: EditorStep) {
  stepLoading.value = true;
  try {
    if (targetStep === 'video') {
      const errors = definitionsRef.value?.getStepValidationErrors() ?? [];
      if (errors.length > 0) {
        showValidationErrors(errors);
        return;
      }
      const saved = await definitionsRef.value?.saveAll(true);
      if (saved === false) return;
    }

    if (targetStep === 'compound' || targetStep === 'optional') {
      const errors = videosRef.value?.getStepValidationErrors() ?? [];
      if (errors.length > 0) {
        showValidationErrors(errors);
        return;
      }
      await videosRef.value?.saveAll(true);
    }

    if (targetStep === 'optional') {
      const errors = compoundRef.value?.getStepValidationErrors() ?? [];
      if (errors.length > 0) {
        showValidationErrors(errors);
        return;
      }
      const saved = await compoundRef.value?.saveAll(true);
      if (!saved) return;
    }

    step.value = targetStep;
  } finally {
    stepLoading.value = false;
  }
}

async function handleFinish() {
  stepLoading.value = true;
  try {
    const compoundSaved = await compoundRef.value?.saveAll(true);
    if (compoundSaved === false) return;

    await examplesRef.value?.saveAll(true);

    if (isDraft) {
      emit('submitRequest');
    } else {
      emit('finishEdit');
    }
  } finally {
    stepLoading.value = false;
  }
}
</script>

<style scoped>
.creation-stepper {
  border-radius: var(--sb-card-radius, 12px);
  background: white;
}
</style>
