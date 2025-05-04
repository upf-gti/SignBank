<template>
  <q-page
    :style-fn="
      (header: number, height: number) => {
        return { height: `${height - header}px` };
      }
    "
    class="column items-center justify-evenly "
  >
    <div
      v-if="loading"
      class="q-pa-xl row col fit"
    >
      <q-spinner
        size="3em"
        color="primary"
      />
      <span class="q-ml-sm">{{ translate('common.loading') }}</span>
    </div>
        
    <div
      v-else-if="error"
      class="text-center q-pa-md"
    >
      <div class="text-negative text-h6">
        {{ error }}
      </div>
      <q-btn
        color="primary"
        :label="translate('common.goBack')"
        class="q-mt-md"
        @click="$router.go(-1)"
      />
    </div>
        
    <div
      v-else
      class="column col full-width justify-center items-center"
    >
      <div class="row justify-between items-center q-py-sm full-width">
        <q-btn
          flat
          icon="arrow_back"
          :label="translate('common.back')"
          @click="$router.go(-1)"
        />
                
        <div
          v-if="editMode === 'none'"
          class="row q-gutter-sm q-px-md"
        >
          <q-btn
            outline
            color="primary"
            :label="translate('word_detail.action.requestEdit')"
            @click="startEdit('strict')"
          />
        </div>
      </div>
            
      <WordDetail
        class="col full-width" 
        :word="wordData ?? null" 
        :edit-mode="editMode"
        @save="saveWord"
        @cancel="cancelEdit"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { api } from 'src/services/api'
import WordDetail from 'src/components/WordDetail.vue'
import type { Word } from 'src/types/database';
import translate from 'src/utils/translate'

const route = useRoute()
const word = route.params.word as string

// State
const wordData = ref<Word>()
const loading = ref(true)
const error = ref<string | null>(null)
const editMode = ref<'none' | 'strict' | 'full'>('none')

// Fetch the word data
async function fetchWordData() {
    try {
        loading.value = true
        error.value = null
        
        // Get the word ID from the route
        const response = await api.words.details(word)
        
        if (response.data) {
            wordData.value = response.data
        } else {
            error.value = translate('word_detail.error.notFound')
        }
    } catch (err) {
        console.error('Error fetching word details:', err)
        error.value = translate('word_detail.error.loadingFailed')
    } finally {
        loading.value = false
    }
}

// Start editing in selected mode
function startEdit(mode: 'strict' | 'full') {
    editMode.value = mode
    
    if (mode === 'full') {
        // For full edit, we start with a new word
        wordData.value = {
            word: '',
            isNative: true,
            senses: [],
            relatedWords: []
        }
    }
}

// Save edited word
 function saveWord() {
  console.log('TODO')    
}

// Cancel editing
async function cancelEdit() {
    if (editMode.value === 'strict') {
        // If we're editing an existing word, reload it
        await fetchWordData()
    }
    
    editMode.value = 'none'
}

// Load data when component mounts
onMounted(async () => {
    await fetchWordData()
})
</script>