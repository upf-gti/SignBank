<template>
  <q-page>
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
      v-else
      class="column full-width justify-center items-center"
      style="height: fit-content"
    >
      <GlossDetailComponent
        v-if="glossData"
        v-model:edit-mode="editMode"
        class="col full-width"
        :gloss-data="glossData"
        :allow-edit="true"
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

// State
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