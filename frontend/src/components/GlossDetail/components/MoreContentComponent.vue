<template>
  <div
    v-if="editMode"
    class="creation-stepper-shell"
  >
    <q-stepper
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
      </q-step>
    </q-stepper>

    <Teleport to="body">
      <footer class="creation-stepper-footer">
        <div class="creation-stepper-footer__inner">
          <div class="creation-stepper-footer__side creation-stepper-footer__side--start">
            <q-btn
              v-if="step !== 'core'"
              flat
              color="primary"
              :label="translate('back')"
              icon="arrow_back"
              :disable="stepLoading || submitting"
              @click="goBack"
            />
          </div>
          <div class="creation-stepper-footer__side creation-stepper-footer__side--end">
            <q-btn
              v-if="step !== 'optional'"
              color="primary"
              unelevated
              :label="translate('next')"
              icon-right="arrow_forward"
              :loading="stepLoading"
              @click="goNext"
            />
            <q-btn
              v-else
              color="primary"
              unelevated
              :icon="isDraft ? 'send' : 'check'"
              :label="isDraft ? translate('sendRequest') : translate('save')"
              :loading="stepLoading || submitting"
              @click="handleFinish"
            />
          </div>
        </div>
      </footer>
    </Teleport>
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

const previousStep: Record<EditorStep, EditorStep | null> = {
  core: null,
  video: 'core',
  compound: 'video',
  optional: 'compound',
};

const nextStep: Record<EditorStep, EditorStep | null> = {
  core: 'video',
  video: 'compound',
  compound: 'optional',
  optional: null,
};

function goBack() {
  const target = previousStep[step.value];
  if (target) {
    step.value = target;
  }
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

async function goNext() {
  const target = nextStep[step.value];
  if (target) {
    await goToStep(target);
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
.creation-stepper-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 72px;
}

.creation-stepper {
  border-radius: var(--sb-card-radius, 12px);
  background: white;
  flex: 1 1 auto;
}
</style>

<style>
.creation-stepper-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  pointer-events: none;
}

.creation-stepper-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 16px;
  box-sizing: border-box;
  pointer-events: auto;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: none;
  border-radius: var(--sb-card-radius, 12px) var(--sb-card-radius, 12px) 0 0;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
}

.creation-stepper-footer__side {
  display: flex;
  align-items: center;
  min-width: 0;
}

.creation-stepper-footer__side--start {
  justify-content: flex-start;
  flex: 1 1 0;
}

.creation-stepper-footer__side--end {
  justify-content: flex-end;
  flex: 1 1 0;
}
</style>
