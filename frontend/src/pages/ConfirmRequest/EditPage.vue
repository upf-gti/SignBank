<template>
  <div>
    <div class="q-pa-md">
      <WordDetail 
        :word="wordData" 
        :edit-mode="'full'"
        @update:word="(val) => {
          wordData = val
          console.log('wordData', wordData)
        }"
      >
        <template #buttons>
          <q-btn
            flat
            :label="translate('common.reject')"
            color="grey"
            class="q-mr-sm"
            @click="showRejectDialog()"
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
      }).finally(() => {
        router.push('/confirm-requests').catch(() => {
          console.error('Error redirecting to confirm request')
        })
      })
    }

    function showRejectDialog() {
      $q.dialog({
        title: translate('common.rejectRequest'),
        message: translate('common.enterRejectReason'),
        prompt: {
          model: '',
          type: 'text',
          isValid: val => val.length > 0,
          outlined: true,
          autofocus: true
        },
        cancel: true,
        persistent: true
      }).onOk((rejectReason: string) => {
        rejectWordRequest(rejectReason)
      })
    }

    function rejectWordRequest(rejectReason: string) {
      api.wordRequests.reject(route.params.id as string, rejectReason).then((response) => {
        console.log('Word request rejected:', response.data)
        $q.notify({
          color: 'positive',
          message: translate('common.requestRejected'),
          icon: 'check'
        })
      }).catch((error) => {
        console.error('Error rejecting word request:', error)
        $q.notify({
          color: 'negative',
          message: translate('common.errorRejectingRequest'),
          icon: 'error'
        })
      }).finally(() => {
        router.push('/confirm-requests').catch(() => {
          console.error('Error redirecting to confirm request')
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
    