<template>
  <q-page
    :style-fn="
      (header: number, height: number) => {
        return { height: `${height - header}px` };
      }
    "
    class="row items-center justify-evenly fit"
  >
    <q-card class="fit">
      <q-card-section>
        <div v-if="searchResult.length > 0">
          <div
            v-for="word in searchResult"
            :key="word.id"
          >
            <q-card>
              <q-card-section>
                <div class="text-h6">
                  {{ word.word }}
                </div>
                <div class="text-subtitle2">
                  {{ word.description }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div v-else>
          <div class="text-h6">
            No results found
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import axios from 'axios'
import type Word from 'src/types/word'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const searchResult = ref<Word[]>([])

onMounted(() => {
    search(route.query.search as string)
})

function search(word: string) {
    axios.get(`/api/words/search?q=${word}`).then((response) => {
        searchResult.value = response.data
    }).catch((error) => {
        console.log(error)
    })
}

</script>
  