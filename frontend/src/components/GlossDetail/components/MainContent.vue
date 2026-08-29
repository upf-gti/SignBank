<template>
  <q-card-section class="gloss-view-layout">
    <div
      class="gloss-view-layout__body"
      :class="{ 'gloss-view-layout__body--all-videos': showAllVideos }"
    >
      <template v-if="showAllVideos">
        <SignVideosBrowseView
          :gloss-data="glossData"
          @back="showAllVideos = false"
        />
      </template>

      <template v-else>
        <div
          v-if="showSidebar"
          class="gloss-video-column"
        >
          <SignVideoAside
            :gloss-data="glossData"
            :is-compound="isCompound"
            @show-all-videos="showAllVideos = true"
            @show-phonology="selectedTab = 'phonology'"
            @show-compound-phonology="openCompoundPhonology"
          />
        </div>

        <div
          class="gloss-content-column"
          :class="{ 'gloss-content-column--full': !showSidebar }"
        >
          <q-tabs
            v-if="visibleTabs.length > 0"
            v-model="selectedTab"
            class="gloss-content-tabs text-primary q-mb-sm"
            active-color="primary"
            indicator-color="primary"
            dense
            align="left"
            narrow-indicator
            outside-arrows
            mobile-arrows
          >
            <q-tab
              v-if="showDefinitionsTab"
              name="definitions"
              :label="translate('definitions')"
            />
            <q-tab
              v-if="showCompoundTab"
              name="compound"
              :label="translate('compound')"
            />
            <q-tab
              v-if="showPhonologyTab"
              name="phonology"
              :label="translate('signFonology')"
            />
            <q-tab
              v-if="showExamplesTab"
              name="examples"
              :label="translate('examples')"
            />
            <q-tab
              v-if="showRelatedTab"
              name="related"
              :label="translate('relatedGlosses')"
            />
          </q-tabs>

          <div class="gloss-content-scroll">
            <q-tab-panels
              v-if="visibleTabs.length > 0"
              v-model="selectedTab"
              animated
              class="gloss-tab-panels"
            >
              <q-tab-panel
                v-if="showDefinitionsTab"
                name="definitions"
                class="q-pa-none"
              >
                <DefinitionsComponent
                  :gloss-data="glossData"
                  :edit-mode="false"
                  :allow-edit="false"
                  hide-section-title
                  hide-definition-video
                  :hide-gloss-translations="!isCompound"
                />
              </q-tab-panel>

              <q-tab-panel
                v-if="showCompoundTab"
                name="compound"
                class="q-pa-none"
              >
                <CompoundComponent
                  v-model:show-phonology="showCompoundPhonology"
                  :gloss-data="glossData"
                />
              </q-tab-panel>

              <q-tab-panel
                v-if="showPhonologyTab"
                name="phonology"
                class="q-pa-none"
              >
                <PhonologyTabPanel :gloss-data="glossData" />
              </q-tab-panel>

              <q-tab-panel
                v-if="showExamplesTab"
                name="examples"
                class="q-pa-none"
              >
                <ExamplesComponent
                  :gloss-data="glossData"
                  :edit-mode="false"
                  hide-section-title
                  hide-example-video
                />
              </q-tab-panel>

              <q-tab-panel
                v-if="showRelatedTab"
                name="related"
                class="q-pa-none"
              >
                <RelatedGlosses
                  :related-glosses="glossData.relationsAsSource || []"
                  :minimal-pairs="glossData.minimalPairsAsSource || []"
                  :edit-mode="false"
                  :gloss-id="glossData.id || ''"
                  hide-section-title
                />
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </template>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { GlossData } from 'src/types/models'
import SignVideoAside from './SignVideoAside.vue'
import SignVideosBrowseView from './SignVideosBrowseView.vue'
import DefinitionsComponent from './DefinitionsComponent/DefinitionsComponent.vue'
import ExamplesComponent from './ExamplesComponent/ExamplesComponent.vue'
import RelatedGlosses from './RelatedGlosses.vue'
import CompoundComponent from './CompoundComponent.vue'
import PhonologyTabPanel from './PhonologyTabPanel.vue'
import translate from 'src/utils/translate'
import { isCompoundGloss } from 'src/utils/compoundPhonology'
import {
  getVisibleGlossTabs,
  type GlossContentTab,
} from 'src/utils/glossTabVisibility'

const { glossData } = defineProps<{
  glossData: GlossData
}>()

const editMode = false

const isCompound = computed(() => isCompoundGloss(glossData))

const selectedTab = ref<GlossContentTab>('definitions')
const showAllVideos = ref(false)
const showCompoundPhonology = ref(false)

const visibleTabs = computed(() => getVisibleGlossTabs(glossData, {
  editMode,
  isCompound: isCompound.value,
}))

const showDefinitionsTab = computed(() => visibleTabs.value.includes('definitions'))
const showCompoundTab = computed(() => visibleTabs.value.includes('compound'))
const showPhonologyTab = computed(() => visibleTabs.value.includes('phonology'))
const showExamplesTab = computed(() => visibleTabs.value.includes('examples'))
const showRelatedTab = computed(() => visibleTabs.value.includes('related'))

watch(visibleTabs, (tabs) => {
  if (!tabs.includes(selectedTab.value)) {
    selectedTab.value = tabs[0] ?? 'definitions'
  }
}, { immediate: true })

function openCompoundPhonology() {
  selectedTab.value = 'compound'
  showCompoundPhonology.value = true
}

const hasSignVideos = computed(() => (glossData.glossVideos?.length ?? 0) > 0)

const hasGlossTranslations = computed(() =>
  (glossData.glossTranslations?.length ?? 0) > 0
)

const showSidebar = computed(() => {
  if (isCompound.value) {
    return hasSignVideos.value
  }
  return hasSignVideos.value || hasGlossTranslations.value
})
</script>

<style scoped>
.gloss-view-layout {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
  padding-top: 0;
  overflow: hidden;
}

.gloss-view-layout__body {
  display: flex;
  flex: 1 1 0;
  min-height: 0;
  gap: 24px;
  overflow: hidden;
}

.gloss-view-layout__body--all-videos {
  gap: 0;
  min-height: 0;
}

.gloss-video-column {
  display: flex;
  flex-direction: column;
  flex: 0 0 42%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.gloss-content-column {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.gloss-content-column--full {
  width: 100%;
}

.gloss-content-tabs {
  flex: 0 0 auto;
}

.gloss-content-tabs :deep(.q-tab) {
  min-height: 40px;
  padding: 0 12px;
  font-weight: 500;
}

.gloss-content-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.gloss-tab-panels {
  background: transparent;
}

@media (max-width: 1023px) {
  .gloss-view-layout__body:not(.gloss-view-layout__body--all-videos) {
    flex-direction: column;
  }

  .gloss-video-column {
    flex: 0 0 auto;
    width: 100%;
    max-height: calc(var(--sb-video-max-height, 200px) + 72px);
  }

  .gloss-content-column {
    flex: 1 1 0;
    width: 100%;
    min-height: 0;
  }
}
</style>
