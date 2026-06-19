<template>
  <div class="compound-editor">
    <div class="row items-center q-mb-md q-gutter-md">
      <q-toggle
        v-model="isCompound"
        :label="translate('isCompoundSign')"
        color="primary"
      />
      <q-input
        v-if="isCompound"
        v-model="iconicity"
        :label="translate('iconicity')"
        outlined
        dense
        class="col-grow"
        style="max-width: 360px"
      />
    </div>

    <template v-if="isCompound">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle1 text-weight-medium">
          {{ translate('compoundParts') }}
        </div>
        <q-btn
          flat
          no-caps
          color="primary"
          icon="add"
          :label="translate('addCompoundPart')"
          @click="addPart"
        />
      </div>

      <q-banner
        v-if="!parts.length"
        dense
        rounded
        class="bg-grey-2 text-grey-8 q-mb-md"
      >
        {{ translate('noCompoundPartsYet') }}
      </q-banner>

      <q-list
        bordered
        separator
        class="rounded-borders q-mb-md"
      >
        <q-expansion-item
          v-for="(part, index) in parts"
          :key="part.id || `new-${index}`"
          expand-separator
          :label="partLabel(part, index)"
          :caption="partCaption(part)"
          header-class="text-weight-medium"
        >
          <q-card flat>
            <q-card-section class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="part.gloss"
                    :label="translate('compoundPartGloss')"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="part.partKind"
                    :options="partKindOptions"
                    :label="translate('compoundPartType')"
                    outlined
                    dense
                    emit-value
                    map-options
                    @update:model-value="onPartKindChange(part)"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="part.compExternalId"
                    :label="translate('compExternalId')"
                    outlined
                    dense
                    clearable
                  />
                </div>
              </div>

              <q-toggle
                v-model="part.redundant"
                :label="translate('redundantMorpheme')"
                dense
              />

              <template v-if="part.partKind === 'linked'">
                <div class="row items-center q-gutter-sm">
                  <q-chip
                    v-if="part.linkedGloss?.gloss"
                    color="blue-grey-2"
                    text-color="dark"
                  >
                    {{ part.linkedGloss.gloss }}
                  </q-chip>
                  <span
                    v-else
                    class="text-grey-7 text-body2"
                  >
                    {{ translate('noLinkedGlossSelected') }}
                  </span>
                  <q-btn
                    flat
                    no-caps
                    color="primary"
                    icon="search"
                    :label="translate('selectLinkedGloss')"
                    @click="openGlossSearch(index)"
                  />
                  <q-btn
                    v-if="part.linkedGlossId"
                    flat
                    no-caps
                    color="negative"
                    icon="link_off"
                    :label="translate('clearLinkedGloss')"
                    @click="clearLinkedGloss(part)"
                  />
                </div>
              </template>

              <template v-else>
                <div class="text-subtitle2 text-weight-medium">
                  {{ translate('inlineMorphemePhonology') }}
                </div>
                <SignFonologyComponent
                  v-if="part.inlinePhonology"
                  :video-data="part.inlinePhonology"
                  :edit-mode="true"
                  @update:video-data="(value) => updateInlinePhonology(part, value)"
                />

                <div class="text-subtitle2 text-weight-medium q-mt-md">
                  {{ translate('inlineMorphemeVideo') }}
                </div>
                <q-card
                  v-if="part.inlineSignVideo"
                  flat
                  bordered
                >
                  <GlossVideoComponent
                    :sign-video="part.inlineSignVideo"
                    :edit-mode="true"
                    compact
                    @update:sign-video="(value) => updateInlineSignVideo(part, value)"
                  />
                </q-card>
              </template>

              <div class="row justify-end q-gutter-sm">
                <q-btn
                  v-if="index > 0"
                  flat
                  dense
                  icon="keyboard_arrow_up"
                  @click="movePart(index, -1)"
                />
                <q-btn
                  v-if="index < parts.length - 1"
                  flat
                  dense
                  icon="keyboard_arrow_down"
                  @click="movePart(index, 1)"
                />
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="delete"
                  :label="translate('removeCompoundPart')"
                  @click="removePart(index)"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>

      <q-btn
        unelevated
        color="primary"
        icon="table_chart"
        :label="translate('viewCompoundPhonology')"
        :disable="!hasPhonologyPreview"
        class="q-mb-md"
        @click="showPhonologyPreview = true"
      />
    </template>

    <GlossSearch
      v-model="showGlossSearch"
      :title="translate('selectLinkedGloss')"
      @select="handleLinkedGlossSelect"
    />

    <CompoundPhonologyDialog
      v-model="showPhonologyPreview"
      :gloss-data="previewGlossData"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { GlossData, PhonologyData, SignVideo } from 'src/types/models';
