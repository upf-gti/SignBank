<template>
  <q-card-section class="gloss-view-layout">
    <div
      v-if="primaryDefinition"
      class="row justify-start items-center q-mb-md gloss-view-layout__header"
    >
      <q-chip
        outline
        color="primary"
      >
        {{ translate(primaryDefinition.lexicalCategory) }}
      </q-chip>
      <span class="text-h6 q-ml-sm">
        {{ primaryDefinition.title || glossData.gloss }}
      </span>
    </div>

    <div
      class="gloss-view-layout__body"
      :class="{ 'gloss-view-layout__body--all-videos': showAllVideos }"
    >
      <template v-if="showAllVideos">
        <div class="gloss-all-videos-view">
          <q-btn
            flat
            no-caps
            color="primary"
            class="gloss-all-videos-back q-mb-sm"
            :label="translate('backToMainVideo')"
            icon="arrow_back"
            @click="showAllVideos = false"
          />

          <div class="gloss-all-videos-scroll">
            <VideosComponent
              :model-value="glossData"
              :edit-mode="false"
              hide-section-title
              horizontal-scroll
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-if="showSidebar"
          class="gloss-video-column"
        >
          <SignVideoAside
            :gloss-data="glossData"
            @show-all-videos="showAllVideos = true"
          />
        </div>

        <div class="gloss-content-column">
          <q-tabs
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
              name="definitions"
              :label="translate('definitions')"
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

          <div class="gloss-content-scroll">
            <q-tab-panels
              v-model="selectedTab"
              animated
              class="gloss-tab-panels"
            >
              <q-tab-panel
                name="definitions"
                class="q-pa-none"
              >
                <DefinitionsComponent
                  :gloss-data="glossData"
                  :edit-mode="false"
                  :allow-edit="false"
                  hide-section-title
                  hide-definition-video
                  hide-gloss-translations
                />
              </q-tab-panel>

              <q-tab-panel
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
import { computed, ref } from 'vue'
import { GlossData } from 'src/types/models'
import SignVideoAside from './SignVideoAside.vue'
import VideosComponent from './VideosComponent.vue'
import DefinitionsComponent from './DefinitionsComponent/DefinitionsComponent.vue'
import ExamplesComponent from './ExamplesComponent/ExamplesComponent.vue'
import RelatedGlosses from './RelatedGlosses.vue'
import translate from 'src/utils/translate'

const { glossData } = defineProps<{
  glossData: GlossData
}>()

const selectedTab = ref('definitions')
const showAllVideos = ref(false)

const primaryDefinition = computed(() =>
  [...(glossData.definitions || [])].sort((a, b) => a.priority - b.priority)[0]
)

const hasSignVideos = computed(() => (glossData.glossVideos?.length ?? 0) > 0)

const hasGlossTranslations = computed(() =>
  (glossData.glossTranslations?.length ?? 0) > 0
)

const showSidebar = computed(() => hasSignVideos.value || hasGlossTranslations.value)
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

.gloss-view-layout__header {
  flex: 0 0 auto;
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
}

.gloss-video-column {
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

.gloss-all-videos-view {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  align-items: flex-start;
}

.gloss-all-videos-back {
  flex: 0 0 auto;
}

.gloss-all-videos-scroll {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  align-self: stretch;
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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
  }

  .gloss-content-column {
    flex: 1 1 0;
    width: 100%;
  }
}
</style>
