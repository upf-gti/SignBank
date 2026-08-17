<template>
  <q-page
    class="column"
    :class="{ 'gloss-page': !editMode }"
  >
    <LoadingComponent
      v-if="loading"
      :loading="loading"
    />

    <div
      v-else-if="error"
      class="column items-center q-pa-xl"
    >
      <q-icon
        name="error_outline"
        size="48px"
        color="negative"
        class="q-mb-md"
      />
      <div class="text-negative text-h6 text-center q-mb-md">
        {{ error }}
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          outline
          icon="refresh"
          :label="translate('retry')"
          @click="getGlossData"
        />
        <q-btn
          flat
          icon="arrow_back"
          :label="translate('goBack')"
          @click="router.go(-1)"
        />
      </div>
    </div>

    <div
      v-else-if="glossData"
      class="gloss-page__content col column"
      :class="{ 'gloss-page__content--editing': editMode }"
    >
      <div
        v-if="!editMode"
        class="gloss-page__toolbar q-px-md q-pt-sm"
      >
        <q-btn
          flat
          icon="arrow_back"
          :label="translate('backToSearch')"
          @click="router.push('/search')"
        />
      </div>

      <GlossDetailComponent
        v-model:edit-mode="editMode"
        class="gloss-page__detail col column"
        :class="{ 'gloss-page__detail--editing': editMode }"
        :gloss-data="glossData"
        :allow-edit="true"
        :constrained-layout="!editMode"
        @save-gloss="saveGloss"
        @update:gloss-data="updateGlossData"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import translate from 'src/utils/translate'
import LoadingComponent from 'src/components/LoadingComponent.vue'
import GlossDetailComponent from 'src/components/GlossDetail/GlossDetailComponent.vue'
import { api } from 'src/services/api'
import type { GlossData } from 'src/types/models'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const editMode = ref(false)
const glossData = ref<GlossData | null>(null)

onMounted(() => {
  getGlossData()
})

watch(() => route.fullPath, () => {
  loading.value = true
  glossData.value = null
  getGlossData()
})

function getGlossData() {
  if (route.params.gloss) {
    loading.value = true
    error.value = null
    api.glosses.get(route.params.gloss as string)
      .then((response) => {
        glossData.value = response.data
      })
      .catch((err) => {
        console.error(err)
        error.value = translate('errors.failedToLoadGloss')
      }).finally(() => {
        loading.value = false
      })
  }
}

const saveGloss = async (updatedGlossData: GlossData) => {
  try {
    loading.value = true
    const response = await api.glossData.editGloss(updatedGlossData.id || '', updatedGlossData)
    glossData.value = response.data
    editMode.value = false
  } catch (err) {
    console.error(err)
    error.value = translate('errors.failedToSaveGloss')
  } finally {
    loading.value = false
  }
}

const updateGlossData = (updatedGlossData: GlossData) => {
  glossData.value = updatedGlossData
}
</script>

<style scoped>
.gloss-page {
  height: calc(100vh - 64px);
  max-height: calc(100vh - 64px);
  overflow-x: visible;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.gloss-page__content {
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
  overflow-x: visible;
  overflow-y: hidden;
}

.gloss-page__content--editing {
  flex: 1 1 auto;
  min-height: auto;
  height: auto;
  overflow: visible;
}

.gloss-page__toolbar {
  flex: 0 0 auto;
}

.gloss-page__detail {
  flex: 1 1 0;
  min-height: 0;
  height: 100%;
  overflow-x: visible;
  overflow-y: hidden;
}

.gloss-page__detail--editing {
  flex: 1 1 auto;
  min-height: auto;
  height: auto;
  overflow: visible;
}
</style>