import type { SearchResult } from 'src/services/search.service';
import translate from 'src/utils/translate';
import api from 'src/services/api';
import { useQuasar } from 'quasar';
import GlossSearch from './GlossSearch.vue';
import SignFonologyComponent from './SignFonologyComponent.vue';
import GlossVideoComponent from './GlossVideoComponent.vue';
import CompoundPhonologyDialog from './CompoundPhonologyDialog.vue';
import { flattenCompoundPhonologyColumns } from 'src/utils/compoundPhonology';
import {
  buildCompoundUpdatePayload,
  createEmptyEditablePart,
  editablePartsFromGloss,
  type EditableCompoundPart,
} from 'src/utils/compoundEditor';
import { createDefaultPhonology } from 'src/utils/defaultPhonology';

const props = defineProps<{
  glossData: GlossData;
}>();

const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void;
}>();

const $q = useQuasar();

const isCompound = ref(Boolean(props.glossData.isCompound));
const iconicity = ref(props.glossData.iconicity ?? '');
const parts = ref<EditableCompoundPart[]>(editablePartsFromGloss(props.glossData));
const showGlossSearch = ref(false);
const glossSearchPartIndex = ref<number | null>(null);
const showPhonologyPreview = ref(false);

const partKindOptions = [
  { label: translate('partTypeLinked'), value: 'linked' },
  { label: translate('partTypeInline'), value: 'inline' },
];

watch(() => props.glossData, (gloss) => {
  isCompound.value = Boolean(gloss.isCompound);
  iconicity.value = gloss.iconicity ?? '';
  parts.value = editablePartsFromGloss(gloss);
}, { deep: true });

const previewGlossData = computed<GlossData>(() => ({
  ...props.glossData,
  isCompound: isCompound.value,
  iconicity: iconicity.value || null,
  compoundParts: parts.value.map((part, index) => ({
    id: part.id,
    position: index + 1,
    gloss: part.gloss,
    compExternalId: part.compExternalId ?? null,
    linkedGlossId: part.partKind === 'linked' ? part.linkedGlossId ?? null : null,
    redundant: part.redundant ?? false,
    linkedGloss: part.linkedGloss ?? null,
    inlinePhonology: part.partKind === 'inline' ? part.inlinePhonology ?? null : null,
    inlineSignVideo: part.partKind === 'inline' ? part.inlineSignVideo ?? null : null,
  })),
}));

const hasPhonologyPreview = computed(() =>
  flattenCompoundPhonologyColumns(previewGlossData.value).length > 0,
);

function partLabel(part: EditableCompoundPart, index: number) {
  const name = part.gloss?.trim() || translate('compoundPartGloss');
  return `${index + 1}. ${name}`;
}

function partCaption(part: EditableCompoundPart) {
  return part.partKind === 'linked'
    ? translate('partTypeLinked')
    : translate('partTypeInline');
}

function addPart() {
  parts.value.push(createEmptyEditablePart(parts.value.length + 1));
}

function removePart(index: number) {
  parts.value.splice(index, 1);
  parts.value.forEach((part, idx) => {
    part.position = idx + 1;
  });
}

