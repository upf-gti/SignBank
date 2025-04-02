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
  import { ref, onMounted } from 'vue'
  import {  useRoute } from 'vue-router'
  import { useQuasar } from 'quasar'
  import { api } from 'src/services/api'
  import WordDetail from 'src/components/WordDetail.vue'
  import {  Word } from 'src/types/word'
  import type { WordRequest } from 'src/types/wordRequest'
  import translate from 'src/utils/translate'
  
  const $q = useQuasar()
  const route = useRoute()
  
  // Initialize empty word data for the request
  const wordData = ref<Word>({} as Word)
  
  // Save word request
    function saveWordRequest(word: Word) {
    api.wordRequests.put(route.params.id as string, word).then((response) => {
      console.log('Word request saved:', response.data)
    }).catch((error) => {
      console.error('Error saving word request:', error)
      $q.notify({
        color: 'negative',
        message: translate('errorSavingWordRequest'),
        icon: 'error'
      })
    })
  }

  onMounted(() => {
    fetchWordRequest()
  })

  function fetchWordRequest() {
    api.wordRequests.get(route.params.id as string).then((response) => {
      wordData.value = (response.data as WordRequest).requestedWordData
    }).catch((error) => {
      console.error('Error fetching word request:', error)
      $q.notify({
        color: 'negative',
        message: translate('errorFetchingWordRequest'),
        icon: 'error'
      })
    })
  }
  </script>
  