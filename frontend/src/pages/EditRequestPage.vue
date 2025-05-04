<template>
  <div>
    <div class="q-pa-md">
      <WordDetail 
        :word="wordData" 
        :edit-mode=" status === 'approved' ? 'full' : 'none'"   
        @update:word="(val) => wordData = val"
      >
        <template #buttons>
          <q-btn
            flat
            :label="translate('common.cancel')"
            color="grey"
            class="q-mr-sm"
            @click="$router.go(-1)"
          />
          <q-btn
            unelevated
            :label="translate('common.save')"
            color="primary"
            type="submit"
            @click="saveWordRequest"
          />
        </template>
      </WordDetail>
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import {  useRoute, useRouter } from 'vue-router'
  import { useQuasar } from 'quasar'
  import { api } from 'src/services/api'
  import WordDetail from 'src/components/WordDetail.vue'
  import {  Word } from 'src/types/database'
  import type { WordRequest } from 'src/types/database'
  import translate from 'src/utils/translate'
  
  const $q = useQuasar()
  const route = useRoute()
  const router = useRouter()
  const status = ref('')
  // Initialize empty word data for the request
  const wordData = ref<Word>({} as Word)
  
  // Save word request
  function saveWordRequest() {
    api.wordRequests.approve(route.params.id as string, wordData.value)
      .then((response) => {
        console.log('Word request saved:', response.data)
        $q.notify({
          color: 'positive',
          message: translate('wordRequestSaved'),
          icon: 'check'
        })
        router.push('/confirm-request').catch(() => {
          console.error('Error redirecting to confirm request')
        })
      })
      .catch((error: Error) => {
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
    api.wordRequests.get(route.params.id as string)
      .then((response) => {
        status.value = (response.data as WordRequest).status
        wordData.value = (response.data as WordRequest).requestedWordData
      })
      .catch((error: Error) => {
        console.error('Error fetching word request:', error)
        $q.notify({
          color: 'negative',
          message: translate('errorFetchingWordRequest'),
          icon: 'error'
        })
      })
  }
  </script>
  