function movePart(index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= parts.value.length) return;
  const copy = [...parts.value];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  copy.forEach((part, idx) => {
    part.position = idx + 1;
  });
  parts.value = copy;
}

function onPartKindChange(part: EditableCompoundPart) {
  if (part.partKind === 'linked') {
    part.inlinePhonology = null;
    part.inlineSignVideo = null;
    return;
  }
  part.linkedGlossId = null;
  part.linkedGloss = null;
  part.inlinePhonology = createDefaultPhonology();
  const phonology = part.inlinePhonology;
  part.inlineSignVideo = {
    id: '',
    title: part.gloss,
    priority: 1,
    videoDataId: phonology.id || '',
    videos: [{
      id: crypto.randomUUID(),
      angle: 'front',
      url: '',
      priority: 1,
    }],
    minimalPairs: [],
    videoData: phonology,
  };
}

function openGlossSearch(index: number) {
  glossSearchPartIndex.value = index;
  showGlossSearch.value = true;
}

function handleLinkedGlossSelect(result: SearchResult) {
  const index = glossSearchPartIndex.value;
  if (index == null) return;
  const part = parts.value[index];
  if (!part) return;
  part.linkedGlossId = result.glossId;
  part.linkedGloss = {
    id: result.glossId,
    gloss: result.gloss,
  } as GlossData;
  if (!part.gloss?.trim()) {
    part.gloss = result.gloss;
  }
}

function clearLinkedGloss(part: EditableCompoundPart) {
  part.linkedGlossId = null;
  part.linkedGloss = null;
}

function updateInlinePhonology(part: EditableCompoundPart, value: PhonologyData) {
  part.inlinePhonology = value;
  if (part.inlineSignVideo) {
    part.inlineSignVideo.videoData = value;
    part.inlineSignVideo.videoDataId = value.id || part.inlineSignVideo.videoDataId;
  }
}

function updateInlineSignVideo(part: EditableCompoundPart, value: SignVideo) {
  part.inlineSignVideo = value;
}

function getStepValidationErrors(): string[] {
  if (!isCompound.value) return [];

  const errors: string[] = [];
  if (!parts.value.length) {
    errors.push(translate('validation.compoundPartsRequired'));
    return errors;
  }

  parts.value.forEach((part, index) => {
    const label = part.gloss?.trim() || `#${index + 1}`;
    if (!part.gloss?.trim()) {
      errors.push(translate('validation.compoundPartGlossRequired', { part: label }));
    }
    if (part.partKind === 'linked' && !part.linkedGlossId) {
      errors.push(translate('validation.compoundPartLinkedRequired', { part: label }));
    }
    if (part.partKind === 'inline' && !part.inlinePhonology) {
      errors.push(translate('validation.compoundPartPhonologyRequired', { part: label }));
    }
  });

  return errors;
}

async function saveAll(silent = false): Promise<boolean> {
  if (!props.glossData.id) return false;

  const errors = getStepValidationErrors();
  if (isCompound.value && errors.length > 0) {
    if (!silent) {
      $q.notify({ type: 'negative', message: errors[0] });
    }
    return false;
  }

  try {
    const payload = buildCompoundUpdatePayload(
      {
        ...props.glossData,
        isCompound: isCompound.value,
        iconicity: iconicity.value || null,
      },
      isCompound.value ? parts.value : [],
    );
    const response = await api.compound.update(props.glossData.id, payload);
    emit('update:glossData', response.data);
    if (!silent) {
      $q.notify({ type: 'positive', message: translate('compoundSavedSuccessfully') });
    }
    return true;
  } catch (error) {
    console.error('Error saving compound:', error);
    if (!silent) {
      $q.notify({ type: 'negative', message: translate('errors.failedToSaveCompound') });
    }
    return false;
  }
}

defineExpose({ saveAll, getStepValidationErrors });
</script>

<style scoped>
.compound-editor {
  width: 100%;
}
</style>
