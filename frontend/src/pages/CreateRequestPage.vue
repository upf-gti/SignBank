<template>
  <div>
    <div class="q-pa-md">
      <WordDetail 
        :word="wordData" 
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
import type { Word, WordEntry } from 'src/types/word'
import { WordStatus, Hand, Language } from 'src/types/word'
import translate from 'src/utils/translate'

const $q = useQuasar()
const router = useRouter()

// Initialize empty word data for the request
const wordData = ref<Word>({
  id: '',
  word: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  creatorId: '',
  isNative: true,
  status: WordStatus.PUBLISHED,
  currentVersion: 1,
  isCreatedFromRequest: true,
  isCreatedFromEdit: false,
  senses: [{
    priority: 1,
    dominantHand: Hand.RIGHT,
    facialExpression: 'neutral',
    hasContact: true,
    descriptions: [{ text: 'test', examples: ['test'], translations: [{ translation: 'test', language: Language.CATALAN }] }]
  }],
  relatedWords: [] // Add this to satisfy the Word interface
})

// Save word request
async function saveWordRequest(word: WordEntry) {
  try {
    // Set flag to indicate this is a request
    word.isCreatedFromRequest = true
    
    // Create request payload with only the fields needed by the backend (using Word type)
    const requestPayload: WordEntry = {
      wordData: word.wordData,
      
      isNative: word.isNative,
      senses: word.senses,
      relatedWords: word.relatedWords || [],
      dominantHand: word.dominantHand,
      facialExpression: word.facialExpression,
      hasContact: word.hasContact,
      lexicalCategory: word.lexicalCategory,
      register: word.register
    };
    
    // Submit using the format expected by the backend
    await api.wordRequests.post(requestPayload)
    
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
