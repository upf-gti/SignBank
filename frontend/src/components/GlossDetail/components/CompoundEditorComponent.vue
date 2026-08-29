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
        <div class="row items-center q-gutter-sm">
          <q-btn
            v-if="parts.length > 1"
            flat
            no-caps
            color="primary"
            icon="swap_vert"
            :label="translate('sortCompoundParts')"
            @click="openReorderDialog"
          />
          <q-btn
            flat
            no-caps
            color="primary"
            icon="add"
            :label="translate('addCompoundPart')"
            @click="addPart"
          />
        </div>
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
          header-class="text-weight-medium"
        >
          <template #header>
            <q-item-section avatar>
              <q-avatar
                color="primary"
                text-color="white"
                size="32px"
              >
                {{ index + 1 }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ partLabel(part) }}</q-item-label>
              <q-item-label caption>
                {{ partCaption(part) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                :aria-label="translate('removeCompoundPart')"
                @click.stop="confirmRemovePart(index)"
              >
                <q-tooltip>{{ translate('removeCompoundPart') }}</q-tooltip>
              </q-btn>
            </q-item-section>
          </template>

          <q-card flat>
            <q-card-section class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="part.gloss"
                    :label="translate('compoundPartGloss')"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
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
              </div>

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
                <div class="inline-morpheme-editor">
                  <aside class="inline-morpheme-editor__video">
                    <div class="text-subtitle2 text-weight-medium q-mb-sm">
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
                        :compact="true"
                        hide-angles
                        @update:sign-video="(value) => updateInlineSignVideo(part, value)"
                      />
                    </q-card>
                  </aside>

                  <section
                    v-if="part.inlinePhonology"
                    class="inline-morpheme-editor__phonology"
                  >
                    <SignFonologyComponent
                      :key="`${part.id || index}-phonology`"
                      :video-data="part.inlinePhonology"
                      :edit-mode="true"
                      :compact="false"
                      natural-height
                      @update:video-data="(value) => updateInlinePhonology(part, value)"
                    />
                  </section>
                </div>
              </template>
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

    <q-dialog v-model="showReorderDialog">
      <q-card style="min-width: 420px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">
            {{ translate('sortCompoundParts') }}
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">
            {{ translate('sortCompoundPartsHint') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list
            bordered
            separator
            class="rounded-borders"
          >
            <q-item
              v-for="(part, index) in reorderDraft"
              :key="part.id || `reorder-${index}`"
            >
              <q-item-section avatar>
                <q-avatar
                  color="grey-3"
                  text-color="dark"
                  size="28px"
                >
                  {{ index + 1 }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ part.gloss?.trim() || translate('compoundPartGloss') }}
                </q-item-label>
                <q-item-label caption>
                  {{ part.partKind === 'linked' ? translate('partTypeLinked') : translate('partTypeInline') }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="arrow_upward"
                  :disable="index === 0"
                  :aria-label="translate('moveUp')"
                  @click="movePartInDraft(index, -1)"
                >
                  <q-tooltip>{{ translate('moveUp') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="arrow_downward"
                  :disable="index === reorderDraft.length - 1"
                  :aria-label="translate('moveDown')"
                  @click="movePartInDraft(index, 1)"
                >
                  <q-tooltip>{{ translate('moveDown') }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            :label="translate('cancel')"
            color="primary"
          />
          <q-btn
            unelevated
            :label="translate('save')"
            color="primary"
            @click="applyReorder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
  initializeInlineMorpheme,
  type EditableCompoundPart,
} from 'src/utils/compoundEditor';

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
const showReorderDialog = ref(false);
const reorderDraft = ref<EditableCompoundPart[]>([]);

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
    linkedGloss: part.linkedGloss ?? null,
    inlinePhonology: part.partKind === 'inline' ? part.inlinePhonology ?? null : null,
    inlineSignVideo: part.partKind === 'inline' ? part.inlineSignVideo ?? null : null,
  })),
}));

const hasPhonologyPreview = computed(() =>
  flattenCompoundPhonologyColumns(previewGlossData.value).length > 0,
);

function partLabel(part: EditableCompoundPart) {
  return part.gloss?.trim() || translate('compoundPartGloss');
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

function confirmRemovePart(index: number) {
  const part = parts.value[index];
  const label = part?.gloss?.trim() || translate('compoundPartGloss');

  $q.dialog({
    title: translate('confirmDelete'),
    message: translate('confirmDeleteCompoundPartMessage', { part: label }),
    cancel: {
      label: translate('cancel'),
      flat: true,
      color: 'primary',
    },
    ok: {
      label: translate('removeCompoundPart'),
      flat: true,
      color: 'negative',
    },
  }).onOk(() => {
    removePart(index);
  });
}

function openReorderDialog() {
  reorderDraft.value = parts.value.map((part) => ({ ...part }));
  showReorderDialog.value = true;
}

function movePartInDraft(index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= reorderDraft.value.length) return;
  const copy = [...reorderDraft.value];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  reorderDraft.value = copy;
}

function applyReorder() {
  reorderDraft.value.forEach((part, idx) => {
    part.position = idx + 1;
  });
  parts.value = reorderDraft.value;
  showReorderDialog.value = false;
}

function onPartKindChange(part: EditableCompoundPart) {
  if (part.partKind === 'linked') {
    part.inlinePhonology = null;
    part.inlineSignVideo = null;
    return;
  }
  part.linkedGlossId = null;
  part.linkedGloss = null;
  const inline = initializeInlineMorpheme(part.gloss, part.inlineSignVideo);
  part.inlinePhonology = inline.inlinePhonology;
  part.inlineSignVideo = inline.inlineSignVideo;
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
  if (value.videoData) {
    part.inlinePhonology = { ...value.videoData };
  }
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

.inline-morpheme-editor {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
}

.inline-morpheme-editor__video {
  flex: 0 0 34%;
  max-width: 380px;
  min-width: 0;
}

.inline-morpheme-editor__phonology {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--sb-card-radius, 12px);
  padding: 16px 20px;
  background: var(--sb-surface);
}

.inline-morpheme-editor__phonology :deep(.sign-phonology) {
  margin-top: 0;
}

@media (max-width: 1023px) {
  .inline-morpheme-editor {
    flex-direction: column;
  }

  .inline-morpheme-editor__video {
    flex: 0 0 auto;
    max-width: none;
    width: 100%;
  }
}
</style>
