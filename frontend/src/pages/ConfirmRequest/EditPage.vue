<template>
  <div>
    <div class="q-pa-md">
      <WordDetail 
        :word="wordData" 
        :edit-mode="'full'"
        :over-write-save-button="translate('common.approve')"
      >
        <template #buttons>
          <q-btn
            flat
            :label="translate('common.reject')"
            color="grey"
            class="q-mr-sm"
            @click="rejectWordRequest()"
          />
          <q-btn
            flat
            :label="translate('common.approve')"
            color="primary"
            type="submit"
            @click="approveWordRequest()"
          />
        </template>
      </WordDetail>
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
    
    function approveWordRequest() {
      api.wordRequests.approve(route.params.id as string, wordData.value).then((response) => {
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

    function rejectWordRequest() {
      api.wordRequests.reject(route.params.id as string, 'reject reason').then((response) => {
        console.log('Word request rejected:', response.data)
      }).catch((error) => {
        console.error('Error rejecting word request:', error)
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
    