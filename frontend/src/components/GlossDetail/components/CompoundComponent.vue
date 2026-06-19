<template>
  <div class="compound-component">
    <div class="row items-center q-mb-md">
      <q-badge
        color="primary"
        :label="translate('compound')"
      />
    </div>

    <div class="text-subtitle2 text-weight-medium q-mb-sm">
      {{ translate('compoundChain') }}
    </div>
    <div class="compound-component__chain q-mb-lg">
      <template
        v-for="(part, index) in parts"
        :key="part.id ?? `${part.position}-${part.gloss}`"
      >
        <q-chip
          dense
          :color="part.linkedGlossId ? 'blue-grey-2' : 'teal-2'"
          text-color="dark"
        >
          <router-link
            v-if="part.linkedGloss?.id"
            :to="`/gloss/${part.linkedGloss.id}`"
            class="compound-component__link"
          >
            {{ part.gloss }}
          </router-link>
          <span v-else>{{ part.gloss }}</span>
        </q-chip>
        <q-icon
          v-if="index < parts.length - 1"
          name="add"
          size="18px"
          class="text-grey-6"
        />
      </template>
      <q-icon
        name="arrow_forward"
        size="18px"
        class="text-grey-6 q-mx-xs"
      />
      <strong>{{ glossData.gloss }}</strong>
    </div>

    <div class="text-subtitle2 text-weight-medium q-mb-sm">
      {{ translate('componentVideos') }}
    </div>
    <div class="compound-component__videos row q-col-gutter-md q-mb-lg">
      <div
        v-for="(entry, index) in partVideos"
        :key="`${entry.position}-${entry.label}-${index}`"
        class="col-12 col-md-6"
      >
        <CompoundPartVideoCard :entry="entry" />
      </div>
    </div>

    <div class="text-subtitle2 text-weight-medium q-mb-sm">
      {{ translate('compoundParts') }}
    </div>

    <q-list
      bordered
      separator
      class="rounded-borders q-mb-lg"
    >
      <q-item
        v-for="part in parts"
        :key="`detail-${part.id ?? part.position}`"
      >
        <q-item-section avatar>
          <q-avatar
            color="primary"
            text-color="white"
            size="32px"
          >
            {{ part.position }}
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ part.gloss }}
          </q-item-label>
          <q-item-label caption>
            <span v-if="part.linkedGlossId">
              {{ translate('linkedGloss') }}
              <template v-if="part.linkedGloss?.isCompound">
                ({{ translate('nestedCompound') }})
              </template>
            </span>
            <span v-else>{{ translate('inlineMorpheme') }}</span>
            <span v-if="part.redundant"> · {{ translate('redundantMorpheme') }}</span>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            v-if="part.linkedGloss?.id"
            flat
            dense
            no-caps
            color="primary"
            :label="translate('viewGloss')"
            :to="`/gloss/${part.linkedGloss.id}`"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn
      unelevated
      color="primary"
      icon="table_chart"
      :label="translate('viewCompoundPhonology')"
      :disable="!hasPhonologyColumns"
      @click="showPhonology = true"
    />

    <CompoundPhonologyDialog
      v-model="showPhonology"
      :gloss-data="glossData"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GlossData } from 'src/types/models';
import translate from 'src/utils/translate';
import {
  flattenCompoundPhonologyColumns,
  resolveCompoundPartVideos,
  sortedCompoundParts,
} from 'src/utils/compoundPhonology';
import CompoundPhonologyDialog from './CompoundPhonologyDialog.vue';
import CompoundPartVideoCard from './CompoundPartVideoCard.vue';

const { glossData } = defineProps<{
  glossData: GlossData;
}>();

const showPhonology = defineModel<boolean>('showPhonology', { default: false });

const parts = computed(() => sortedCompoundParts(glossData));

const partVideos = computed(() => resolveCompoundPartVideos(glossData));

const hasPhonologyColumns = computed(() =>
  flattenCompoundPhonologyColumns(glossData).length > 0,
);
</script>

<style scoped>
.compound-component__chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.compound-component__link {
  color: inherit;
  text-decoration: none;
}

.compound-component__link:hover {
  text-decoration: underline;
}

.compound-component__videos {
  width: 100%;
}
</style>
