<template>
  <div>
    <div class="q-pa-md">
      <WordDetail 
        v-model:word="wordData" 
        :edit-mode="'full'"
        @save="saveWordRequest"
        @cancel="$router.go(-1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/services/api'
import WordDetail from 'src/components/WordDetail.vue'
import type { Word } from 'src/types/database'
import { Language } from 'src/types/database'
import translate from 'src/utils/translate'

const $q = useQuasar()
const router = useRouter()

// Initialize empty word data for the request
const wordData = ref<Word>({
  word: '',
  isNative: true,
  senses: [{
    priority: 1,
    definitions: [{ definition: 'test', examples: ['test'], translations: [{ translation: 'test', language: Language.CATALAN }] }],
    videos: []
  }],
  relatedWords: [] // Add this to satisfy the Word interface
})

// Save word request
async function saveWordRequest(word: Word) {
  try {
    
    // Submit using the format expected by the backend
    await api.wordRequests.post(word)
    
    // Show success message
    $q.notify({
      color: 'positive',
      message: translate('create_request.success'),
      icon: 'check_circle'
    })
    
    // Navigate back to the dashboard or requests list
    await router.push('/requests')
    
  } catch (error) {
    console.error('Error submitting word request:', error)
    $q.notify({
      color: 'negative',
      message: translate('create_request.error'),
      icon: 'error'
    })
  }
}
</script>
